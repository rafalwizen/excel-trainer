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
      // row index -> column index -> { v, t } — same matrix shape as WorkbookInit
      cellData: WorkbookInit["cellData"];
    };
  };
}

const SHEET_ID = "sheet-1";

/** Converts a lesson task's initial workbook into Univer workbook data. */
export function toUniverWorkbook(init: WorkbookInit): UniverWorkbookLike {
  return {
    id: "workbook-1",
    sheetOrder: [SHEET_ID],
    styles: {},
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: init.sheetName,
        rowCount: init.rowCount,
        columnCount: init.columnCount,
        cellData: init.cellData,
      },
    },
  };
}
