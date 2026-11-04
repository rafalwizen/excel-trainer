import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 10 — statistics that office work actually needs: COUNTA vs COUNT,
 * MEDIAN, LARGE/SMALL. The last row's "brak" (text in a numeric column) is
 * deliberate — it makes the COUNTA/COUNT difference visible and shows that
 * MEDIAN/LARGE/SMALL ignore text. Function names are English (engine
 * requirement); instructions mention the Polish Excel equivalents.
 */
function scoresTable(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<
    string,
    Record<string, { v: string | number } | { f: string }>
  > = {
    "0": { "0": { v: "Pracownik" }, "1": { v: "Wynik (pkt)" } },
    "1": { "0": { v: "Kowalska" }, "1": { v: 45 } },
    "2": { "0": { v: "Nowak" }, "1": { v: 62 } },
    "3": { "0": { v: "Wiśniewska" }, "1": { v: 58 } },
    "4": { "0": { v: "Wójcik" }, "1": { v: 71 } },
    "5": { "0": { v: "Kamińska" }, "1": { v: 66 } },
    "6": { "0": { v: "Lewandowski" }, "1": { v: 54 } },
    "7": { "0": { v: "Zielińska" }, "1": { v: 80 } },
    "8": { "0": { v: "Sobczak" }, "1": { v: "brak" } },
  };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Szkolenie", 20, 8, rows);
}

