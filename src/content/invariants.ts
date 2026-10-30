import { parseCellRef, parseRange } from "@/lib/validators/cells";
import type { Lesson } from "./schema";

/**
 * Authoring-time invariants beyond what zod can express: cells referenced by
 * checks and initial data must fit the declared sheet bounds, and range
 * expectations must match the range size. Returns a list of problems
 * (empty = lesson is consistent).
 */
export function lessonInvariants(lesson: Lesson): string[] {
  const problems: string[] = [];
  const at = (taskIndex: number) => `lekcja ${lesson.slug}, zadanie ${taskIndex + 1}`;

  lesson.tasks.forEach((task, taskIndex) => {
    const { rowCount, columnCount, cellData } = task.initialWorkbook;

    for (const [row, cols] of Object.entries(cellData)) {
      for (const [col] of Object.entries(cols)) {
        const r = Number(row);
        const c = Number(col);
        if (r >= rowCount || c >= columnCount) {
          problems.push(
            `${at(taskIndex)}: dane początkowe w (${row},${col}) wykraczają poza arkusz ${columnCount}×${rowCount}`,
          );
        }
      }
    }

    task.checks.forEach((check, checkIndex) => {
      const where = `${at(taskIndex)}, check ${checkIndex + 1}`;

      if (check.sheet && check.sheet !== task.initialWorkbook.sheetName) {
        problems.push(`${where}: arkusz „${check.sheet}” nie istnieje w zadaniu`);
      }

      const cell =
        check.type === "cellValue" || check.type === "cellFormula"
          ? check.cell
          : null;
      const singleRef = cell ? parseCellRef(cell) : null;
      if (singleRef) {
        if (singleRef.row >= rowCount || singleRef.col >= columnCount) {
          problems.push(`${where}: komórka ${cell} poza arkuszem`);
        }
      }

      if (check.type === "rangeValues" || check.type === "rangeFilled") {
        const refs = parseRange(check.range);
        if (!refs) {
          problems.push(`${where}: nieprawidłowy zakres „${check.range}”`);
        } else {
          const out = refs.some((ref) => {
            const p = parseCellRef(ref)!;
            return p.row >= rowCount || p.col >= columnCount;
          });
          if (out) problems.push(`${where}: zakres ${check.range} poza arkuszem`);
          if (
            check.type === "rangeValues" &&
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
