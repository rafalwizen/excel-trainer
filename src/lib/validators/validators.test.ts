import { describe, expect, it } from "vitest";
import type { Check } from "@/content/schema";
import { colToIndex, indexToCol, parseCellRef, parseRange } from "./cells";
import { normalizeFormula } from "./normalize";
import { runChecks } from "./run";
import { normalizeColor, normalizePattern } from "./styles";
import type { SnapshotStyle, ValidationSnapshot } from "./types";

// --- cells helpers ---

describe("A1 helpers", () => {
  it("converts column letters to indexes and back", () => {
    expect(colToIndex("A")).toBe(0);
    expect(colToIndex("Z")).toBe(25);
    expect(colToIndex("AA")).toBe(26);
    expect(indexToCol(0)).toBe("A");
    expect(indexToCol(25)).toBe("Z");
    expect(indexToCol(26)).toBe("AA");
    expect(indexToCol(701)).toBe("ZZ");
  });

  it("parses cell refs", () => {
    expect(parseCellRef("B3")).toEqual({ row: 2, col: 1 });
    expect(parseCellRef("aa10")).toEqual({ row: 9, col: 26 });
    expect(parseCellRef("A0")).toBeNull();
    expect(parseCellRef("cos innego")).toBeNull();
  });

  it("parses ranges row-major and rejects reversed ones", () => {
    expect(parseRange("A1:B2")).toEqual(["A1", "B1", "A2", "B2"]);
    expect(parseRange("C3")).toEqual(["C3"]);
    expect(parseRange("B2:A1")).toBeNull();
    expect(parseRange("A1:B2:C3")).toBeNull();
  });
});

// --- formula normalization ---

describe("normalizeFormula", () => {
  it("strips =, whitespace and uppercases", () => {
    expect(normalizeFormula("=suma( b2 : b5 )")).toBe("SUM(B2:B5)");
    expect(normalizeFormula("=Sum(B2:B5)")).toBe("SUM(B2:B5)");
  });

  it("maps Polish function names to English", () => {
    expect(normalizeFormula("=ŚREDNIA(B2:B5)")).toBe("AVERAGE(B2:B5)");
    expect(normalizeFormula("=średnia(b2:b5)")).toBe("AVERAGE(B2:B5)");
    expect(normalizeFormula("=JEŻELI(A1>0;\"tak\";\"nie\")")).toBe(
      'IF(A1>0;"TAK";"NIE")',
    );
    expect(normalizeFormula("=ZAOKR(B2;2)")).toBe("ROUND(B2;2)");
  });

  it("replaces longer aliases first (LICZ.JEŻELI vs LICZ)", () => {
    expect(normalizeFormula("=LICZ.JEŻELI(A1:A9;\">5\")")).toBe(
      'COUNTIF(A1:A9;">5")',
    );
    expect(normalizeFormula("=SUMA.JEŻELI(B2:B10;A2;C2:C10)")).toBe(
      "SUMIF(B2:B10;A2;C2:C10)",
    );
  });

  it("keeps absolute references intact", () => {
    expect(normalizeFormula("=B2*(1+$F$1)")).toBe("B2*(1+$F$1)");
    expect(normalizeFormula("=b2*(1+$f$1)")).toBe("B2*(1+$F$1)");
  });
});

// --- check engine ---

function snapshot(
  cells: Record<
    string,
    { value?: unknown; formula?: string | null; style?: SnapshotStyle | null }
  >,
  sheet = "Arkusz1",
): ValidationSnapshot {
  return {
    sheets: {
      [sheet]: {
        cells: Object.fromEntries(
          Object.entries(cells).map(([ref, c]) => [
            ref,
            {
              value: (c.value ?? null) as never,
              formula: c.formula ?? null,
              style: c.style ?? null,
            },
          ]),
        ),
      },
    },
  };
}

