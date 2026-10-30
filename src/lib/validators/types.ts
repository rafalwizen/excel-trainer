/**
 * Shape of the spreadsheet state the check engine operates on.
 * The Univer extractor (src/lib/univer/extract-snapshot.ts) produces it;
 * validators are pure functions over plain JSON, so they unit-test
 * without a browser.
 */
export interface SnapshotCell {
  /** Computed value; null when the cell is empty. Error values are strings starting with "#". */
  value: string | number | boolean | null;
  /** Raw formula including "=", or null for typed values. */
  formula: string | null;
}

export interface SnapshotSheet {
  /** Keys are uppercase refs like "A1". */
  cells: Record<string, SnapshotCell>;
}

export interface ValidationSnapshot {
  /** Keys are sheet names. First key is the active/only sheet. */
  sheets: Record<string, SnapshotSheet>;
}

export type CheckOutcome = { ok: true } | { ok: false; message: string };

export interface CheckResults {
  passed: boolean;
  /** One outcome per check, in the same order. */
  results: CheckOutcome[];
}

/** Excel-style error marker: "#NAME?", "#DIV/0!", "#VALUE!", ... */
export function isErrorValue(value: string | number | boolean | null): boolean {
  return typeof value === "string" && value.startsWith("#");
}
