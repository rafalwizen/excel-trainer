import type { Lesson } from "../schema";

/**
 * Toy lesson used until the real content lands (Phase 5) — exercises the
 * whole pipeline: registry → runner → Univer → checks.
 */
export const demoLesson: Lesson = {
  slug: "demo",
  title: "Lekcja próbna",
  shortDescription: "Krótkie zadanie na rozgrzewkę — wpisz tekst do komórki.",
  category: "Podstawy",
  difficulty: 1,
  tasks: [
    {
      title: "Twoja pierwsza komórka",
      instructions:
        "Kliknij komórkę **A1**, wpisz tekst `Excel` i zatwierdź klawiszem **Enter**.",
      initialWorkbook: {
        sheetName: "Arkusz1",
        rowCount: 20,
        columnCount: 8,
        cellData: {},
      },
      hints: ["Kliknij raz komórkę A1 (lewym przyciskiem myszy)."],
      checks: [
        { type: "cellValue", cell: "A1", expected: "Excel" },
      ],
    },
  ],
};
