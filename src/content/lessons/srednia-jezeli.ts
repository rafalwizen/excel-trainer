import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 15 — conditional averages on a sales register: AVERAGEIF with a
 * text criterion, with a numeric one, then AVERAGEIFS with two criteria.
 * Region names in criteria carry Polish diacritics ("Północ") — instructions
 * always show the exact literal to copy.
 */
function salesSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Handlowiec" },
        "1": { v: "Region" },
        "2": { v: "Produkt" },
        "3": { v: "Sprzedaż (zł)" },
      },
      "1": { "0": { v: "Kowalski" }, "1": { v: "Północ" }, "2": { v: "A" }, "3": { v: 1200 } },
      "2": { "0": { v: "Nowak" }, "1": { v: "Południe" }, "2": { v: "B" }, "3": { v: 950 } },
      "3": { "0": { v: "Wiśniewska" }, "1": { v: "Północ" }, "2": { v: "B" }, "3": { v: 1500 } },
      "4": { "0": { v: "Wójcik" }, "1": { v: "Południe" }, "2": { v: "A" }, "3": { v: 800 } },
      "5": { "0": { v: "Kamińska" }, "1": { v: "Północ" }, "2": { v: "A" }, "3": { v: 2000 } },
      "6": { "0": { v: "Lewandowski" }, "1": { v: "Południe" }, "2": { v: "B" }, "3": { v: 1100 } },
      "7": { "0": { v: "Zielińska" }, "1": { v: "Północ" }, "2": { v: "B" }, "3": { v: 700 } },
      "8": { "0": { v: "Sobczak" }, "1": { v: "Południe" }, "2": { v: "A" }, "3": { v: 1300 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Sprzedaż", 20, 10, rows);
}

export const sredniaJezeliLesson: LessonInput = {
  slug: "srednia-jezeli",
  title: "Średnie warunkowe: AVERAGEIF",
  shortDescription:
    "AVERAGEIF i AVERAGEIFS: średnia tylko dla wybranego regionu, produktu albo progu kwoty.",
  category: "Formuły i funkcje",
  difficulty: 2,
  estimatedMinutes: 20,
  prerequisites: ["suma-jezeli"],
  learningGoals: [
    "Liczyć średnią dla wierszy spełniających warunek (AVERAGEIF)",
    "Stosować kryterium liczbowe, np. średnia dla sprzedaży >=1000",
    "Łączyć dwa warunki naraz funkcją AVERAGEIFS",
    "Wiedzieć, że AVERAGEIFS ignoruje puste komórki — i uważać na „brak” tekstu",
  ],
  tasks: [
    {
      title: "Średnia dla regionu — AVERAGEIF",
      instructions:
        "W **G2** (obok etykiety w F2) policz średnią sprzedaż handlowców z regionu **Północ**:\n" +
        '`=AVERAGEIF(B2:B9,"Północ",D2:D9)`\n' +
        "Budowa jak SUMIF: gdzie szukać, czego szukać, co liczyć.\n" +
        "(W polskim Excelu: **ŚREDNIA.JEŻELI** — ten arkusz liczy angielskie nazwy.)",
      initialWorkbook: salesSheet({ "1": { "5": { v: "Średnia Północ (zł)" } } }),
      hints: [
        "Skopiuj kryterium dokładnie: `Północ` z „ó”.",
        "Region Północ ma cztery transakcje: 1200, 1500, 2000 i 700.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "G2",
          aliases: ['=AVERAGEIF(B2:B9,"Północ",D2:D9)'],
        },
        { type: "cellValue", cell: "G2", expected: 1350, tolerance: 0.01 },
      ],
    },
    {
      title: "Kryterium liczbowe — średnia większych sprzedaży",
      instructions:
        "W **G3** policz średnią **tylko tych transakcji, które wyniosły co najmniej 1000 zł**:\n" +
        '`=AVERAGEIF(D2:D9,">=1000")`\n' +
        "Znowu: gdy warunek dotyczy samej kolumny z liczbami, trzeci argument odpada.",
      initialWorkbook: salesSheet({
        "1": { "5": { v: "Średnia Północ (zł)" }, "6": { f: '=AVERAGEIF(B2:B9,"Północ",D2:D9)' } },
        "2": { "5": { v: "Średnia >=1000 (zł)" } },
      }),
      hints: [
        "Próg obejmuje cudzysłowem: `\">=1000\"`.",
        "Pięć transakcji kwalifikuje się do średniej.",
      ],
      checks: [
        { type: "cellFormula", cell: "G3", aliases: ['=AVERAGEIF(D2:D9,">=1000")'] },
        { type: "cellValue", cell: "G3", expected: 1420, tolerance: 0.01 },
      ],
    },
    {
      title: "Dwa warunki naraz — AVERAGEIFS",
      instructions:
        "AVERAGEIF potrafi jeden warunek. Gdy chcesz **region ORAZ produkt**, weź AVERAGEIFS — uwaga, kolumna z liczbami idzie teraz **pierwsza**:\n" +
        'W **G4** wpisz średnią sprzedaż produktu **A** na Północy:\n' +
        '`=AVERAGEIFS(D2:D9,B2:B9,"Północ",C2:C9,"A")`\n' +
        "(Po polsku: **ŚREDNIA.WARUNKÓW**.)",
      initialWorkbook: salesSheet({
        "1": { "5": { v: "Średnia Północ (zł)" }, "6": { f: '=AVERAGEIF(B2:B9,"Północ",D2:D9)' } },
        "2": { "5": { v: "Średnia >=1000 (zł)" }, "6": { f: '=AVERAGEIF(D2:D9,">=1000")' } },
        "3": { "5": { v: "Północ, produkt A (zł)" } },
      }),
      hints: [
        "Kolejność argumentów to najczęstszy błąd: najpierw D2:D9 (średnia), potem pary warunków.",
        "Na Północy produkt A sprzedały Kowalski i Kamińska.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "G4",
          aliases: ['=AVERAGEIFS(D2:D9,B2:B9,"Północ",C2:C9,"A")'],
        },
        { type: "cellValue", cell: "G4", expected: 1600, tolerance: 0.01 },
      ],
    },
    {
      title: "Raport — średnia per produkt",
      instructions:
        "Na koniec porównaj produkty: w **G5** policz średnią sprzedaż produktu **B** (oba regiony):\n" +
        '`=AVERAGEIF(C2:C9,"B",D2:D9)`\n' +
        "Wynik porównaj z produktem A — zobaczysz, który ciągnie średnią w dół.",
      initialWorkbook: salesSheet({
        "1": { "5": { v: "Średnia Północ (zł)" }, "6": { f: '=AVERAGEIF(B2:B9,"Północ",D2:D9)' } },
        "2": { "5": { v: "Średnia >=1000 (zł)" }, "6": { f: '=AVERAGEIF(D2:D9,">=1000")' } },
        "3": { "5": { v: "Północ, produkt A (zł)" }, "6": { f: '=AVERAGEIFS(D2:D9,B2:B9,"Północ",C2:C9,"A")' } },
        "4": { "5": { v: "Średnia produktu B (zł)" } },
      }),
      hints: [
        "To znowu AVERAGEIF z jednym warunkiem tekstowym — wzorzec z pierwszego zadania.",
      ],
      checks: [
        { type: "cellFormula", cell: "G5", aliases: ['=AVERAGEIF(C2:C9,"B",D2:D9)'] },
        { type: "cellValue", cell: "G5", expected: 1062.5, tolerance: 0.01 },
      ],
    },
  ],
};
