import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 12 — the IF function on an order list: text flags, a numeric
 * discount and a nested two-tier classification. Values deliberately avoid
 * Polish diacritics inside formula literals ("TAK"/"NIE", "VIP") so the
 * exact-match value checks stay forgiving for learners.
 */
function ordersSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": { "0": { v: "Klient" }, "1": { v: "Kwota (zł)" } },
      "1": { "0": { v: "Nowak" }, "1": { v: 1200 } },
      "2": { "0": { v: "Kowalska" }, "1": { v: 450 } },
      "3": { "0": { v: "Wiśniewska" }, "1": { v: 780 } },
      "4": { "0": { v: "Wójcik" }, "1": { v: 320 } },
      "5": { "0": { v: "Zielińska" }, "1": { v: 950 } },
      "6": { "0": { v: "Lewandowski" }, "1": { v: 150 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Zamówienia", 20, 10, rows);
}

// Free-shipping flags for the whole column, prefilled from task 2 on.
const shippingFlags: Record<string, Record<string, { f: string }>> = {
  "1": { "2": { f: '=IF(B2>=500,"TAK","NIE")' } },
  "2": { "2": { f: '=IF(B3>=500,"TAK","NIE")' } },
  "3": { "2": { f: '=IF(B4>=500,"TAK","NIE")' } },
  "4": { "2": { f: '=IF(B5>=500,"TAK","NIE")' } },
  "5": { "2": { f: '=IF(B6>=500,"TAK","NIE")' } },
  "6": { "2": { f: '=IF(B7>=500,"TAK","NIE")' } },
};

export const logikaJezeliLesson: LessonInput = {
  slug: "logika-jezeli",
  title: "Logika: funkcja JEŻELI (IF)",
  shortDescription:
    "Funkcja IF: flagi TAK/NIE, rabat z progiem i klasyfikacja klientów w jednej formule.",
  category: "Formuły i funkcje",
  difficulty: 2,
  estimatedMinutes: 25,
  prerequisites: ["formuly-podstawowe"],
  learningGoals: [
    "Pisać warunek funkcją IF: wartość dla prawdy i dla fałszu",
    "Zwracać przez IF tekst (flagi) albo liczbę (rabat)",
    "Kopiować jedną formułę IF na całą kolumnę",
    "Zagnieżdżać dwa IF-y: progi VIP / STAŁY / NOWY",
  ],
  tasks: [
    {
      title: "Darmowa wysyłka — pierwszy warunek",
      instructions:
        "Sklep daje darmową wysyłkę od **500 zł**. W **C2** wpisz:\n" +
        '`=IF(B2>=500,"TAK","NIE")`\n' +
        "Czytamy: JEŻELI kwota w B2 jest większa lub równa 500, pokaż `TAK`, w przeciwnym razie `NIE`.\n" +
        "(W polskim Excelu funkcja nazywa się **JEŻELI** — ten arkusz liczy angielskie nazwy funkcji.)",
      initialWorkbook: ordersSheet({ "0": { "2": { v: "Darmowa wysyłka" } } }),
      hints: [
        "Warunek i obie wartości oddzielasz średnikami… czyli w tym arkuszu przecinkami: `IF(B2>=500,\"TAK\",\"NIE\")`.",
        "Tekst w formule zawsze w cudzysłowach — liczby bez.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "C2",
          aliases: ['=IF(B2>=500,"TAK","NIE")'],
        },
        { type: "cellValue", cell: "C2", expected: "TAK" },
      ],
    },
    {
      title: "Kopiujemy warunek w dół",
      instructions:
        "Skopiuj formułę z **C2** do **C3:C7** (uchwytem wypełniania albo Ctrl+C / Ctrl+V). " +
        "Adres `B2` przesuwa się na B3, B4…, więc każdy wiersz sprawdzany jest dla swojej kwoty.",
      initialWorkbook: ordersSheet({
        "0": { "2": { v: "Darmowa wysyłka" } },
        ...shippingFlags,
      }),
      hints: [
        "Uchwyt wypełniania: mały kwadrat w prawym dolnym rogu zaznaczonej C2 — przeciągnij go do C7.",
        "Formuła w C3 powinna wyglądać tak: =IF(B3>=500,\"TAK\",\"NIE\").",
      ],
      checks: [
        {
          type: "rangeValues",
          range: "C3:C7",
          expected: ["NIE", "TAK", "NIE", "TAK", "NIE"],
        },
      ],
    },
    {
      title: "Rabat z progiem — IF, który liczy",
      instructions:
        "IF może zwracać nie tylko tekst, ale i **wynik obliczenia**. W **D2** wpisz rabat 5% od zamówień od 500 zł:\n" +
        '`=IF(B2>=500,B2*0.05,0)`\n' +
        "i skopiuj formułę do **D3:D7**.",
      initialWorkbook: ordersSheet({
        "0": { "2": { v: "Darmowa wysyłka" }, "3": { v: "Rabat (zł)" } },
        ...shippingFlags,
      }),
      hints: [
        "Dla 450 zł warunek jest fałszywy, więc IF zwróci 0 — i o to chodzi.",
        "Znak `>=` to „większe lub równe”; mnożenie jak zawsze gwiazdką `*`.",
      ],
      checks: [
        { type: "cellFormula", cell: "D2", aliases: ["=IF(B2>=500,B2*0.05,0)"] },
        { type: "cellValue", cell: "D2", expected: 60, tolerance: 0.01 },
        {
          type: "rangeValues",
          range: "D3:D7",
          expected: [0, 39, 0, 47.5, 0],
          tolerance: 0.01,
        },
      ],
    },
    {
      title: "Segmenty klientów — IF w IF-ie",
      instructions:
        "Na koniec trzy progi naraz: klienci od **1000 zł** to `VIP`, od **500 zł** `STAŁY`, pozostali `NOWY`. W **E2** wpisz:\n" +
        '`=IF(B2>=1000,"VIP",IF(B2>=500,"STAŁY","NOWY"))`\n' +
        "i skopiuj do **E3:E7**. Zagnieżdżony IF działa jak „a jeśli nie, sprawdź jeszcze to”.",
      initialWorkbook: ordersSheet({
        "0": {
          "2": { v: "Darmowa wysyłka" },
          "3": { v: "Rabat (zł)" },
          "4": { v: "Segment" },
        },
        ...shippingFlags,
        "1": { "2": { f: '=IF(B2>=500,"TAK","NIE")' }, "3": { f: "=IF(B2>=500,B2*0.05,0)" } },
        "2": { "2": { f: '=IF(B3>=500,"TAK","NIE")' }, "3": { f: "=IF(B3>=500,B3*0.05,0)" } },
        "3": { "2": { f: '=IF(B4>=500,"TAK","NIE")' }, "3": { f: "=IF(B4>=500,B4*0.05,0)" } },
        "4": { "2": { f: '=IF(B5>=500,"TAK","NIE")' }, "3": { f: "=IF(B5>=500,B5*0.05,0)" } },
        "5": { "2": { f: '=IF(B6>=500,"TAK","NIE")' }, "3": { f: "=IF(B6>=500,B6*0.05,0)" } },
        "6": { "2": { f: '=IF(B7>=500,"TAK","NIE")' }, "3": { f: "=IF(B7>=500,B7*0.05,0)" } },
      }),
      hints: [
        "Zamykasz dwa nawiasy — po jednym na każdy IF.",
        "Kolejność progów ma znaczenie: najpierw najwyższy (1000), potem niższy (500).",
        "Dla 450 zł pierwszy warunek fałsz, drugi też fałsz — zostaje NOWY.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E2",
          aliases: ['=IF(B2>=1000,"VIP",IF(B2>=500,"STAŁY","NOWY"))'],
        },
        { type: "cellValue", cell: "E2", expected: "VIP" },
        {
          type: "rangeValues",
          range: "E3:E7",
          expected: ["NOWY", "STAŁY", "NOWY", "STAŁY", "NOWY"],
        },
      ],
    },
  ],
};