export const funkcjeStatystyczneLesson: LessonInput = {
  slug: "funkcje-statystyczne",
  title: "Funkcje statystyczne w praktyce",
  shortDescription:
    "COUNTA, COUNT, MEDIAN, LARGE i SMALL na wynikach szkolenia — statystyka, która naprawdę przydaje się w biurze.",
  category: "Formuły i funkcje",
  difficulty: 1,
  learningGoals: [
    "Liczyć wypełnione komórki funkcją COUNTA",
    "Odróżniać COUNTA od COUNT (liczby a dowolne wpisy)",
    "Wyznaczać medianę zbioru wyników",
    "Znajdować k-tą wartość od góry i od dołu (LARGE, SMALL)",
  ],
  estimatedMinutes: 15,
  tasks: [
    {
      title: "Ile ocen? — COUNTA i COUNT",
      instructions:
        "Wyniki testu stoją w B2:B9, ale Sobczak ma tam wpis `brak` zamiast liczby.\n" +
        "- w **E2** wpisz `=COUNTA(B2:B9)` — policzy WSZYSTKIE niepuste komórki\n" +
        "- w **E3** wpisz `=COUNT(B2:B9)` — policzy tylko liczby\n" +
        "Porównaj wyniki: różnica to jedna komórka z tekstem.\n" +
        "(W tym arkuszu funkcje wpisujesz po angielsku. W polskim Excelu: **ILE.NIEPUSTYCH** i **ILE.LICZB**.)",
      initialWorkbook: scoresTable({
        "1": { "3": { v: "Liczba ocen" } },
        "2": { "3": { v: "Tylko liczby" } },
      }),
      hints: [
        "COUNTA liczy wszystko, co nie jest puste — także tekst; COUNT wyłącznie liczby.",
        "Obie formuły mają ten sam zakres B2:B9.",
      ],
      checks: [
        { type: "cellFormula", cell: "E2", aliases: ["=COUNTA(B2:B9)"] },
        { type: "cellValue", cell: "E2", expected: 8 },
        { type: "cellFormula", cell: "E3", aliases: ["=COUNT(B2:B9)"] },
        { type: "cellValue", cell: "E3", expected: 7 },
      ],
    },
    {
      title: "Środek stawki — MEDIAN",
      instructions:
        "Średnia bywa zawyżana przez skrajne wyniki; mediana pokazuje „typowego” pracownika.\n" +
        "W **E4** wpisz `=MEDIAN(B2:B9)`. Funkcja sama zignoruje tekst `brak` i posortuje liczby.\n" +
        "(Po polsku: **MEDIANA**.)",
      initialWorkbook: scoresTable({
        "1": { "3": { v: "Liczba ocen" }, "4": { f: "=COUNTA(B2:B9)" } },
        "2": { "3": { v: "Tylko liczby" }, "4": { f: "=COUNT(B2:B9)" } },
        "3": { "3": { v: "Mediana (pkt)" } },
      }),
      hints: [
        "Mediana to wartość środkowa po posortowaniu — dla 7 liczb jest to czwarta od dowolnej strony.",
        "Tekst `brak` w zakresie nie przeszkadza — funkcje statystyczne liczą tylko liczby.",
      ],
      checks: [
        { type: "cellFormula", cell: "E4", aliases: ["=MEDIAN(B2:B9)"] },
        { type: "cellValue", cell: "E4", expected: 62 },
      ],
    },
    {
      title: "Miejsca na podium — LARGE i SMALL",
      instructions:
        "Kierownik chce znać drugi wynik od góry i drugi od dołu (skrajne łatwo znaleźć, drugie już nie).\n" +
        "- w **E5** wpisz `=LARGE(B2:B9,2)` — druga największa wartość\n" +
        "- w **E6** wpisz `=SMALL(B2:B9,2)` — druga najmniejsza wartość\n" +
        "(Po polsku: **NAJWIĘKSZA** i **NAJMIEJSZA**.)",
      initialWorkbook: scoresTable({
        "1": { "3": { v: "Liczba ocen" }, "4": { f: "=COUNTA(B2:B9)" } },
        "2": { "3": { v: "Tylko liczby" }, "4": { f: "=COUNT(B2:B9)" } },
        "3": { "3": { v: "Mediana (pkt)" }, "4": { f: "=MEDIAN(B2:B9)" } },
        "4": { "3": { v: "2. od góry" } },
        "5": { "3": { v: "2. od dołu" } },
      }),
      hints: [
        "Drugi argument to pozycja: `2` znaczy druga w kolejności od odpowiedniego końca.",
        "Funkcje ignorują tekst — liczą tylko na liczbach z zakresu.",
      ],
      checks: [
        { type: "cellFormula", cell: "E5", aliases: ["=LARGE(B2:B9,2)"] },
        { type: "cellValue", cell: "E5", expected: 71 },
        { type: "cellFormula", cell: "E6", aliases: ["=SMALL(B2:B9,2)"] },
        { type: "cellValue", cell: "E6", expected: 54 },
      ],
    },
    {
      title: "Rozstęp — funkcje w jednej formule",
      instructions:
        "Na koniec połącz poznane dziś i wczorajsze funkcje: w **E7** wpisz formułę, która policzy **rozstęp** wyników — różnicę między najlepszym a najsłabszym wynikiem:\n" +
        "`=MAX(B2:B9)-MIN(B2:B9)`\n" +
        "(MAX i MIN po polsku nazywają się tak samo.)",
      initialWorkbook: scoresTable({
        "1": { "3": { v: "Liczba ocen" }, "4": { f: "=COUNTA(B2:B9)" } },
        "2": { "3": { v: "Tylko liczby" }, "4": { f: "=COUNT(B2:B9)" } },
        "3": { "3": { v: "Mediana (pkt)" }, "4": { f: "=MEDIAN(B2:B9)" } },
        "4": { "3": { v: "2. od góry" }, "4": { f: "=LARGE(B2:B9,2)" } },
        "5": { "3": { v: "2. od dołu" }, "4": { f: "=SMALL(B2:B9,2)" } },
        "6": { "3": { v: "Rozstęp punktów" } },
      }),
      hints: [
        "Rozstęp = największa wartość minus najmniejsza.",
        "MIN i MAX poznane na lekcji o formułach podstawowych działają tu tak samo.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E7",
          aliases: ["=MAX(B2:B9)-MIN(B2:B9)"],
          mustInclude: ["MAX", "MIN", "B2:B9"],
        },
        { type: "cellValue", cell: "E7", expected: 35 },
      ],
    },
  ],
};
