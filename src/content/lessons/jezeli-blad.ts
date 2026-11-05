import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 16 — IFERROR around a division that genuinely fails: two product
 * rows have zero sales, so C/B there would be #DIV/0!. The last task reuses
 * COUNTIF (lesson 14) to count suppressed rows — a small real-world report.
 */
function returnsSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Produkt" },
        "1": { v: "Sprzedaż (szt.)" },
        "2": { v: "Zwroty (szt.)" },
      },
      "1": { "0": { v: "A4" }, "1": { v: 200 }, "2": { v: 10 } },
      "2": { "0": { v: "B7" }, "1": { v: 0 }, "2": { v: 0 } },
      "3": { "0": { v: "C2" }, "1": { v: 150 }, "2": { v: 12 } },
      "4": { "0": { v: "D9" }, "1": { v: 0 }, "2": { v: 0 } },
      "5": { "0": { v: "E5" }, "1": { v: 300 }, "2": { v: 24 } },
      "6": { "0": { v: "F1" }, "1": { v: 100 }, "2": { v: 5 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Zwroty", 20, 10, rows);
}

export const jezeliBladLesson: LessonInput = {
  slug: "jezeli-blad",
  title: "Obsługa błędów: IFERROR",
  shortDescription:
    "IFERROR: zamiast krzyżyka #DIV/0! w raporcie — czytelny tekst albo zero, dokładnie tam, gdzie ma być.",
  category: "Formuły i funkcje",
  difficulty: 2,
  estimatedMinutes: 20,
  prerequisites: ["logika-jezeli"],
  learningGoals: [
    "Rozpoznawać błędy formuł: #DIV/0!, #N/A, #NAME?",
    "Owinąć formułę funkcją IFERROR i podać wartość zastępczą",
    "Wybrać sensowną wartość zastępczą: 0, tekst czy pusty zapis",
    "Policzyć wiersze z błędem przez COUNTIF na wartości zastępczej",
  ],
  tasks: [
    {
      title: "Procent zwrotów — formuła z siatką bezpieczeństwa",
      instructions:
        "Chcemy policzyć, jaki udział sprzedaży wracał jako zwrot: w **D2** wpisz\n" +
        '`=IFERROR(C2/B2,0)`\n' +
        "IFERROR liczy `C2/B2`, a **gdy formuła zwróci błąd**, pokazuje wartość zastępczą — tu `0`.\n" +
        "(W polskim Excelu: **JEŻELI.BŁĄD** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: returnsSheet({ "0": { "3": { v: "Zwroty (%)" } } }),
      hints: [
        "Pierwszy argument to dowolna formuła — całe dzielenie `C2/B2`.",
        "Drugi argument pokazuje się TYLKO wtedy, gdy pierwszy zwróci błąd.",
      ],
      checks: [
        { type: "cellFormula", cell: "D2", aliases: ["=IFERROR(C2/B2,0)"] },
        { type: "cellValue", cell: "D2", expected: 0.05, tolerance: 0.001 },
      ],
    },
    {
      title: "Gdy błąd naprawdę się zdarzy",
      instructions:
        "Produkt **B7** nie sprzedał się ani raz — zero w B3. Gdybyś wpisał w **D3** samo `=C3/B3`, " +
        "arkusz pokazałby **#DIV/0!** (dzielenie przez zero). Zamiast tego wpisz:\n" +
        '`=IFERROR(C3/B3,"BRAK DANYCH")`\n' +
        "Tym razem wartością zastępczą jest **tekst** — raport mówi prawdę: nic nie sprzedano, więc nie ma czego liczyć.",
      initialWorkbook: returnsSheet({
        "0": { "3": { v: "Zwroty (%)" } },
        "1": { "3": { f: "=IFERROR(C2/B2,0)" } },
      }),
      hints: [
        "Tekst zastępczy w cudzysłowach, liczba bez — `0` i `\"BRAK DANYCH\"` to dwie różne zastępczości.",
        "Błąd nie zniknął — jest tylko elegancko obsłużony.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "D3",
          aliases: ['=IFERROR(C3/B3,"BRAK DANYCH")'],
        },
        { type: "cellValue", cell: "D3", expected: "BRAK DANYCH" },
      ],
    },
    {
      title: "Cała kolumna bez krzyżyków",
      instructions:
        "Skopiuj formułę z **D3** do **D4:D7** (uchwytem wypełniania albo Ctrl+C/V). " +
        "Dla wierszy z normalną sprzedażą IFERROR po prostu przepuści wynik dzielenia — `BRAK DANYCH` pojawi się tylko przy zerach.",
      initialWorkbook: returnsSheet({
        "0": { "3": { v: "Zwroty (%)" } },
        "1": { "3": { f: "=IFERROR(C2/B2,0)" } },
        "2": { "3": { f: '=IFERROR(C3/B3,"BRAK DANYCH")' } },
      }),
      hints: [
        "Adresy przesuwają się same: w D5 będzie =IFERROR(C5/B5,\"BRAK DANYCH\").",
        "Produkt D9 też ma zera — spodziewaj się dwóch wpisów BRAK DANYCH.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "D4:D7",
          expected: [0.08, "BRAK DANYCH", 0.08, 0.05],
          tolerance: 0.001,
        },
      ],
    },
    {
      title: "Raport — ile wierszy bez danych",
      instructions:
        "Na koniec policz zamaskowane błędy: w **F2** wpisz, ile wierszy kolumny D pokazuje `BRAK DANYCH`:\n" +
        '`=COUNTIF(D2:D7,"BRAK DANYCH")`\n' +
        "Dzięki wartości zastępczej błędy da się po prostu **policzyć** — czysty tekst `#DIV/0!` byłby do tego bezużyteczny.\n" +
        "(Siostrą IFERROR jest IFNA — łapie wyłącznie #N/A z wyszukiwań; poznasz ją w lekcji o VLOOKUP.)",
      initialWorkbook: returnsSheet({
        "0": { "3": { v: "Zwroty (%)" } },
        "1": {
          "3": { f: "=IFERROR(C2/B2,0)" },
          "5": { v: "Wiersze bez danych" },
        },
        "2": { "3": { f: '=IFERROR(C3/B3,"BRAK DANYCH")' } },
        "3": { "3": { f: '=IFERROR(C4/B4,"BRAK DANYCH")' } },
        "4": { "3": { f: '=IFERROR(C5/B5,"BRAK DANYCH")' } },
        "5": { "3": { f: '=IFERROR(C6/B6,"BRAK DANYCH")' } },
        "6": { "3": { f: '=IFERROR(C7/B7,"BRAK DANYCH")' } },
      }),
      hints: [
        "COUNTIF z lekcji o sumowaniu warunkowym — kryterium to tekst BRAK DANYCH.",
        "Liczą się tylko wiersze z zerową sprzedażą: B7 i D9.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "F2",
          aliases: ['=COUNTIF(D2:D7,"BRAK DANYCH")'],
        },
        { type: "cellValue", cell: "F2", expected: 2 },
      ],
    },
  ],
};
