import type { WorkbookInit } from "@/content/schema";

/**
 * Structural type matching the subset of Univer's IWorkbookData we build.
 * Kept local (instead of importing Univer types) so shared code stays
 * decoupled from Univer's type surface.
 */
export interface UniverWorkbookLike {
  id: string;
  sheetOrder: string[];
  styles: Record<string, never>;
  sheets: {
    [sheetId: string]: {
      id: string;
      name: string;
      rowCount: number;
      columnCount: number;
      // row index -> column index -> { v, t } — same matrix shape as SheetInit
      cellData: WorkbookInit["sheets"][number]["cellData"];
    };
  };
}

/**
 * Converts a lesson task's initial workbook into Univer workbook data.
 * The first sheet is first in sheetOrder, which is the sheet Univer opens on.
 */
export function toUniverWorkbook(init: WorkbookInit): UniverWorkbookLike {
  const sheets: UniverWorkbookLike["sheets"] = {};
  const sheetOrder = init.sheets.map((sheet, index) => {
    const id = `sheet-${index + 1}`;
    sheets[id] = {
      id,
      name: sheet.name,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      cellData: sheet.cellData,
    };
    return id;
  });
  return {
    id: "workbook-1",
    sheetOrder,
    styles: {},
    sheets,
  };
}
