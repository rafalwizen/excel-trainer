import { refOf } from "@/lib/validators/cells";
import { normalizeColor, normalizePattern } from "@/lib/validators/styles";
import type { SnapshotCell, SnapshotStyle, ValidationSnapshot } from "@/lib/validators/types";

/**
 * Minimal structural surface of the Univer Facade API this module needs.
 * The real FWorkbook/FRange satisfy it; keeping it structural avoids
 * importing Univer types here (module also runs inside unit tests if ever
 * needed). Style reads are optional at runtime: if a facade build lacks
 * them, the snapshot simply carries no styles (style checks then fail
 * with their normal messages instead of crashing).
 */
export interface ExtractableRange {
  getValues(): unknown[][];
  getFormulas(): unknown[][];
  getCellStyles?(): unknown[][];
  getBackgrounds?(): unknown[][];
  getNumberFormats?(): unknown[][];
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

/** Rich-text style entries expose bold/italic getters; anything else = off. */
function normalizeFlag(v: unknown): boolean {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as { bold?: unknown; italic?: unknown }).bold === true
  );
}

function normalizeItalic(v: unknown): boolean {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as { bold?: unknown; italic?: unknown }).italic === true
  );
}

function extractStyle(
  range: ExtractableRange,
  row: number,
  col: number,
): SnapshotStyle {
  const empty = { bold: false, italic: false, background: null, numberFormat: null };
  const styles = range.getCellStyles?.()[row]?.[col];
  const backgrounds = range.getBackgrounds?.();
  const numberFormats = range.getNumberFormats?.();
  return {
    bold: styles ? normalizeFlag(styles) : false,
    italic: styles ? normalizeItalic(styles) : false,
    background: backgrounds ? normalizeColor(backgrounds[row]?.[col]) : null,
    numberFormat: numberFormats ? normalizePattern(numberFormats[row]?.[col]) : null,
  };
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
    const range = sheet.getRange(0, 0, rows, cols);
    const values = range.getValues();
    const formulas = range.getFormulas();
    const readStyles =
      range.getCellStyles !== undefined ||
      range.getBackgrounds !== undefined ||
      range.getNumberFormats !== undefined;

    const cells: Record<string, SnapshotCell> = {};
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = normalizeValue(values[row]?.[col]);
        const formula = normalizeFormula(formulas[row]?.[col]);
        const style = readStyles ? extractStyle(range, row, col) : null;
        const styled =
          style !== null &&
          (style.bold ||
            style.italic ||
            style.background !== null ||
            style.numberFormat !== null);
        // Keep empty cells out of the snapshot unless they carry formatting —
        // formatting-only tasks may target cells the learner has not filled.
        if (value === null && formula === null && !styled) continue;
        cells[refOf({ row, col })] = { value, formula, style };
      }
    }
    sheets[sheet.getSheetName()] = { cells };
  }
  return { sheets };
}
