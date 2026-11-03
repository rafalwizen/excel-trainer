import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 2 — the first formulas over a fixed price table. The Univer engine
 * evaluates English function names only, so instructions teach those and
 * mention the Polish Excel equivalents (SUMA, ŚREDNIA, ILE.LICZB) in passing.
 * Each task starts from the same base table plus its own report label.
 */
function priceTable(
  extraRows: Record<string, Record<string, { v: string | number }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number }>> = {
    "0": { "0": { v: "Produkt" }, "1": { v: "Cena (zł)" } },
    "1": { "0": { v: "Kawa" }, "1": { v: 12 } },
    "2": { "0": { v: "Herbata" }, "1": { v: 9 } },
    "3": { "0": { v: "Kakao" }, "1": { v: 11 } },
    "4": { "0": { v: "Sok" }, "1": { v: 29 } },
  };
  // Merge per row so extra labels never overwrite the base table.
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Arkusz1", 20, 8, rows);
}

export const formulyPodstawoweLesson: LessonInput = {
  slug: "formuly-podstawowe",
  title: "Formuły podstawowe: SUM, AVERAGE, MIN, MAX",
  shortDescription:
    "Pierwsze formuły: SUM, AVERAGE, MIN, MAX i COUNT na tabeli z cenami produktów.",
  category: "Formuły i funkcje",
  difficulty: 1,
  learningGoals: [
    "Pisać pierwsze formuły i sumować zakresy funkcją SUM",
    "Liczyć średnią, minimum i maksimum (AVERAGE, MIN, MAX)",
    "Stosować formuły odwołujące się do komórek, np. =B2*1.23",
    "Liczyć komórki z liczbami funkcją COUNT",
  ],
  estimatedMinutes: 20,
  tasks: [
    {
      title: "Twoja pierwsza formuła — SUM",
      instructions:
        "Formuła zawsze zaczyna się od znaku `=`. W komórce **E1** wpisz `=SUM(B2:B5)`, " +
        "aby zsumować ceny wszystkich produktów. " +
        "(W polskim Excelu funkcja nazywa się **SUMA** — ten arkusz liczy angielskie nazwy.)",
      initialWorkbook: priceTable({ "0": { "3": { v: "Suma (zł)" } } }),
      hints: [
        "Zakres `B2:B5` możesz wpisać z ręki albo zaznaczyć myszą, przeciągając po komórkach.",
        "Bez znaku `=` na początku arkusz uzna wpis za zwykły tekst.",
      ],
      checks: [
        { type: "cellFormula", cell: "E1", aliases: ["=SUM(B2:B5)"] },
        { type: "cellValue", cell: "E1", expected: 61 },
      ],
    },
    {
      title: "Średnia cena — AVERAGE",
      instructions:
        "W **E2** wpisz `=AVERAGE(B2:B5)`, aby policzyć średnią cenę. " +
        "(Po polsku: **ŚREDNIA**.)",
      initialWorkbook: priceTable({ "1": { "3": { v: "Średnia (zł)" } } }),
      hints: [
        "AVERAGE działa jak SUM, tylko jeszcze dzieli wynik przez liczbę komórek.",
      ],
      checks: [
        { type: "cellFormula", cell: "E2", aliases: ["=AVERAGE(B2:B5)"] },
        { type: "cellValue", cell: "E2", expected: 15.25, tolerance: 0.01 },
      ],
    },
    {
      title: "Skrajne ceny — MIN i MAX",
      instructions:
        "Dwie formuły naraz:\n" +
        "- w **E3** wpisz `=MIN(B2:B5)` — cena najtańszego produktu\n" +
        "- w **E4** wpisz `=MAX(B2:B5)` — cena najdroższego\n" +
        "(Po polsku funkcje nazywają się tak samo: MIN i MAX.)",
      initialWorkbook: priceTable({
        "2": { "3": { v: "Najtańsza (zł)" } },
        "3": { "3": { v: "Najdroższa (zł)" } },
      }),
      hints: [
        "Obie formuły różnią się tylko nazwą funkcji — zakres zostaje ten sam.",
      ],
      checks: [
        { type: "cellFormula", cell: "E3", aliases: ["=MIN(B2:B5)"] },
        { type: "cellValue", cell: "E3", expected: 9 },
        { type: "cellFormula", cell: "E4", aliases: ["=MAX(B2:B5)"] },
        { type: "cellValue", cell: "E4", expected: 29 },
      ],
    },
    {
      title: "Cena brutto — formuła na komórce",
      instructions:
        "Ceny w kolumnie B są netto. W **C2** wpisz `=B2*1.23`, aby policzyć cenę brutto kawy. " +
        "Formuła odwołuje się do B2, więc gdy zmienisz cenę netto, brutto przeliczy się samo.",
      initialWorkbook: priceTable({ "0": { "2": { v: "Cena brutto (zł)" } } }),
      hints: [
        "Gwiazdka `*` to mnożenie.",
        "Liczby dziesiętne wpisuj z kropką: `1.23`.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "C2",
          aliases: ["=B2*1.23", "=1.23*B2"],
          mustInclude: ["B2"],
        },
        { type: "cellValue", cell: "C2", expected: 14.76, tolerance: 0.01 },
      ],
    },
    {
      title: "Ile produktów? — COUNT",
      instructions:
        "W **E5** wpisz `=COUNT(B2:B5)`, aby policzyć komórki z liczbami — " +
        "czyli produkty z podaną ceną. (Po polsku: **ILE.LICZB**.)",
      initialWorkbook: priceTable({ "4": { "3": { v: "Liczba produktów" } } }),
      hints: [
        "COUNT liczy tylko liczby — nazwy produktów i nagłówek nie wchodzą do wyniku.",
      ],
      checks: [
        { type: "cellFormula", cell: "E5", aliases: ["=COUNT(B2:B5)"] },
        { type: "cellValue", cell: "E5", expected: 4 },
      ],
    },
  ],
};
