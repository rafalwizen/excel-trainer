import { parseCellRef, parseRange } from "@/lib/validators/cells";
import { normalizeFormula } from "@/lib/validators/normalize";
import { sheetByName, type Lesson } from "./schema";

/**
 * Authoring-time invariants beyond what zod can express: sheets must have
 * unique names, cells referenced by checks and initial data must fit the
 * bounds of the sheet they belong to, range expectations must match the
 * range size, a cellStyle check must assert at least one thing, and no
 * check may be satisfied by the task's initial workbook state (the runner
 * resets the sheet per task, so such a check would pass without work).
 * Returns a list of problems (empty = lesson is consistent).
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

      // The runner resets the sheet to initialWorkbook on every task, so a
      // check the initial state already satisfies would pass with zero work.
      // Static evaluation only: formula cells can hide a value match, but a
      // literal prefilled value or formula equal to the expectation is a bug.
      const initialDatum = (row: number, col: number) =>
        bounds.cellData[String(row)]?.[String(col)];

      // A cellValue on a cell the same task also style-checks is a data
      // guard (formatting task), not the learner's work — not presolved.
      const styledCells = new Set(
        task.checks
          .filter((other) => other.type === "cellStyle")
          .map((other) => other.cell.toUpperCase()),
      );

      const valueMatches = (
        actual: string | number | null | undefined,
        expected: string | number | boolean | null,
        tolerance?: number,
      ): boolean => {
        if (actual === undefined || actual === null) return expected === null;
        if (typeof expected === "boolean") return false;
        if (typeof expected === "number") {
          return (
            typeof actual === "number" &&
            Math.abs(actual - expected) <= (tolerance ?? 1e-9)
          );
        }
        return actual === expected;
      };

      if (check.type === "cellValue" && !styledCells.has(check.cell.toUpperCase())) {
        const pos = parseCellRef(check.cell)!;
        const datum = initialDatum(pos.row, pos.col);
        if (
          datum &&
          datum.f === undefined &&
          valueMatches(datum.v, check.expected, check.tolerance)
        ) {
          problems.push(
            `${where}: komórka ${check.cell} ma już oczekiwaną wartość w stanie początkowym — check zaliczy się bez pracy ucznia`,
          );
        }
      }

      if (check.type === "cellFormula") {
        const pos = parseCellRef(check.cell)!;
        const datum = initialDatum(pos.row, pos.col);
        if (
          datum?.f &&
          check.aliases.some((alias) => normalizeFormula(alias) === normalizeFormula(datum.f))
        ) {
          problems.push(
            `${where}: komórka ${check.cell} ma już oczekiwaną formułę w stanie początkowym — check zaliczy się bez pracy ucznia`,
          );
        }
      }

      if (check.type === "rangeValues" || check.type === "rangeValuesUnordered") {
        const refs = parseRange(check.range) ?? [];
        const actual: Array<string | number | null> = [];
        const allStatic = refs.every((ref) => {
          const p = parseCellRef(ref)!;
          const datum = initialDatum(p.row, p.col);
          if (datum?.f !== undefined) return false;
          actual.push(datum?.v ?? null);
          return true;
        });
        if (allStatic) {
          // Copy before splicing: check.expected belongs to the lesson object.
          const pool = [...check.expected];
          const matches =
            check.type === "rangeValues"
              ? actual.every((value, i) => valueMatches(value, check.expected[i], check.tolerance))
              : actual.every((value) => {
                  const idx = pool.findIndex((exp) =>
                    valueMatches(value, exp, check.tolerance),
                  );
                  if (idx === -1) return false;
                  pool.splice(idx, 1);
                  return true;
                });
          if (matches) {
            problems.push(
              `${where}: zakres ${check.range} ma już oczekiwane wartości w stanie początkowym — check zaliczy się bez pracy ucznia`,
            );
          }
        }
      }

      if (check.type === "rangeFilled" && check.expectedCount > 0) {
        const refs = parseRange(check.range) ?? [];
        const filled = refs.filter((ref) => {
          const p = parseCellRef(ref)!;
          const datum = initialDatum(p.row, p.col);
          return datum?.v !== undefined || datum?.f !== undefined;
        }).length;
        if (filled >= check.expectedCount) {
          problems.push(
            `${where}: zakres ${check.range} ma już ${filled} wypełnionych komórek w stanie początkowym — check zaliczy się bez pracy ucznia`,
          );
        }
      }

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
