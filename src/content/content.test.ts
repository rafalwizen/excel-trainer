import { describe, expect, it } from "vitest";
import { lessonInvariants } from "./invariants";
import { allLessons, categories, getLesson } from "./registry";
import { lessonSchema, taskSchema, type Lesson } from "./schema";

// --- schema validation ---

const validTask = {
  title: "Zadanie",
  instructions: "Wpisz `Excel` w **A1**.",
  initialWorkbook: {
    sheetName: "Arkusz1",
    rowCount: 20,
    columnCount: 8,
    cellData: { "0": { "0": { v: "Nagłówek" } } },
  },
  hints: ["Podpowiedź 1"],
  checks: [{ type: "cellValue", cell: "A1", expected: "Excel" }],
};

const validLesson = {
  slug: "lekcja-testowa",
  title: "Lekcja testowa",
  shortDescription: "Opis",
  category: "Podstawy",
  difficulty: 1,
  tasks: [validTask],
};

describe("lesson schema", () => {
  it("parses a valid lesson and fills defaults", () => {
    const lesson = lessonSchema.parse(validLesson);
    expect(lesson.tasks[0].initialWorkbook.sheetName).toBe("Arkusz1");
    expect(lesson.tasks[0].hints).toEqual(["Podpowiedź 1"]);
  });

  it("hints default to an empty array", () => {
    const { hints: _omit, ...taskWithoutHints } = validTask;
    const task = taskSchema.parse(taskWithoutHints);
    expect(task.hints).toEqual([]);
  });

  it("rejects an invalid slug", () => {
    expect(() => lessonSchema.parse({ ...validLesson, slug: "Zła Nazwa" })).toThrow();
    expect(() => lessonSchema.parse({ ...validLesson, slug: "" })).toThrow();
  });

  it("rejects difficulty outside 1-3", () => {
    expect(() => lessonSchema.parse({ ...validLesson, difficulty: 4 })).toThrow();
    expect(() => lessonSchema.parse({ ...validLesson, difficulty: 0 })).toThrow();
  });

  it("rejects a task without checks", () => {
    expect(() =>
      lessonSchema.parse({
        ...validLesson,
        tasks: [{ ...validTask, checks: [] }],
      }),
    ).toThrow();
  });

  it("rejects a formula check without aliases", () => {
    expect(() =>
      lessonSchema.parse({
        ...validLesson,
        tasks: [
          {
            ...validTask,
            checks: [{ type: "cellFormula", cell: "B7", aliases: [] }],
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects more than 3 hints", () => {
    expect(() =>
      lessonSchema.parse({
        ...validLesson,
        tasks: [
          {
            ...validTask,
            hints: ["1", "2", "3", "4"],
          },
        ],
      }),
    ).toThrow();
  });
});

// --- invariants ---

describe("lessonInvariants", () => {
  it("accepts a consistent lesson", () => {
    expect(lessonInvariants(lessonSchema.parse(validLesson))).toEqual([]);
  });

  it("flags initial data outside the declared sheet bounds", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          initialWorkbook: {
            ...validTask.initialWorkbook,
            rowCount: 1,
            columnCount: 1,
            cellData: { "5": { "5": { v: "poza" } } },
          },
        },
      ],
    });
    const problems = lessonInvariants(lesson);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toContain("wykraczają");
  });

  it("flags a check pointing outside the sheet", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          checks: [{ type: "cellValue", cell: "Z9", expected: 1 }],
        },
      ],
    });
    expect(lessonInvariants(lesson).join("\n")).toContain("poza arkuszem");
  });

  it("flags rangeValues length mismatch", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          checks: [
            { type: "rangeValues", range: "A1:A3", expected: [1, 2] },
          ],
        },
      ],
    });
    expect(lessonInvariants(lesson).join("\n")).toContain("expected ma 2");
  });

  it("flags a check referencing a sheet that does not exist in the task", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          checks: [{ type: "cellValue", sheet: "Inny", cell: "A1", expected: 1 }],
        },
      ],
    });
    expect(lessonInvariants(lesson).join("\n")).toContain("nie istnieje");
  });
});

// --- registry (imports the real lesson files, so it validates shipped content) ---

describe("lesson registry", () => {
  it("has unique slugs and valid lessons", () => {
    const slugs = allLessons.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBeGreaterThan(0);
  });

  it("every registered lesson passes its invariants", () => {
    for (const lesson of allLessons as Lesson[]) {
      expect(lessonInvariants(lesson)).toEqual([]);
    }
  });

  it("getLesson finds by slug and categories are unique", () => {
    const first = allLessons[0];
    expect(getLesson(first.slug)?.title).toBe(first.title);
    expect(getLesson("nie-istnieje")).toBeUndefined();
    expect(new Set(categories).size).toBe(categories.length);
  });
});
