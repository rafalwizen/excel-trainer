import type { Check } from "@/content/schema";
import { parseCellRef, parseRange } from "./cells";
import { normalizeFormula } from "./normalize";
import { normalizePattern } from "./styles";
import {
  isErrorValue,
  type CheckOutcome,
  type CheckResults,
  type SnapshotCell,
  type SnapshotStyle,
  type ValidationSnapshot,
} from "./types";

const numberFmt = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 6 });

/** Formats a cell value for Polish failure messages. */
function fmt(value: string | number | boolean | null): string {
  if (value === null) return "pustą komórkę";
  if (typeof value === "number") return numberFmt.format(value);
  if (typeof value === "boolean") return value ? "PRAWDA" : "FAŁSZ";
  return `„${value}”`;
}

function emptyCell(): SnapshotCell {
  return { value: null, formula: null };
}

/** Formatting of a cell nobody touched — everything off/default. */
function defaultStyle(): SnapshotStyle {
  return { bold: false, italic: false, background: null, numberFormat: null };
}

function getSheet(
  snapshot: ValidationSnapshot,
  sheet: string | undefined,
): { name: string; cells: Record<string, SnapshotCell> } | null {
  const name = sheet ?? Object.keys(snapshot.sheets)[0];
  if (!name || !snapshot.sheets[name]) return null;
  return { name, cells: snapshot.sheets[name].cells };
}

function getCell(
  snapshot: ValidationSnapshot,
  sheet: string | undefined,
  ref: string,
): SnapshotCell {
  const s = getSheet(snapshot, sheet);
  return s?.cells[ref.toUpperCase()] ?? emptyCell();
}

const DEFAULT_TOLERANCE = 1e-9;

function valuesEqual(
  actual: string | number | boolean | null,
  expected: string | number | boolean,
  tolerance?: number,
): boolean {
  if (isErrorValue(actual)) return false;
  if (typeof expected === "number") {
    return (
      typeof actual === "number" &&
      Math.abs(actual - expected) <= (tolerance ?? DEFAULT_TOLERANCE)
    );
  }
  return actual === expected;
}

function checkCellValue(
  snapshot: ValidationSnapshot,
  check: Extract<Check, { type: "cellValue" }>,
): CheckOutcome {
  const cell = getCell(snapshot, check.sheet, check.cell);
  if (isErrorValue(cell.value)) {
    return {
      ok: false,
      message: `Komórka ${check.cell} zawiera błąd (${cell.value}) — sprawdź formułę.`,
    };
  }
  if (!valuesEqual(cell.value, check.expected, check.tolerance)) {
    return {
      ok: false,
      message: `Komórka ${check.cell} powinna zawierać ${fmt(check.expected)}, a zawiera ${fmt(cell.value)}.`,
    };
  }
  return { ok: true };
}

function checkCellFormula(
  snapshot: ValidationSnapshot,
  check: Extract<Check, { type: "cellFormula" }>,
): CheckOutcome {
  const cell = getCell(snapshot, check.sheet, check.cell);
  if (!cell.formula) {
    return {
      ok: false,
      message: `Komórka ${check.cell} powinna zawierać formułę, a zawiera wpisaną wartość.`,
    };
  }
  if (isErrorValue(cell.value)) {
    return {
      ok: false,
      message: `Formuła w komórce ${check.cell} zwraca błąd (${cell.value}) — sprawdź jej składnię.`,
    };
  }
  const normalized = normalizeFormula(cell.formula);
  const aliases = check.aliases.map((a) => normalizeFormula(a));
  if (!aliases.includes(normalized)) {
    return {
      ok: false,
      message: `Formuła w komórce ${check.cell} powinna wyglądać tak: ${check.aliases[0]}.`,
    };
  }
  for (const token of check.mustInclude ?? []) {
    if (!normalized.includes(normalizeFormula(token))) {
      return {
        ok: false,
        message: `Formuła w komórce ${check.cell} powinna zawierać ${token}.`,
      };
    }
  }
  return { ok: true };
}

function checkRangeValues(
  snapshot: ValidationSnapshot,
  check: Extract<Check, { type: "rangeValues" }>,
): CheckOutcome {
  const refs = parseRange(check.range) ?? [];
  for (let i = 0; i < refs.length; i++) {
    const cell = getCell(snapshot, check.sheet, refs[i]);
    const expected = check.expected[i];
    if (isErrorValue(cell.value)) {
      return {
        ok: false,
        message: `Komórka ${refs[i]} zawiera błąd (${cell.value}) — sprawdź formułę.`,
      };
    }
    const ok =
      expected === null
        ? cell.value === null
        : valuesEqual(cell.value, expected, check.tolerance);
    if (!ok) {
      return {
        ok: false,
        message: `Komórka ${refs[i]} powinna zawierać ${fmt(expected)}, a zawiera ${fmt(cell.value)}.`,
      };
    }
  }
  return { ok: true };
}

