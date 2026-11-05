import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 29 — dynamic array functions: FILTER, UNIQUE, SORTBY. One formula
 * "spills" its whole result into neighboring cells, so checks pair a
 * cellFormula on the anchor with rangeValues over the spill area (engine
 * behavior verified in the probe: spills are readable via getValues).
 * Data: an IT helpdesk ticket list.
 */
function ticketsSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Nr" },
        "1": { v: "Temat" },
        "2": { v: "Priorytet" },
        "3": { v: "Dni otwarte" },
      },
      "1": { "0": { v: "ZG-101" }, "1": { v: "Drukarka nie drukuje" }, "2": { v: "Wysoki" }, "3": { v: 3 } },
      "2": { "0": { v: "ZG-102" }, "1": { v: "Hasło wygasło" }, "2": { v: "Normalny" }, "3": { v: 1 } },
      "3": { "0": { v: "ZG-103" }, "1": { v: "VPN nie łączy" }, "2": { v: "Wysoki" }, "3": { v: 2 } },
      "4": { "0": { v: "ZG-104" }, "1": { v: "Licencja Office" }, "2": { v: "Normalny" }, "3": { v: 5 } },
      "5": { "0": { v: "ZG-105" }, "1": { v: "Monitor migocze" }, "2": { v: "Niski" }, "3": { v: 9 } },
      "6": { "0": { v: "ZG-106" }, "1": { v: "Laptop nie startuje" }, "2": { v: "Wysoki" }, "3": { v: 4 } },
      "7": { "0": { v: "ZG-107" }, "1": { v: "Mysz bezprzewodowa" }, "2": { v: "Niski" }, "3": { v: 7 } },
      "8": { "0": { v: "ZG-108" }, "1": { v: "Excel się zawiesza" }, "2": { v: "Normalny" }, "3": { v: 6 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Zgłoszenia", 30, 10, rows);
}

export const filtrowanieIFunkcjeTablicoweLesson: LessonInput = {
  slug: "filtrowanie-i-funkcje-tablicowe",
  title: "FILTER, UNIQUE i SORTBY",
  shortDescription:
    "Funkcje tablicowe: jedna formuła rozlewa całą listę — filtrowanie, unikaty i sortowanie bez kopiowania.",
  category: "Praca z danymi",
  difficulty: 3,
  estimatedMinutes: 35,
  prerequisites: ["sortowanie-i-organizacja"],
  learningGoals: [
    "Filtrować listę jednym warunkiem funkcją FILTER",
    "Zwracać z FILTER kilka kolumn naraz",
    "Wyciągać unikalne wartości funkcją UNIQUE",
    "Sortować wg innej kolumny funkcją SORTBY",
  ],
  tasks: [
    {
      title: "Sama ważna lista — FILTER",
      instructions:
        "Kierownik chce zobaczyć **tylko zgłoszenia o wysokim priorytecie** — bez wierszy po drodze. W **F2** wpisz:\n" +
        '`=FILTER(B2:B9,C2:C9="Wysoki")`\n' +
        "Formuła rozleje się w dół **sama**: wpisujesz ją tylko w F2, a wynik zajmuje tyle komórek, ile ma dopasowań. To funkcja tablicowa (spill).\n" +
        "(W polskim Excelu: **FILTRUJ** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: ticketsSheet({ "0": { "5": { v: "Wysoki priorytet" } } }),
      hints: [
        "Drugi argument to cały warunek porównujący kolumnę z wartością — bez IF w środku.",
        "Trzy zgłoszenia mają priorytet Wysoki — formuła zajmie trzy komórki.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "F2",
          aliases: ['=FILTER(B2:B9,C2:C9="Wysoki")'],
        },
        {
          type: "rangeValues",
          range: "F2:F4",
          expected: ["Drukarka nie drukuje", "VPN nie łączy", "Laptop nie startuje"],
        },
      ],
    },
    {
      title: "Całe wiersze — FILTER dwóch kolumn",
      instructions:
        "Sam temat nie wystarczy — potrzebny też numer zgłoszenia. FILTER przepuszcza **wiele kolumn naraz**. W **F2** wpisz:\n" +
        '`=FILTER(A2:B9,C2:C9="Wysoki")`\n' +
        "Spill pójdzie w dwie strony: numery w F, tematy w G — wiersze zostają w parach.",
      initialWorkbook: ticketsSheet({
        "0": { "5": { v: "Nr" }, "6": { v: "Temat" } },
      }),
      hints: [
        "Pierwszy argument to teraz dwa pierwsze kolumny: A2:B9.",
        "Warunek nadal jeden — priorytet w kolumnie C.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "F2",
          aliases: ['=FILTER(A2:B9,C2:C9="Wysoki")'],
        },
        {
          type: "rangeValues",
          range: "F2:F4",
          expected: ["ZG-101", "ZG-103", "ZG-106"],
        },
        {
          type: "rangeValues",
          range: "G2:G4",
          expected: ["Drukarka nie drukuje", "VPN nie łączy", "Laptop nie startuje"],
        },
      ],
    },
    {
      title: "Bez powtórek — UNIQUE",
      instructions:
        "Ile **różnych** priorytetów obsługuje zespół? UNIQUE wyciąga każdą wartość **raz** — w kolejności pierwszego wystąpienia. W **F2** wpisz:\n" +
        "`=UNIQUE(C2:C9)`\n" +
        "Trzy różne priorytety → trzy komórki spillu.\n" +
        "(Po polsku: **UNIKATOWE**.)",
      initialWorkbook: ticketsSheet({
        "0": { "5": { v: "Priorytety" } },
      }),
      hints: [
        "UNIQUE nie sortuje — zachowuje kolejność z listy.",
        "Pierwszy na liście jest Wysoki.",
      ],
      checks: [
        { type: "cellFormula", cell: "F2", aliases: ["=UNIQUE(C2:C9)"] },
        {
          type: "rangeValues",
          range: "F2:F4",
          expected: ["Wysoki", "Normalny", "Niski"],
        },
      ],
    },
    {
      title: "Sortuj po czym innym — SORTBY",
      instructions:
        "Na koniec: zgłoszenia od **najstarszych** (najdłużej otwartych). SORTBY sortuje jeden zakres według **innego** zakresu. W **F2** wpisz:\n" +
        "`=SORTBY(A2:B9,D2:D9)`\n" +
        "Zwracamy pary nr+temat (A2:B9), ale kolejność bierze się z dni otwarcia (D2:D9), rosnąco.",
      initialWorkbook: ticketsSheet({
        "0": { "5": { v: "Nr" }, "6": { v: "Temat" } },
      }),
      hints: [
        "Najkrócej otwarte: ZG-102 (1 dzień) — ono będzie pierwsze.",
        "Ostatni wiersz to ZG-105: 9 dni.",
      ],
      checks: [
        { type: "cellFormula", cell: "F2", aliases: ["=SORTBY(A2:B9,D2:D9)"] },
        {
          type: "rangeValues",
          range: "F2:F9",
          expected: ["ZG-102", "ZG-103", "ZG-101", "ZG-106", "ZG-104", "ZG-108", "ZG-107", "ZG-105"],
        },
        {
          type: "rangeValues",
          range: "G2:G9",
          expected: [
            "Hasło wygasło",
            "VPN nie łączy",
            "Drukarka nie drukuje",
            "Laptop nie startuje",
            "Licencja Office",
            "Excel się zawiesza",
            "Mysz bezprzewodowa",
            "Monitor migocze",
          ],
        },
      ],
    },
  ],
};
