import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 3 — inserting and deleting rows/columns. Checks assert the FINAL
 * table state, so any method counts (context menu, retyping). Instructions
 * teach the context-menu path, verified against Univer 1.3.1: right-click a
 * cell → "Wstaw" (hover) → "Wstaw 1 wiersz powyżej"; "Usuń" → "Usuń
 * zaznaczony wiersz". Task initials chain: each is the final state of the
 * previous task.
 */
function stockTable(
  extraRows: Record<string, Record<string, { v: string | number }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number }>> = {
    "0": { "0": { v: "Produkt" }, "1": { v: "Cena (zł)" } },
    "1": { "0": { v: "Kawa" }, "1": { v: 12 } },
    "2": { "0": { v: "Herbata" }, "1": { v: 9 } },
    "3": { "0": { v: "Kakao" }, "1": { v: 11 } },
    "4": { "0": { v: "Sok" }, "1": { v: 29 } },
  };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Magazyn", 20, 8, rows);
}

export const wierszeIKolumnyLesson: LessonInput = {
  slug: "wiersze-i-kolumny",
  title: "Wiersze i kolumny",
  shortDescription:
    "Wstawianie i usuwanie wierszy oraz kolumn przez menu kontekstowe, bez psucia reszty tabeli.",
  category: "Podstawy",
  difficulty: 1,
  learningGoals: [
    "Wstawiać nowe wiersze i kolumny przez menu kontekstowe",
    "Usuwać wiersze i kolumny, których tabela już nie potrzebuje",
    "Uzupełniać dane po zmianie struktury tabeli",
    "Cofać nieudane zmiany struktury (Ctrl+Z)",
  ],
  estimatedMinutes: 20,
  tasks: [
    {
      title: "Nowy produkt — wstaw wiersz",
      instructions:
        "Do cennika dochodzi **Ciastka** za `15 zł` i mają być w cenniku między Herbatą a Kakao.\n" +
        "Kliknij prawym przyciskiem myszy dowolną komórkę **wiersza 4** (Kakao), najedź na **Wstaw** i w podmenu wybierz **Wstaw 1 wiersz powyżej**. W nowym, pustym wierszu wpisz `Ciastka` i `15`.",
      initialWorkbook: stockTable(),
      hints: [
        "Menu otwiera prawy przycisk myszy na komórce wiersza, obok którego chcesz wstawić nowy.",
        "Docelowa kolejność: Kawa, Herbata, Ciastka, Kakao, Sok.",
        "Pomyłka? Ctrl+Z cofa wstawienie, a dane wracają na swoje miejsce.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A1:B6",
          expected: [
            "Produkt",
            "Cena (zł)",
            "Kawa",
            12,
            "Herbata",
            9,
            "Ciastka",
            15,
            "Kakao",
            11,
            "Sok",
            29,
          ],
        },
      ],
    },
    {
      title: "Produkt wycofany — usuń wiersz",
      instructions:
        "Sok został wycofany z oferty. Kliknij prawym przyciskiem dowolną komórkę **wiersza 6** i wybierz **Usuń zaznaczony wiersz**. Cały wiersz zniknie razem z danymi, a tabela się domknie.",
      initialWorkbook: stockTable({
        "3": { "0": { v: "Ciastka" }, "1": { v: 15 } },
        "4": { "0": { v: "Kakao" }, "1": { v: 11 } },
        "5": { "0": { v: "Sok" }, "1": { v: 29 } },
      }),
      hints: [
        "Usuń działa na CAŁY wiersz — nie musisz wcześniej kasować komórek.",
        "Po usunięciu sprawdź, czy pod tabelą nie został pusty wiersz w środku danych.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A1:B5",
          expected: [
            "Produkt",
            "Cena (zł)",
            "Kawa",
            12,
            "Herbata",
            9,
            "Ciastka",
            15,
            "Kakao",
            11,
          ],
        },
      ],
    },
    {
      title: "Ilości — wstaw kolumnę",
      instructions:
        "Tabela potrzebuje kolumny **Ilość** między Produktem a Ceną. Kliknij prawym przyciskiem komórkę w kolumnie **Cena (zł)** (np. B1), najedź na **Wstaw** i wybierz **Wstaw 1 kolumnę w lewo**.\n" +
        "W nowej kolumnie wpisz:\n" +
        "- **B1**: `Ilość`\n" +
        "- **B2**: `10`, **B3**: `5`, **B4**: `20`, **B5**: `8`",
      initialWorkbook: stockTable({
        "3": { "0": { v: "Ciastka" }, "1": { v: 15 } },
        "4": { "0": { v: "Kakao" }, "1": { v: 11 } },
      }),
      hints: [
        "Kolumna wstawi się na lewo od klikniętej komórki — od tego, co klikniesz, zależy jej miejsce.",
        "Stare ceny zostaną bez zmian, tylko przesuną się do kolumny C.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A1:C5",
          expected: [
            "Produkt",
            "Ilość",
            "Cena (zł)",
            "Kawa",
            10,
            12,
            "Herbata",
            5,
            9,
            "Ciastka",
            20,
            15,
            "Kakao",
            8,
            11,
          ],
        },
      ],
    },
    {
      title: "Porządki na koniec dnia",
      instructions:
        "Dwa ostatnie zmiany w jednym zadaniu:\n" +
        "- usuń z tabeli wiersz z **Kakao** (wysyłamy z powrotem),\n" +
        "- na końcu tabeli dodaj nowy wiersz: **Dżem**, ilość `12`, cena `18`.\n" +
        "Użyj poznanych dziś poleceń menu kontekstowego.",
      initialWorkbook: stockTable({
        "0": { "1": { v: "Ilość" }, "2": { v: "Cena (zł)" } },
        "1": { "1": { v: 10 }, "2": { v: 12 } },
        "2": { "1": { v: 5 }, "2": { v: 9 } },
        "3": { "0": { v: "Ciastka" }, "1": { v: 20 }, "2": { v: 15 } },
        "4": { "0": { v: "Kakao" }, "1": { v: 8 }, "2": { v: 11 } },
      }),
      hints: [
        "Najpierw usuń Kakao, potem dopisuj Dżema — kolejność ułatwia liczenie wierszy.",
        "Nowy wiersz możesz wstawić poniżej tabeli albo poleceniem Wstaw z menu.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A1:C5",
          expected: [
            "Produkt",
            "Ilość",
            "Cena (zł)",
            "Kawa",
            10,
            12,
            "Herbata",
            5,
            9,
            "Ciastka",
            20,
            15,
            "Dżem",
            12,
            18,
          ],
        },
      ],
    },
  ],
};
