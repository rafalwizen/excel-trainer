import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 22 — XLOOKUP, the modern successor of VLOOKUP. Takes separate
 * lookup and return arrays (so it can search to the LEFT), has a built-in
 * "not found" argument, and drops the column-number gymnastics. The price
 * list is intentionally the same warehouse the learner met in lesson 17.
 */
function catalogSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Kod" },
        "1": { v: "Produkt" },
        "2": { v: "Cena (zł)" },
        "4": { v: "Kod" },
        "5": { v: "Sztuk" },
        "7": { v: "Cena (zł)" },
        "8": { v: "Wartość (zł)" },
      },
      "1": { "0": { v: "K-101" }, "1": { v: "Papier A4" }, "2": { v: 24.9 }, "4": { v: "K-104" }, "5": { v: 3 } },
      "2": { "0": { v: "K-102" }, "1": { v: "Toner HP" }, "2": { v: 129.9 }, "4": { v: "K-102" }, "5": { v: 1 } },
      "3": { "0": { v: "K-103" }, "1": { v: "Notebook 15" }, "2": { v: 3400 }, "4": { v: "K-106" }, "5": { v: 2 } },
      "4": { "0": { v: "K-104" }, "1": { v: "Mysz bezprzewodowa" }, "2": { v: 89 }, "4": { v: "K-101" }, "5": { v: 10 } },
      "5": { "0": { v: "K-105" }, "1": { v: "Zeszyt A5" }, "2": { v: 6.5 }, "4": { v: "K-999" } },
      "6": { "0": { v: "K-106" }, "1": { v: "Monitor 24" }, "2": { v: 789 } },
      "7": { "0": { v: "K-107" }, "1": { v: "Długopis" }, "2": { v: 2.5 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Magazyn", 20, 10, rows);
}

export const xlookupWyszukiwanieNowoczesneLesson: LessonInput = {
  slug: "xlookup-wyszukiwanie-nowoczesne",
  title: "XLOOKUP — nowoczesne wyszukiwanie",
  shortDescription:
    "XLOOKUP: bez numerowania kolumn, z obsługą braków i wyszukiwaniem w lewo — następca VLOOKUP.",
  category: "Wyszukiwanie",
  difficulty: 3,
  estimatedMinutes: 30,
  prerequisites: ["wyszukaj-pionowo"],
  learningGoals: [
    "Wyszukiwać funkcją XLOOKUP: osobne zakresy szukania i zwracania",
    "Obsłużyć brak wyniku wbudowanym argumentem „nie znaleziono”",
    "Zwracać kolumnę leżącą NA LEWO od szukanej (to, czego VLOOKUP nie umie)",
    "Wstawiać XLOOKUP w środku obliczenia",
  ],
  tasks: [
    {
      title: "Pierwszy XLOOKUP — cena po kodzie",
      instructions:
        "Ten sam magazyn co przy VLOOKUP, ale teraz nowszym narzędziem. W **H2** wpisz:\n" +
        "`=XLOOKUP(E2,A2:A8,C2:C8)`\n" +
        "Czytamy: znajdź wartość z E2 w zakresie A2:A8 i zwróć odpowiednik z C2:C8. **Nie ma numeru kolumny** — po prostu wskazujesz zakres wyniku. `FALSE` też nie jest potrzebny: XLOOKUP domyślnie szuka dokładnie.\n" +
        "(W polskim Excelu: **X.WYSZUKAJ** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: catalogSheet(),
      hints: [
        "Trzy argumenty: czego szukasz, gdzie szukać, co zwrócić — w tej kolejności.",
        "Zakres szukania i zakres wyniku muszą mieć tyle samo wierszy.",
      ],
      checks: [
        { type: "cellFormula", cell: "H2", aliases: ["=XLOOKUP(E2,A2:A8,C2:C8)"] },
        { type: "cellValue", cell: "H2", expected: 89, tolerance: 0.01 },
      ],
    },
    {
      title: "Brak w cenniku — argument „nie znaleziono”",
      instructions:
        "Zamówienie ma kod **K-999**, którego nie ma w cenniku — zwykły VLOOKUP pokazałby `#N/D`. XLOOKUP ma czwarty argument właśnie na to. W **H6** wpisz:\n" +
        '`=XLOOKUP(E6,A2:A8,C2:C8,"Nie ma w cenniku")`\n' +
        "Gdy kodu zabraknie, formuła zwróci Twój komunikat zamiast błędu.\n" +
        "(To samo osiągniesz, owijając wyszukiwanie w `IFNA(...)` — czwarty argument jest po prostu krótszy.)",
      initialWorkbook: catalogSheet({
        "1": { "7": { f: "=XLOOKUP(E2,A2:A8,C2:C8)" } },
        "2": { "7": { f: "=XLOOKUP(E3,A2:A8,C2:C8)" } },
        "3": { "7": { f: "=XLOOKUP(E4,A2:A8,C2:C8)" } },
        "4": { "7": { f: "=XLOOKUP(E5,A2:A8,C2:C8)" } },
      }),
      hints: [
        "Komunikat w cudzysłowie to zwykły tekst — może być dowolny.",
        "Czwarty argument wchodzi zaraz za zakresem zwracania.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "H6",
          aliases: [
            '=XLOOKUP(E6,A2:A8,C2:C8,"Nie ma w cenniku")',
            '=IFNA(XLOOKUP(E6,A2:A8,C2:C8),"Nie ma w cenniku")',
          ],
        },
        { type: "cellValue", cell: "H6", expected: "Nie ma w cenniku" },
      ],
    },
    {
      title: "Wyszukiwanie w lewo — kod po nazwie",
      instructions:
        "Klient podaje **nazwę**, magazyn potrzebuje **kod** — a kod stoi na lewo od nazwy. Dla VLOOKUP martwy pewnik, dla XLOOKUP zwykła robota, bo zakres zwracania jest niezależny. W **J2** wpisz:\n" +
        '`=XLOOKUP("Monitor 24",B2:B8,A2:A8)`\n' +
        "Szukasz w kolumnie nazw (B), zwracasz z kolumny kodów (A) — kierunek nie gra roli.",
      initialWorkbook: catalogSheet({
        "1": {
          "7": { f: "=XLOOKUP(E2,A2:A8,C2:C8)" },
          "9": { v: "Kod produktu" },
        },
        "5": { "7": { f: '=XLOOKUP(E6,A2:A8,C2:C8,"Nie ma w cenniku")' } },
      }),
      hints: [
        "Pierwszy zakres (gdzie szukasz) to nazwy, drugi (co zwracasz) to kody.",
        "Wynik to tekst: kod zaczynający się od litery K.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "J2",
          aliases: ['=XLOOKUP("Monitor 24",B2:B8,A2:A8)'],
        },
        { type: "cellValue", cell: "J2", expected: "K-106" },
      ],
    },
    {
      title: "XLOOKUP w obliczeniu — wartość zamówienia",
      instructions:
        "Na koniec kombinacja znana z VLOOKUP: cena prosto do mnożenia. W **I2** wpisz:\n" +
        "`=XLOOKUP(E2,A2:A8,C2:C8)*F2`\n" +
        "i skopiuj do **I3:I5**. Wynik funkcji wchodzi do obliczenia bez pośrednictwa.",
      initialWorkbook: catalogSheet({
        "1": {
          "7": { f: "=XLOOKUP(E2,A2:A8,C2:C8)" },
          "9": { v: "Kod produktu" },
        },
        "2": { "7": { f: "=XLOOKUP(E3,A2:A8,C2:C8)" } },
        "3": { "7": { f: "=XLOOKUP(E4,A2:A8,C2:C8)" } },
        "5": { "7": { f: '=XLOOKUP(E6,A2:A8,C2:C8,"Nie ma w cenniku")' } },
      }),
      hints: [
        "Najpierw XLOOKUP wyciąga cenę, potem `*F2` mnoży przez sztuki.",
        "Mysz: 89 zł × 3 sztuki = 267 zł.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "I2",
          aliases: ["=XLOOKUP(E2,A2:A8,C2:C8)*F2", "=H2*F2"],
          mustInclude: ["F2"],
        },
        { type: "cellValue", cell: "I2", expected: 267, tolerance: 0.01 },
        {
          type: "rangeValues",
          range: "I3:I5",
          expected: [129.9, 1578, 249],
          tolerance: 0.01,
        },
      ],
    },
  ],
};