function checkRangeFilled(
  snapshot: ValidationSnapshot,
  check: Extract<Check, { type: "rangeFilled" }>,
): CheckOutcome {
  const refs = parseRange(check.range) ?? [];
  const filled = refs.filter((ref) => {
    const cell = getCell(snapshot, check.sheet, ref);
    return cell.value !== null;
  }).length;
  if (filled !== check.expectedCount) {
    return {
      ok: false,
      message: `W zakresie ${check.range} powinny być ${check.expectedCount} wypełnione komórki, a jest ${filled}.`,
    };
  }
  return { ok: true };
}

function checkCellStyle(
  snapshot: ValidationSnapshot,
  check: Extract<Check, { type: "cellStyle" }>,
): CheckOutcome {
  const cell = getCell(snapshot, check.sheet, check.cell);
  const style = cell.style ?? defaultStyle();

  if (check.bold !== undefined && style.bold !== check.bold) {
    return {
      ok: false,
      message: check.bold
        ? `Komórka ${check.cell} powinna mieć pogrubioną czcionkę.`
        : `Komórka ${check.cell} nie powinna mieć pogrubionej czcionki.`,
    };
  }
  if (check.italic !== undefined && style.italic !== check.italic) {
    return {
      ok: false,
      message: check.italic
        ? `Komórka ${check.cell} powinna mieć kursywę.`
        : `Komórka ${check.cell} nie powinna mieć kursywy.`,
    };
  }
  const hasBackground = style.background !== null;
  if (check.backgroundSet !== undefined && hasBackground !== check.backgroundSet) {
    return {
      ok: false,
      message: check.backgroundSet
        ? `Komórka ${check.cell} powinna mieć kolor wypełnienia.`
        : `Komórka ${check.cell} nie powinna mieć koloru wypełnienia.`,
    };
  }
  const hasNumberFormat = style.numberFormat !== null;
  if (
    check.numberFormatSet !== undefined &&
    hasNumberFormat !== check.numberFormatSet
  ) {
    return {
      ok: false,
      message: check.numberFormatSet
        ? `Komórka ${check.cell} powinna mieć ustawiony format liczbowy (np. waluta).`
        : `Komórka ${check.cell} nie powinna mieć ustawionego formatu liczbowego.`,
    };
  }
  if (check.numberFormatOneOf) {
    const pattern = style.numberFormat;
    const matches =
      pattern !== null &&
      check.numberFormatOneOf.some(
        // Normalize both sides: snapshots from the extractor are already
        // normalized, but unit-test snapshots (and future producers) may not be.
        (candidate) => normalizePattern(candidate) === normalizePattern(pattern),
      );
    if (!matches) {
      return {
        ok: false,
        message: `Komórka ${check.cell} powinna mieć jeden z formatów liczbowych: ${check.numberFormatOneOf.join(" , ")}.`,
      };
    }
  }
  return { ok: true };
}

function checkRangeValuesUnordered(
  snapshot: ValidationSnapshot,
  check: Extract<Check, { type: "rangeValuesUnordered" }>,
): CheckOutcome {
  const refs = parseRange(check.range) ?? [];
  for (const ref of refs) {
    const cell = getCell(snapshot, check.sheet, ref);
    if (isErrorValue(cell.value)) {
      return {
        ok: false,
        message: `Komórka ${ref} zawiera błąd (${cell.value}) — sprawdź formułę.`,
      };
    }
  }
  // Multiset matching: every expected value must be matched by an unused cell,
  // so both missing values and wrong duplicate counts fail.
  const remaining = refs.map((ref) => getCell(snapshot, check.sheet, ref).value);
  for (const expected of check.expected) {
    const index = remaining.findIndex((value) =>
      expected === null ? value === null : valuesEqual(value, expected, check.tolerance),
    );
    if (index === -1) {
      return {
        ok: false,
        message: `W zakresie ${check.range} brakuje wartości ${fmt(expected)} — albo występuje zbyt mało razy.`,
      };
    }
    remaining.splice(index, 1);
  }
  return { ok: true };
}

function checkSheetExists(
  snapshot: ValidationSnapshot,
  check: Extract<Check, { type: "sheetExists" }>,
): CheckOutcome {
  if (!snapshot.sheets[check.name]) {
    return {
      ok: false,
      message: `Arkusz „${check.name}” nie istnieje — dodaj go przyciskiem + przy pasku arkuszy na dole.`,
    };
  }
  return { ok: true };
}

/** Runs all checks against a snapshot. Pure function, safe to unit-test. */
export function runChecks(
  checks: Check[],
  snapshot: ValidationSnapshot,
): CheckResults {
  const results = checks.map((check) => {
    switch (check.type) {
      case "cellValue":
        return checkCellValue(snapshot, check);
      case "cellFormula":
        return checkCellFormula(snapshot, check);
      case "rangeValues":
        return checkRangeValues(snapshot, check);
      case "rangeFilled":
        return checkRangeFilled(snapshot, check);
      case "cellStyle":
        return checkCellStyle(snapshot, check);
      case "rangeValuesUnordered":
        return checkRangeValuesUnordered(snapshot, check);
      case "sheetExists":
        return checkSheetExists(snapshot, check);
    }
  });
  return { passed: results.every((r) => r.ok), results };
}
