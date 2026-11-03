import { describe, expect, it } from "vitest";
import { CATEGORIES } from "./categories";
import { lessonInvariants } from "./invariants";
import { allLessons, categories, getLesson, lessonSummaries } from "./registry";
import { lessonSchema, taskSchema, type Lesson } from "./schema";

// --- schema validation ---

const validTask = {
  title: "Zadanie",
  instructions: "Wpisz `Excel` w **A1**.",
  initialWorkbook: {
    sheets: [
      {
        name: "Arkusz1",
        rowCount: 20,
        columnCount: 8,
        cellData: { "0": { "0": { v: "Nagłówek" } } },
      },
    ],
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
  learningGoals: [
    "Odczytywać adresy komórek w arkuszu",
    "Wpisywać tekst i liczby",
    "Poprawiać wpisy w komórkach",
  ],
  estimatedMinutes: 15,
  tasks: [validTask],
};

describe("lesson schema", () => {
  it("parses a valid lesson and fills defaults", () => {
    const lesson = lessonSchema.parse(validLesson);
    expect(lesson.prerequisites).toEqual([]);
    expect(lesson.tasks[0].hints).toEqual(["Podpowiedź 1"]);
  });

  it("fills sheet dimension defaults", () => {
    const task = taskSchema.parse({
      ...validTask,
      initialWorkbook: {
        sheets: [{ name: "Arkusz1", cellData: {} }],
      },
    });
    expect(task.initialWorkbook.sheets[0].rowCount).toBe(30);
    expect(task.initialWorkbook.sheets[0].columnCount).toBe(10);
  });

  it("hints default to an empty array", () => {
    const { hints: _omit, ...taskWithoutHints } = validTask;
    const task = taskSchema.parse(taskWithoutHints);
    expect(task.hints).toEqual([]);
  });

  it("parses a multi-sheet workbook", () => {
    const task = taskSchema.parse({
      ...validTask,
      initialWorkbook: {
        sheets: [
          { name: "Faktury", cellData: {} },
          { name: "Podsumowanie", cellData: {} },
        ],
      },
    });
    expect(task.initialWorkbook.sheets.map((s) => s.name)).toEqual([
      "Faktury",
      "Podsumowanie",
    ]);
  });

  it("rejects a workbook without sheets", () => {
    expect(() =>
      taskSchema.parse({ ...validTask, initialWorkbook: { sheets: [] } }),
    ).toThrow();
  });

  it("rejects an invalid slug", () => {
    expect(() => lessonSchema.parse({ ...validLesson, slug: "Zła Nazwa" })).toThrow();
    expect(() => lessonSchema.parse({ ...validLesson, slug: "" })).toThrow();
  });

  it("rejects difficulty outside 1-3", () => {
    expect(() => lessonSchema.parse({ ...validLesson, difficulty: 4 })).toThrow();
    expect(() => lessonSchema.parse({ ...validLesson, difficulty: 0 })).toThrow();
  });

  it("rejects a category outside the taxonomy", () => {
    expect(() =>
      lessonSchema.parse({ ...validLesson, category: "Nieistniejąca" }),
    ).toThrow();
  });

  it("rejects fewer than 3 learning goals or too-short ones", () => {
    expect(() =>
      lessonSchema.parse({ ...validLesson, learningGoals: ["Za mało", "Celów"] }),
    ).toThrow();
    expect(() =>
      lessonSchema.parse({
        ...validLesson,
        learningGoals: ["ok", "Wpisywać dane w komórki", "Poprawiać błędne wpisy"],
      }),
    ).toThrow();
  });

  it("rejects an unrealistic time estimate", () => {
    expect(() =>
      lessonSchema.parse({ ...validLesson, estimatedMinutes: 0 }),
    ).toThrow();
    expect(() =>
      lessonSchema.parse({ ...validLesson, estimatedMinutes: 300 }),
    ).toThrow();
  });

  it("rejects prerequisites that are not valid slugs", () => {
    expect(() =>
      lessonSchema.parse({ ...validLesson, prerequisites: ["Zły Slug"] }),
    ).toThrow();
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
            sheets: [
              {
                ...validTask.initialWorkbook.sheets[0],
                rowCount: 1,
                columnCount: 1,
                cellData: { "5": { "5": { v: "poza" } } },
              },
            ],
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

  it("flags rangeValuesUnordered length mismatch", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          checks: [
            { type: "rangeValuesUnordered", range: "A1:A3", expected: [1, 2] },
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

  it("bounds checks per named sheet, not the first one", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          initialWorkbook: {
            sheets: [
              { name: "Arkusz1", rowCount: 20, columnCount: 8, cellData: {} },
              { name: "Dane", rowCount: 5, columnCount: 3, cellData: {} },
            ],
          },
          checks: [{ type: "cellValue", sheet: "Dane", cell: "H19", expected: 1 }],
        },
      ],
    });
    expect(lessonInvariants(lesson).join("\n")).toContain("poza arkuszem „Dane”");
  });

  it("flags a sheetExists check for a sheet that already exists", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          checks: [{ type: "sheetExists", name: "Arkusz1" }],
        },
      ],
    });
    expect(lessonInvariants(lesson).join("\n")).toContain("istnieje już");
  });

  it("flags a cellStyle check without any condition", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          checks: [{ type: "cellStyle", cell: "A1" }],
        },
      ],
    });
    expect(lessonInvariants(lesson).join("\n")).toContain(
      "co najmniej jednego warunku",
    );
  });

  it("accepts a cellStyle check with conditions and a new sheet to create", () => {
    const lesson = lessonSchema.parse({
      ...validLesson,
      tasks: [
        {
          ...validTask,
          checks: [
            { type: "cellStyle", cell: "A1", bold: true },
            { type: "sheetExists", name: "Raport" },
          ],
        },
      ],
    });
    expect(lessonInvariants(lesson)).toEqual([]);
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

  it("every lesson declares at least 3 learning goals and a time estimate", () => {
    for (const lesson of allLessons) {
      expect(lesson.learningGoals.length).toBeGreaterThanOrEqual(3);
      expect(lesson.estimatedMinutes).toBeGreaterThanOrEqual(5);
    }
  });

  it("prerequisites resolve to existing lessons", () => {
    const slugs = new Set(allLessons.map((l) => l.slug));
    for (const lesson of allLessons) {
      for (const prerequisite of lesson.prerequisites) {
        expect(slugs.has(prerequisite)).toBe(true);
      }
    }
  });

  it("categories are a unique, curated-order subset of the taxonomy", () => {
    expect(new Set(categories).size).toBe(categories.length);
    const order = CATEGORIES.filter((c) => categories.includes(c));
    expect(categories).toEqual(order);
    for (const lesson of allLessons) {
      expect(CATEGORIES).toContain(lesson.category);
    }
  });

  it("lessonSummaries mirror the registered lessons", () => {
    expect(lessonSummaries).toHaveLength(allLessons.length);
    for (const summary of lessonSummaries) {
      const lesson = getLesson(summary.slug);
      expect(lesson).toBeDefined();
      expect(summary.taskCount).toBe(lesson!.tasks.length);
      expect(summary.title).toBe(lesson!.title);
      for (const prerequisite of summary.prerequisites) {
        expect(prerequisite.title).toBe(getLesson(prerequisite.slug)?.title);
      }
    }
  });

  it("getLesson finds by slug", () => {
    const first = allLessons[0];
    expect(getLesson(first.slug)?.title).toBe(first.title);
    expect(getLesson("nie-istnieje")).toBeUndefined();
  });
});