describe("runChecks", () => {
  it("cellValue: passes on exact string", () => {
    const r = runChecks(
      [{ type: "cellValue", cell: "A1", expected: "Excel" }],
      snapshot({ A1: { value: "Excel" } }),
    );
    expect(r.passed).toBe(true);
  });

  it("cellValue: fails on mismatch with a Polish message", () => {
    const r = runChecks(
      [{ type: "cellValue", cell: "A1", expected: "Excel" }],
      snapshot({ A1: { value: "Excelka" } }),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toEqual({
      ok: false,
      message: `Komórka A1 powinna zawierać „Excel”, a zawiera „Excelka”.`,
    });
  });

  it("cellValue: treats missing cell as empty", () => {
    const r = runChecks(
      [{ type: "cellValue", cell: "B7", expected: 61 }],
      snapshot({}),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({ ok: false });
  });

  it("cellValue: numeric comparison with tolerance", () => {
    const check = {
      type: "cellValue",
      cell: "B8",
      expected: 15.25,
      tolerance: 0.01,
    } as const;
    expect(
      runChecks([check], snapshot({ B8: { value: 15.251 } })).passed,
    ).toBe(true);
    expect(
      runChecks([check], snapshot({ B8: { value: 15.4 } })).passed,
    ).toBe(false);
  });

  it("cellValue: error values always fail with a hint", () => {
    const r = runChecks(
      [{ type: "cellValue", cell: "B7", expected: 61 }],
      snapshot({ B7: { value: "#NAME?" } }),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({
      message: expect.stringContaining("#NAME?"),
    });
  });

  it("cellValue: string in a numeric check fails (no coercion)", () => {
    const r = runChecks(
      [{ type: "cellValue", cell: "B7", expected: 61 }],
      snapshot({ B7: { value: "61" } }),
    );
    expect(r.passed).toBe(false);
  });

  it("cellFormula: accepts a Polish alias of the expected formula", () => {
    const r = runChecks(
      [
        {
          type: "cellFormula",
          cell: "B7",
          aliases: ["=SUM(B2:B5)"],
        },
      ],
      snapshot({ B7: { value: 61, formula: "=suma(B2:B5)" } }),
    );
    expect(r.passed).toBe(true);
  });

  it("cellFormula: fails when the cell has a typed value", () => {
    const r = runChecks(
      [{ type: "cellFormula", cell: "B7", aliases: ["=SUM(B2:B5)"] }],
      snapshot({ B7: { value: 61 } }),
    );
    expect(r.results[0]).toMatchObject({
      message: expect.stringContaining("powinna zawierać formułę"),
    });
  });

  it("cellFormula: fails on a different formula", () => {
    const r = runChecks(
      [{ type: "cellFormula", cell: "B7", aliases: ["=SUM(B2:B5)"] }],
      snapshot({ B7: { value: 61, formula: "=SUM(B2:B4)" } }),
    );
    expect(r.passed).toBe(false);
  });

  it("cellFormula: mustInclude demands tokens like $F$1", () => {
    const ok = runChecks(
      [
        {
          type: "cellFormula",
          cell: "C2",
          aliases: ["=B2*(1+$F$1)"],
          mustInclude: ["$F$1", "B2"],
        },
      ],
      snapshot({ C2: { value: 17.26, formula: "=B2*(1+$F$1)" } }),
    );
    expect(ok.passed).toBe(true);

    const missing = runChecks(
      [
        {
          type: "cellFormula",
          cell: "C2",
          aliases: ["=B2*(1+$F$1)"],
          mustInclude: ["$F$1"],
        },
      ],
      snapshot({ C2: { value: 17.26, formula: "=B2*(1+F1)" } }),
    );
    // F1 vs $F$1: alias mismatch fires first
    expect(missing.passed).toBe(false);
  });

  it("cellFormula: formula returning an error fails", () => {
    const r = runChecks(
      [{ type: "cellFormula", cell: "B7", aliases: ["=SUM(B2:B5)"] }],
      snapshot({ B7: { value: "#NAME?", formula: "=SUMA(B2:B5)" } }),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({
      message: expect.stringContaining("błąd"),
    });
  });

  it("rangeValues: checks every cell in order", () => {
    const check: Check = {
      type: "rangeValues",
      range: "A2:A4",
      expected: ["Kawa", "Herbata", "Kakao"],
    };
    expect(
      runChecks([check], snapshot({ A2: { value: "Kawa" }, A3: { value: "Herbata" }, A4: { value: "Kakao" } })).passed,
    ).toBe(true);

    const bad = runChecks(
      [check],
      snapshot({ A2: { value: "Kawa" }, A3: { value: "Herbataa" }, A4: { value: "Kakao" } }),
    );
    expect(bad.results[0]).toMatchObject({
      message: expect.stringContaining("A3"),
    });
  });

  it("rangeValues: null expects an empty cell", () => {
    expect(
      runChecks(
        [{ type: "rangeValues", range: "B1:B2", expected: [1, null] }],
        snapshot({ B1: { value: 1 } }),
      ).passed,
    ).toBe(true);
    expect(
      runChecks(
        [{ type: "rangeValues", range: "B1:B2", expected: [1, null] }],
        snapshot({ B1: { value: 1 }, B2: { value: 2 } }),
      ).passed,
    ).toBe(false);
  });

  it("rangeFilled: counts non-empty cells", () => {
    const check: Check = { type: "rangeFilled", range: "C2:C6", expectedCount: 5 };
    const full = Object.fromEntries(
      ["C2", "C3", "C4", "C5", "C6"].map((ref) => [ref, { value: 1 }]),
    );
    expect(runChecks([check], snapshot(full)).passed).toBe(true);
    delete full.C5;
    const r = runChecks([check], snapshot(full));
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({ message: expect.stringContaining("4") });
  });

  it("resolves an explicit sheet name", () => {
    const snap: ValidationSnapshot = {
      sheets: {
        Arkusz1: { cells: {} },
        Dane: { cells: { A1: { value: 42, formula: null } } },
      },
    };
    expect(
      runChecks([{ type: "cellValue", sheet: "Dane", cell: "A1", expected: 42 }], snap)
        .passed,
    ).toBe(true);
  });

  it("reports a missing sheet instead of crashing", () => {
    const r = runChecks(
      [{ type: "cellValue", sheet: "Nieistniejący", cell: "A1", expected: 1 }],
      snapshot({}),
    );
    expect(r.passed).toBe(false);
  });

  it("returns one outcome per check, in order", () => {
    const r = runChecks(
      [
        { type: "cellValue", cell: "A1", expected: 1 },
        { type: "cellValue", cell: "A2", expected: 2 },
      ],
      snapshot({ A2: { value: 2 } }),
    );
    expect(r.results).toHaveLength(2);
    expect(r.results[0].ok).toBe(false);
    expect(r.results[1].ok).toBe(true);
  });
});

// --- style normalization (raw Univer values vs authored expectations) ---

describe("style normalization", () => {
  it("treats white, empty and none fills as no fill", () => {
    // Univer's getBackgrounds() returns "#fff" for unfilled cells.
    expect(normalizeColor("#fff")).toBeNull();
    expect(normalizeColor("#FFF")).toBeNull();
    expect(normalizeColor("#ffffff")).toBeNull();
    expect(normalizeColor("rgb(255, 255, 255)")).toBeNull();
    expect(normalizeColor("white")).toBeNull();
    expect(normalizeColor("")).toBeNull();
    expect(normalizeColor("none")).toBeNull();
    expect(normalizeColor(null)).toBeNull();
    expect(normalizeColor(undefined)).toBeNull();
  });

  it("normalizes real fills to comparison keys", () => {
    expect(normalizeColor("rgb(255, 230, 153)")).toBe("rgb(255,230,153)");
    expect(normalizeColor("  #FFE699 ")).toBe("#ffe699");
  });

  it("treats empty and General as no pattern", () => {
    // Univer's getNumberFormats() returns "" for the default format.
    expect(normalizePattern("")).toBeNull();
    expect(normalizePattern("General")).toBeNull();
    expect(normalizePattern("general")).toBeNull();
    expect(normalizePattern(null)).toBeNull();
  });

  it("normalizes patterns to comparison keys", () => {
    expect(normalizePattern('#,##0.00 "zł"')).toBe('#,##0.00"zł"');
    expect(normalizePattern("0 %")).toBe("0%");
    expect(normalizePattern("0.00 ZŁ")).toBe("0.00zł");
  });
});

// --- cellStyle check ---

const styled = (overrides: Partial<SnapshotStyle>): SnapshotStyle => ({
  bold: false,
  italic: false,
  background: null,
  numberFormat: null,
  ...overrides,
});

describe("cellStyle check", () => {
  it("passes when bold is set as expected", () => {
    const r = runChecks(
      [{ type: "cellStyle", cell: "A1", bold: true }],
      snapshot({ A1: { value: "Nagłówek", style: styled({ bold: true }) } }),
    );
    expect(r.passed).toBe(true);
  });

  it("fails with a Polish message when bold is missing", () => {
    const r = runChecks(
      [{ type: "cellStyle", cell: "A1", bold: true }],
      snapshot({ A1: { value: "Nagłówek", style: styled({}) } }),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({
      message: "Komórka A1 powinna mieć pogrubioną czcionkę.",
    });
  });

  it("a cell without style counts as unformatted", () => {
    const r = runChecks(
      [{ type: "cellStyle", cell: "B2", italic: true }],
      snapshot({ B2: { value: 5 } }),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({
      message: "Komórka B2 powinna mieć kursywę.",
    });
  });

  it("backgroundSet requires any fill color", () => {
    const check = { type: "cellStyle", cell: "A1", backgroundSet: true } as const;
    expect(
      runChecks(
        [check],
        snapshot({ A1: { value: 1, style: styled({ background: "#ffe699" }) } }),
      ).passed,
    ).toBe(true);
    expect(
      runChecks([check], snapshot({ A1: { value: 1, style: styled({}) } }))
        .passed,
    ).toBe(false);
  });

  it("numberFormatOneOf compares normalized patterns", () => {
    const check: Check = {
      type: "cellStyle",
      cell: "B2",
      numberFormatOneOf: ["#,##0.00 ZŁ", '#,##0.00 "zł"'],
    };
    expect(
      runChecks(
        [check],
        snapshot({
          B2: { value: 12.5, style: styled({ numberFormat: "#,##0.00 zł" }) },
        }),
      ).passed,
    ).toBe(true);
    expect(
      runChecks(
        [check],
        snapshot({ B2: { value: 12.5, style: styled({ numberFormat: "0%" }) } }),
      ).passed,
    ).toBe(false);
  });

  it("numberFormatSet fails for the default (General) format", () => {
    expect(
      runChecks(
        [{ type: "cellStyle", cell: "B2", numberFormatSet: true }],
        snapshot({ B2: { value: 1, style: styled({ numberFormat: null }) } }),
      ).passed,
    ).toBe(false);
    expect(
      runChecks(
        [{ type: "cellStyle", cell: "B2", numberFormatSet: false }],
        snapshot({ B2: { value: 1, style: styled({ numberFormat: null }) } }),
      ).passed,
    ).toBe(true);
  });

  it("checks only the asserted fields", () => {
    const r = runChecks(
      [{ type: "cellStyle", cell: "A1", bold: true }],
      snapshot({
        A1: { value: "X", style: styled({ bold: true, italic: true }) },
      }),
    );
    expect(r.passed).toBe(true);
  });
});

// --- rangeValuesUnordered check ---

describe("rangeValuesUnordered check", () => {
  it("passes regardless of order", () => {
    const check: Check = {
      type: "rangeValuesUnordered",
      range: "A1:A3",
      expected: ["Kawa", "Herbata", "Kakao"],
    };
    expect(
      runChecks(
        [check],
        snapshot({
          A1: { value: "Kakao" },
          A2: { value: "Kawa" },
          A3: { value: "Herbata" },
        }),
      ).passed,
    ).toBe(true);
  });

  it("fails when a value is missing", () => {
    const check: Check = {
      type: "rangeValuesUnordered",
      range: "A1:A3",
      expected: ["Kawa", "Herbata", "Kakao"],
    };
    const r = runChecks(
      [check],
      snapshot({
        A1: { value: "Kawa" },
        A2: { value: "Herbata" },
        A3: { value: "Sok" },
      }),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({
      message: expect.stringContaining("brakuje wartości „Kakao”"),
    });
  });

  it("counts duplicates — wrong repeat count fails", () => {
    const check: Check = {
      type: "rangeValuesUnordered",
      range: "A1:A2",
      expected: [5, 7],
    };
    expect(
      runChecks(
        [check],
        snapshot({ A1: { value: 5 }, A2: { value: 5 } }),
      ).passed,
    ).toBe(false);
  });

  it("numeric comparison honors tolerance", () => {
    const check: Check = {
      type: "rangeValuesUnordered",
      range: "A1:A2",
      expected: [1.1, 2.2],
      tolerance: 0.01,
    };
    expect(
      runChecks(
        [check],
        snapshot({ A1: { value: 2.205 }, A2: { value: 1.102 } }),
      ).passed,
    ).toBe(true);
  });

  it("null expects an empty cell somewhere in the range", () => {
    const check: Check = {
      type: "rangeValuesUnordered",
      range: "A1:A2",
      expected: [1, null],
    };
    expect(
      runChecks([check], snapshot({ A2: { value: 1 } })).passed,
    ).toBe(true);
    expect(
      runChecks(
        [check],
        snapshot({ A1: { value: 1 }, A2: { value: 2 } }),
      ).passed,
    ).toBe(false);
  });

  it("error values fail with a formula hint", () => {
    const check: Check = {
      type: "rangeValuesUnordered",
      range: "A1:A2",
      expected: [1, 2],
    };
    const r = runChecks(
      [check],
      snapshot({ A1: { value: "#DIV/0!" }, A2: { value: 2 } }),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({
      message: expect.stringContaining("#DIV/0!"),
    });
  });
});

// --- sheetExists check ---

describe("sheetExists check", () => {
  it("passes when the sheet exists", () => {
    const snap: ValidationSnapshot = {
      sheets: {
        Arkusz1: { cells: {} },
        Raport: { cells: { A1: { value: 1, formula: null } } },
      },
    };
    expect(
      runChecks([{ type: "sheetExists", name: "Raport" }], snap).passed,
    ).toBe(true);
  });

  it("fails with an actionable message when missing", () => {
    const r = runChecks(
      [{ type: "sheetExists", name: "Raport" }],
      snapshot({}),
    );
    expect(r.passed).toBe(false);
    expect(r.results[0]).toMatchObject({
      message: expect.stringContaining("dodaj go przyciskiem"),
    });
  });
});
