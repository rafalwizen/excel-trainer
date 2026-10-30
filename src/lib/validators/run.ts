import type { Check } from "@/content/schema";
import { parseCellRef, parseRange } from "./cells";
import { normalizeFormula } from "./normalize";
import {
  isErrorValue,
  type CheckOutcome,
  type CheckResults,
  type SnapshotCell,
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
    }
  });
  return { passed: results.every((r) => r.ok), results };
}
