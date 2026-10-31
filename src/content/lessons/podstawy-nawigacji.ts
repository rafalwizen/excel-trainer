import type { Lesson } from "../schema";

/**
 * Lesson 1 — sheet basics: selecting cells, entering data, reading cell
 * addresses and overwriting a value. Each task starts from the state the
 * previous task produced, so tasks are solvable one at a time.
 */
export const podstawyNawigacjiLesson: Lesson = {
  slug: "podstawy-nawigacji",
  title: "Podstawy arkusza: nawigacja i wpisywanie danych",
  shortDescription:
    "Klikanie, wpisywanie i edycja komórek oraz adresy typu B3 — pierwszy krok w Excelu.",
  category: "Podstawy",
  difficulty: 1,
  tasks: [
    {
      title: "Nagłówki tabeli",
      instructions:
        "Każda komórka ma swój adres: literę kolumny i numer wiersza. " +
        "Kliknij komórkę **A1**, wpisz `Produkt` i zatwierdź klawiszem **Enter**. " +
        "Następnie kliknij **B1**, wpisz `Cena` i zatwierdź.",
      initialWorkbook: {
        sheetName: "Arkusz1",
        rowCount: 20,
        columnCount: 8,
        cellData: {},
      },
      hints: [
        "Komórkę zaznaczasz pojedynczym kliknięciem — tekst wpisujesz od razu, bez dwukliku.",
        "Enter zatwierdza wpis i schodzi wiersz niżej, Esc anuluje wpisywanie.",
      ],
      checks: [
        { type: "cellValue", cell: "A1", expected: "Produkt" },
        { type: "cellValue", cell: "B1", expected: "Cena" },
      ],
    },
    {
      title: "Wypełniamy tabelę danymi",
      instructions:
        "Uzupełnij tabelę:\n" +
        "- **A2**: `Kawa`, **A3**: `Herbata`, **A4**: `Kakao`\n" +
        "- **B2**: `12`, **B3**: `9`, **B4**: `11`\n" +
        "Ceny wpisuj jako same liczby — bez „zł”.",
      initialWorkbook: {
        sheetName: "Arkusz1",
        rowCount: 20,
        columnCount: 8,
        cellData: {
          "0": { "0": { v: "Produkt" }, "1": { v: "Cena" } },
        },
      },
      hints: [
        "Po Enterze zaznaczenie schodzi do komórki pod spodem — całą kolumnę wypełnisz bez klikania.",
        "Jeśli pomylisz wartość, kliknij komórkę i wpisz ją ponownie.",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "A2:B4",
          expected: ["Kawa", 12, "Herbata", 9, "Kakao", 11],
        },
      ],
    },
    {
      title: "Gdzie jest cena herbaty?",
      instructions:
        "Cena herbaty leży w jednej z komórek tabeli. Wpisz do **D1** adres tej komórki " +
        "(sam adres, w stylu `A1` — bez znaku `=`).",
      initialWorkbook: {
        sheetName: "Arkusz1",
        rowCount: 20,
        columnCount: 8,
        cellData: {
          "0": { "0": { v: "Produkt" }, "1": { v: "Cena" } },
          "1": { "0": { v: "Kawa" }, "1": { v: 12 } },
          "2": { "0": { v: "Herbata" }, "1": { v: 9 } },
          "3": { "0": { v: "Kakao" }, "1": { v: 11 } },
        },
      },
      hints: [
        "Ceny stoją w kolumnie B.",
        "Herbata jest w trzecim wierszu danych.",
      ],
      checks: [{ type: "cellValue", cell: "D1", expected: "B3" }],
    },
    {
      title: "Zmiana ceny",
      instructions:
        "Cena kawy wzrosła do 14 zł. Zmień wartość w **B2** na `14` — " +
        "kliknij komórkę, wpisz nową liczbę i zatwierdź Enterem.",
      initialWorkbook: {
        sheetName: "Arkusz1",
        rowCount: 20,
        columnCount: 8,
        cellData: {
          "0": { "0": { v: "Produkt" }, "1": { v: "Cena" } },
          "1": { "0": { v: "Kawa" }, "1": { v: 12 } },
          "2": { "0": { v: "Herbata" }, "1": { v: 9 } },
          "3": { "0": { v: "Kakao" }, "1": { v: 11 } },
        },
      },
      hints: [
        "Nie musisz najpierw kasować starej wartości — nowy wpis nadpisze ją w całości.",
        "Dwuklik lub F2 otwiera komórkę do edycji w miejscu.",
      ],
      checks: [{ type: "cellValue", cell: "B2", expected: 14 }],
    },
  ],
};
