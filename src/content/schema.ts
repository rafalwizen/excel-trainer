import { z } from "zod";
import { CATEGORIES } from "./categories";

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

/** One sheet of a task's initial workbook (converted to Univer data at runtime). */
export const sheetInitSchema = z.object({
  name: z.string().min(1).max(31),
  rowCount: z.number().int().min(1).max(200).default(30),
  columnCount: z.number().int().min(1).max(26).default(10),
  // row index -> column index -> cell data ("0" -> "1" -> { v: "Cena" })
  cellData: z.record(z.string(), z.record(z.string(), cellDatum)),
});

/**
 * Initial workbook state for a task: one or more named sheets. Most lessons
 * need a single sheet; multi-sheet lessons (e.g. cross-sheet references)
 * declare up to three.
 */
export const workbookInitSchema = z.object({
  sheets: z.array(sheetInitSchema).min(1).max(3),
});
export type SheetInit = z.output<typeof sheetInitSchema>;
export type WorkbookInit = z.output<typeof workbookInitSchema>;

/** The first sheet — the default target for checks without an explicit `sheet`. */
export function firstSheet(wb: WorkbookInit): SheetInit {
  return wb.sheets[0];
}

/** Resolves a sheet by name; undefined falls back to the first sheet. */
export function sheetByName(wb: WorkbookInit, name: string | undefined): SheetInit {
  if (!name) return wb.sheets[0];
  return wb.sheets.find((sheet) => sheet.name === name) ?? wb.sheets[0];
}

/** Convenience builder for the common single-sheet workbook. */
export function workbook(
  name: string,
  rowCount: number,
  columnCount: number,
  cellData: SheetInit["cellData"],
): WorkbookInit {
  return { sheets: [{ name, rowCount, columnCount, cellData }] };
}

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

/**
 * Formatting assertions. The extractor reads bold/italic, fill color and the
 * number-format pattern; this check compares only the asserted fields. At
 * least one condition must be set — enforced by invariants.ts (a refine()
 * here would break z.discriminatedUnion).
 */
export const cellStyleCheckSchema = z.object({
  type: z.literal("cellStyle"),
  sheet: z.string().optional(),
  cell: cellRef,
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  /** Any non-default fill color is enough. */
  backgroundSet: z.boolean().optional(),
  /** Any non-default number-format pattern is enough. */
  numberFormatSet: z.boolean().optional(),
  /** Exact pattern match (after normalization) against any of these. */
  numberFormatOneOf: z.array(z.string().min(1)).min(1).optional(),
});

/** Order-insensitive variant of rangeValues: multiset membership per value. */
export const rangeValuesUnorderedCheckSchema = z.object({
  type: z.literal("rangeValuesUnordered"),
  sheet: z.string().optional(),
  range: z.string(),
  /** Same length as the range size; order does not matter; null = empty cell. */
  expected: z.array(z.union([z.string(), z.number(), z.null()])),
  tolerance: z.number().positive().optional(),
});

/** The user must CREATE a sheet with this name (it must not pre-exist). */
export const sheetExistsCheckSchema = z.object({
  type: z.literal("sheetExists"),
  name: z.string().min(1).max(31),
});

export const checkSchema = z.discriminatedUnion("type", [
  cellValueCheckSchema,
  cellFormulaCheckSchema,
  rangeValuesCheckSchema,
  rangeFilledCheckSchema,
  cellStyleCheckSchema,
  rangeValuesUnorderedCheckSchema,
  sheetExistsCheckSchema,
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
  category: z.enum(CATEGORIES),
  difficulty: z.number().int().min(1).max(3),
  /** "Czego się nauczysz" — concrete outcome statements shown to learners. */
  learningGoals: z.array(z.string().min(8)).min(3).max(6),
  /** Rough time estimate in minutes, shown in the catalog. */
  estimatedMinutes: z.number().int().min(5).max(120),
  /** Slugs of lessons worth doing first (validated by the registry). */
  prerequisites: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(3).default([]),
  tasks: z.array(taskSchema).min(1),
});

export type CellValueCheck = z.output<typeof cellValueCheckSchema>;
export type CellFormulaCheck = z.output<typeof cellFormulaCheckSchema>;
export type RangeValuesCheck = z.output<typeof rangeValuesCheckSchema>;
export type RangeFilledCheck = z.output<typeof rangeFilledCheckSchema>;
export type CellStyleCheck = z.output<typeof cellStyleCheckSchema>;
export type RangeValuesUnorderedCheck = z.output<typeof rangeValuesUnorderedCheckSchema>;
export type SheetExistsCheck = z.output<typeof sheetExistsCheckSchema>;
export type Check = z.output<typeof checkSchema>;
export type Task = z.output<typeof taskSchema>;
export type Lesson = z.output<typeof lessonSchema>;
/**
 * Authoring-facing type: fields with schema defaults (e.g. prerequisites,
 * sheet dimensions, hints) are optional. Lesson files declare this type;
 * the registry zod-parses them into full Lesson objects.
 */
export type LessonInput = z.input<typeof lessonSchema>;
