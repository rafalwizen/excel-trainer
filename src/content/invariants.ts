import { parseCellRef, parseRange } from "@/lib/validators/cells";
import { sheetByName, type Lesson } from "./schema";

/**
 * Authoring-time invariants beyond what zod can express: sheets must have
 * unique names, cells referenced by checks and initial data must fit the
 * bounds of the sheet they belong to, range expectations must match the
 * range size, and a cellStyle check must assert at least one thing. Returns
 * a list of problems (empty = lesson is consistent).
 */
export function lessonInvariants(lesson: Lesson): string[] {
  const problems: string[] = [];
  const at = (taskIndex: number) => `lekcja ${lesson.slug}, zadanie ${taskIndex + 1}`;

  lesson.tasks.forEach((task, taskIndex) => {
    const sheets = task.initialWorkbook.sheets;
    const sheetNames = new Set(sheets.map((sheet) => sheet.name));
    if (sheetNames.size !== sheets.length) {
      problems.push(`${at(taskIndex)}: nazwy arkuszy się powtarzają`);
    }

    for (const sheet of sheets) {
      for (const [row, cols] of Object.entries(sheet.cellData)) {
        for (const [col] of Object.entries(cols)) {
          const r = Number(row);
          const c = Number(col);
          if (r >= sheet.rowCount || c >= sheet.columnCount) {
            problems.push(
              `${at(taskIndex)}: dane początkowe w (${row},${col}) wykraczają poza arkusz „${sheet.name}” ${sheet.columnCount}×${sheet.rowCount}`,
            );
          }
        }
      }
    }

    task.checks.forEach((check, checkIndex) => {
      const where = `${at(taskIndex)}, check ${checkIndex + 1}`;

      if (check.type === "sheetExists") {
        if (sheetNames.has(check.name)) {
          problems.push(
            `${where}: arkusz „${check.name}” istnieje już w stanie początkowym — zadanie byłoby zaliczone od razu`,
          );
        }
        return;
      }

      if (check.sheet && !sheetNames.has(check.sheet)) {
        problems.push(`${where}: arkusz „${check.sheet}” nie istnieje w zadaniu`);
        // Bounds cannot be resolved against a sheet that does not exist.
        return;
      }
      const bounds = sheetByName(task.initialWorkbook, check.sheet);

      if (check.type === "cellStyle") {
        const hasCondition =
          check.bold !== undefined ||
          check.italic !== undefined ||
          check.backgroundSet !== undefined ||
          check.numberFormatSet !== undefined ||
          check.numberFormatOneOf !== undefined;
        if (!hasCondition) {
          problems.push(
            `${where}: cellStyle wymaga co najmniej jednego warunku (bold, italic, backgroundSet, numberFormatSet, numberFormatOneOf)`,
          );
        }
      }

      const cell =
        check.type === "cellValue" || check.type === "cellFormula" || check.type === "cellStyle"
          ? check.cell
          : null;
      const singleRef = cell ? parseCellRef(cell) : null;
      if (singleRef) {
        if (singleRef.row >= bounds.rowCount || singleRef.col >= bounds.columnCount) {
          problems.push(
            `${where}: komórka ${cell} poza arkuszem „${bounds.name}”`,
          );
        }
      }

      if (
        check.type === "rangeValues" ||
        check.type === "rangeFilled" ||
        check.type === "rangeValuesUnordered"
      ) {
        const refs = parseRange(check.range);
        if (!refs) {
          problems.push(`${where}: nieprawidłowy zakres „${check.range}”`);
        } else {
          const out = refs.some((ref) => {
            const p = parseCellRef(ref)!;
            return p.row >= bounds.rowCount || p.col >= bounds.columnCount;
          });
          if (out) {
            problems.push(
              `${where}: zakres ${check.range} poza arkuszem „${bounds.name}”`,
            );
          }
          if (
            (check.type === "rangeValues" || check.type === "rangeValuesUnordered") &&
            refs.length !== check.expected.length
          ) {
            problems.push(
              `${where}: zakres ${check.range} ma ${refs.length} komórek, a expected ma ${check.expected.length}`,
            );
          }
        }
      }
    });
  });

  return problems;
}
