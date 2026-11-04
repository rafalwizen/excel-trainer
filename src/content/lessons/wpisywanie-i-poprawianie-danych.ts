import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 2 — typing and fixing data: text vs numbers vs dates, overwriting
 * a cell and editing in place. Empirical note (Univer 1.3.1): a typed date
 * like 2026-03-15 is stored as the TEXT "2026-03-15" (only the display
 * pattern changes), so date checks compare plain strings. The two typos in
 * the base table are deliberate teaching material for tasks 2 and 3.
 */
function staffList(
  extraRows: Record<string, Record<string, { v: string | number }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number }>> = {
    "0": {
      "0": { v: "Pracownik" },
      "1": { v: "Dział" },
      "2": { v: "Godziny" },
      "3": { v: "Stawka (zł)" },
    },
    // Deliberate typos: "Nowakk" (task 2) and "Marketng" (task 3).
    "1": { "0": { v: "Anna Nowakk" }, "1": { v: "Marketng" }, "2": { v: 160 }, "3": { v: 60 } },
  };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Zespół", 20, 8, rows);
}

export const wpisywanieIPoprawianieDanychLesson: LessonInput = {
  slug: "wpisywanie-i-poprawianie-danych",
  title: "Wpisywanie i poprawianie danych",
  shortDescription:
    "Tekst, liczby i daty w praktyce: wpisywanie, nadpisywanie komórki i edycja treści w miejscu.",
  category: "Podstawy",
  difficulty: 1,
  learningGoals: [
    "Wpisywać tekst, liczby i daty we właściwych formatach",
    "Rozróżniać tekst i liczby po domyślnym wyrównaniu",
    "Nadpisywać całą komórkę nową wartością",
    "Edytować treść komórki w miejscu, bez przepisywania",
  ],
  estimatedMinutes: 20,
  tasks: [
    {
      title: "Nowy pracownik — tekst i liczby",
      instructions:
        "Do tabeli zespołu dopisz trzeci wiersz:\n" +
        "- **A3**: `Marek Kowalski`\n" +
        "- **B3**: `Księgowość`\n" +
        "- **C3**: `40`\n" +
        "- **D3**: `45`\n" +
        "Zauważ: tekst domyślnie przylega do **lewej**, a liczby do **prawej** — po tym poznasz, co arkusz potraktował jako liczbę.",
      initialWorkbook: staffList(),
      hints: [
        "Każdy wpis zatwierdzaj klawiszem Enter albo Tab — dopiero wtedy komórka zapamięta wartość.",
        "Godziny i stawkę wpisz jako same liczby (bez zł i bez spacji) — tylko takie wartości arkusz będzie mógł później liczyć.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A3:D3",
          expected: ["Marek Kowalski", "Księgowość", 40, 45],
        },
      ],
    },
    {
      title: "Poprawka przez nadpisanie",
      instructions:
        "W A2 jest literówka: `Anna Nowakk`. Kliknij tę komórkę i po prostu **zacznij pisać** poprawne nazwisko `Anna Nowak` — stara treść zniknie. Zatwierdź Enterem.",
      initialWorkbook: staffList({
        "2": {
          "0": { v: "Marek Kowalski" },
          "1": { v: "Księgowość" },
          "2": { v: 40 },
          "3": { v: 45 },
        },
      }),
      hints: [
        "Zaznaczoną komórkę nadpisuje się bez kasowania — pierwszy znak wpisuje czystą komórkę.",
        "Jeśli wpisesz coś przez pomyłkę, Esc anuluje wpis, a Ctrl+Z cofnie zatwierdzony.",
      ],
      checks: [{ type: "cellValue", cell: "A2", expected: "Anna Nowak" }],
    },
    {
      title: "Literówka w środku — edycja w komórce",
      instructions:
        "W B2 jest `Marketng` — literówka w środku wyrazu. Tym razem **nie nadpisuj** całej komórki: kliknij B2 **dwukrotnie** (albo zaznacz ją i wciśnij F2), ustaw kursor przed ostatnią literę i dopisz `i`, by powstało `Marketing`. Zatwierdź Enterem.",
      initialWorkbook: staffList({
        "1": { "0": { v: "Anna Nowak" } },
        "2": {
          "0": { v: "Marek Kowalski" },
          "1": { v: "Księgowość" },
          "2": { v: 40 },
          "3": { v: 45 },
        },
      }),
      hints: [
        "Dwuklik otwiera komórkę do edycji z zachowaniem jej treści; kursor strzałkami przenosisz między literami.",
        "Esc porzuca zmiany i wraca do poruszania się po arkuszu.",
      ],
      checks: [{ type: "cellValue", cell: "B2", expected: "Marketing" }],
    },
    {
      title: "Terminy zapłaty — daty",
      instructions:
        "Rozszerz tabelę o kolumnę terminów. Wpisz:\n" +
        "- **E1**: `Termin zapłaty`\n" +
        "- **E2**: `2026-03-15`\n" +
        "- **E3**: `2026-03-22`\n" +
        "- **E4**: `2026-04-01`\n" +
        "Daty wpisuj w formacie `RRRR-MM-DD` — arkusz rozpozna je jako daty i nada im format daty.",
      initialWorkbook: staffList({
        "1": { "0": { v: "Anna Nowak" }, "1": { v: "Marketing" } },
        "2": {
          "0": { v: "Marek Kowalski" },
          "1": { v: "Księgowość" },
          "2": { v: 40 },
          "3": { v: 45 },
        },
      }),
      hints: [
        "Format daty to cztery cyfry roku, dwie miesiąca i dwie dnia, rozdzielone myślnikami.",
        "Rok, miesiąc i dzień wpisuj dwucyfrowo tam, gdzie tak stanowi format: 03, nie 3.",
      ],
      checks: [
        { type: "cellValue", cell: "E1", expected: "Termin zapłaty" },
        {
          type: "rangeValues",
          range: "E2:E4",
          expected: ["2026-03-15", "2026-03-22", "2026-04-01"],
        },
      ],
    },
  ],
};
