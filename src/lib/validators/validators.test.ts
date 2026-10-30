import { describe, expect, it } from "vitest";
import type { Check } from "@/content/schema";
import { colToIndex, indexToCol, parseCellRef, parseRange } from "./cells";
import { normalizeFormula } from "./normalize";
import { runChecks } from "./run";
import type { ValidationSnapshot } from "./types";

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
  cells: Record<string, { value?: unknown; formula?: string | null }>,
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
