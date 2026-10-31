import { z } from "zod";

/**
 * Content contract for lessons. Lessons live as plain TS modules in
 * src/content/lessons/ and are zod-parsed at registry load, so a malformed
 * lesson breaks the build instead of a user at runtime.
 */

const cellRef = z.string().regex(/^[A-Za-z]+[1-9][0-9]*$/, "Nieprawidłowy adres komórki (np. B5)");

const cellDatum = z.object({
  v: z.union([z.string(), z.number()]).optional(),
  t: z.number().optional(), // Univer cell value type, optional escape hatch
  // Pre-filled formula ("=SUM(A1)"), passed through to Univer's ICellData.f —
  // used when a task builds on a formula authored in an earlier task.
  f: z.string().optional(),
});

/** Initial workbook state for a task (single sheet, converted to Univer data at runtime). */
export const workbookInitSchema = z.object({
  sheetName: z.string().min(1).default("Arkusz1"),
  rowCount: z.number().int().min(1).max(200).default(30),
  columnCount: z.number().int().min(1).max(26).default(10),
  // row index -> column index -> cell data ("0" -> "1" -> { v: "Cena" })
  cellData: z.record(z.string(), z.record(z.string(), cellDatum)),
});
export type WorkbookInit = z.output<typeof workbookInitSchema>;

export const cellValueCheckSchema = z.object({
  type: z.literal("cellValue"),
  sheet: z.string().optional(), // defaults to the first sheet
  cell: cellRef,
  expected: z.union([z.string(), z.number(), z.boolean()]),
  tolerance: z.number().positive().optional(),
});

export const cellFormulaCheckSchema = z.object({
  type: z.literal("cellFormula"),
  sheet: z.string().optional(),
  cell: cellRef,
  /** Any accepted formula; Polish aliases are normalized before comparison. */
  aliases: z.array(z.string()).min(1),
  /** Tokens that must appear in the formula, e.g. ["$F$1", "B2"]. */
  mustInclude: z.array(z.string()).optional(),
});

export const rangeValuesCheckSchema = z.object({
  type: z.literal("rangeValues"),
  sheet: z.string().optional(),
  range: z.string(),
  /** One value per cell of the range (row-major); null means "expect empty". */
  expected: z.array(z.union([z.string(), z.number(), z.null()])),
  tolerance: z.number().positive().optional(),
});

export const rangeFilledCheckSchema = z.object({
  type: z.literal("rangeFilled"),
  sheet: z.string().optional(),
  range: z.string(),
  expectedCount: z.number().int().min(0),
});

export const checkSchema = z.discriminatedUnion("type", [
  cellValueCheckSchema,
  cellFormulaCheckSchema,
  rangeValuesCheckSchema,
  rangeFilledCheckSchema,
]);

export const taskSchema = z.object({
  title: z.string().min(1),
  /** Polish instructions; supports **bold**, `code`, lists (rendered by the runner). */
  instructions: z.string().min(1),
  initialWorkbook: workbookInitSchema,
  hints: z.array(z.string()).max(3).default([]),
  checks: z.array(checkSchema).min(1),
});

export const lessonSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.number().int().min(1).max(3),
  tasks: z.array(taskSchema).min(1),
});

export type CellValueCheck = z.output<typeof cellValueCheckSchema>;
export type CellFormulaCheck = z.output<typeof cellFormulaCheckSchema>;
export type RangeValuesCheck = z.output<typeof rangeValuesCheckSchema>;
export type RangeFilledCheck = z.output<typeof rangeFilledCheckSchema>;
export type Check = z.output<typeof checkSchema>;
export type Task = z.output<typeof taskSchema>;
export type Lesson = z.output<typeof lessonSchema>;
