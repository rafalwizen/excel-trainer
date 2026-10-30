import { refOf } from "@/lib/validators/cells";
import type { SnapshotCell, ValidationSnapshot } from "@/lib/validators/types";

/**
 * Minimal structural surface of the Univer Facade API this module needs.
 * The real FWorkbook satisfies it; keeping it structural avoids importing
 * Univer types here (module also runs inside unit tests if ever needed).
 */
export interface ExtractableRange {
  getValues(): unknown[][];
  getFormulas(): unknown[][];
}

export interface ExtractableSheet {
  getSheetName(): string;
  getMaxRows(): number;
  getMaxColumns(): number;
  getRange(
    row: number,
    column: number,
    numRows: number,
    numColumns: number,
  ): ExtractableRange;
}

export interface ExtractableWorkbook {
  /** Commits an in-flight cell edit; defined by the sheets-ui facade mixin. */
  endEditingAsync(save?: boolean): Promise<boolean>;
  getSheets(): ExtractableSheet[];
}

function normalizeValue(v: unknown): SnapshotCell["value"] {
  if (v === null || v === undefined) return null;
  // Error values may surface as objects ({ v: "#NAME?" }) — unwrap once.
  if (typeof v === "object") {
    return normalizeValue((v as { v?: unknown }).v);
  }
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return v;
  }
  return null;
}

function normalizeFormula(f: unknown): string | null {
  return typeof f === "string" && f.length > 0 ? f : null;
}

/**
 * Reads the whole workbook into a plain-JSON snapshot for the check engine.
 * MUST be awaited after `endEditingAsync(true)` — clicking "Sprawdź" steals
 * focus mid-edit, and an uncommitted edit would be invisible to checks.
 */
export async function extractSnapshot(
  wb: ExtractableWorkbook,
): Promise<ValidationSnapshot> {
  try {
    await wb.endEditingAsync(true);
  } catch {
    // No active editor — nothing to commit.
  }

  const sheets: ValidationSnapshot["sheets"] = {};
  for (const sheet of wb.getSheets()) {
    const rows = sheet.getMaxRows();
    const cols = sheet.getMaxColumns();
    const values = sheet.getRange(0, 0, rows, cols).getValues();
    const formulas = sheet.getRange(0, 0, rows, cols).getFormulas();

    const cells: Record<string, SnapshotCell> = {};
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = normalizeValue(values[row]?.[col]);
        const formula = normalizeFormula(formulas[row]?.[col]);
        if (value === null && formula === null) continue;
        cells[refOf({ row, col })] = { value, formula };
      }
    }
    sheets[sheet.getSheetName()] = { cells };
  }
  return { sheets };
}
