import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 8 — rounding: ROUND/ROUNDUP/ROUNDDOWN versus changing the LOOK of
 * a number with a format. Formulas are engine-evaluated, so value checks are
 * plain numbers. The last task pairs a formatted cell (checked only with
 * cellStyle — formatted cells read back as display strings, see the note in
 * formatowanie-liczb.ts) with a real ROUND result.
 */
function travelCosts(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<
    string,
    Record<string, { v: string | number } | { f: string }>
  > = {
    "0": { "0": { v: "Wydatek" }, "1": { v: "Kwota (zł)" } },
    "1": { "0": { v: "Paliwo" }, "1": { v: 342.57 } },
    "2": { "0": { v: "Hotel" }, "1": { v: 419.99 } },
    "3": { "0": { v: "Obiady" }, "1": { v: 86.44 } },
    "4": { "0": { v: "Parking" }, "1": { v: 27.5 } },
  };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Delegacja", 20, 8, rows);
}

export const zaokraglanieIPrecyzjaLesson: LessonInput = {
  slug: "zaokraglanie-i-precyzja",
  title: "Zaokrąglanie i precyzja",
  shortDescription:
    "ROUND, ROUNDUP i ROUNDDOWN — oraz różnica między zaokrągleniem wartości a samą zmianą wyglądu.",
  category: "Formatowanie",
  difficulty: 1,
  learningGoals: [
    "Zaokrąglać wartości funkcją ROUND do pełnych złotych",
    "Wybierać kierunek zaokrąglenia: ROUNDUP i ROUNDDOWN",
    "Zaokrąglać do zadanej liczby miejsc dziesiętnych",
    "Odróżniać zaokrąglenie wartości od formatu, który zmienia tylko wygląd",
  ],
  estimatedMinutes: 20,
  tasks: [
    {
      title: "Pełne złotówki — ROUND",
      instructions:
        "Koszty delegacji mają grosze, a raport wymaga pełnych złotych. W kolumnie C policz je funkcją ROUND:\n" +
        "- **C2**: `=ROUND(B2,0)`\n" +
        "- **C3**: `=ROUND(B3,0)`\n" +
        "- **C4**: `=ROUND(B4,0)`\n" +
        "- **C5**: `=ROUND(B5,0)`\n" +
        "Drugi argument to liczba miejsc po kropce: `0` znaczy pełne złotówki.\n" +
        "(W tym arkuszu funkcje wpisujesz po angielsku. W polskim Excelu: **ZAOKRĄGL**.)",
      initialWorkbook: travelCosts({ "0": { "2": { v: "Pełne (zł)" } } }),
      hints: [
        "Formuła działa na komórce z lewej — przeciągnij ją w dół albo powtórz dla każdego wiersza, zmieniając numer wiersza.",
        "Przecinek w `(B2,0)` oddziela argumenty — to nie przecinek dziesiętny.",
      ],
      checks: [
        { type: "cellFormula", cell: "C2", aliases: ["=ROUND(B2,0)"] },
        { type: "cellValue", cell: "C2", expected: 343 },
        { type: "cellFormula", cell: "C3", aliases: ["=ROUND(B3,0)"] },
        { type: "cellValue", cell: "C3", expected: 420 },
        { type: "cellFormula", cell: "C4", aliases: ["=ROUND(B4,0)"] },
        { type: "cellValue", cell: "C4", expected: 86 },
        { type: "cellFormula", cell: "C5", aliases: ["=ROUND(B5,0)"] },
        { type: "cellValue", cell: "C5", expected: 28 },
      ],
    },
    {
      title: "Zawsze w górę — ROUNDUP",
      instructions:
        "Firma rozlicza kilometrówkę po pełnych złotych **w górę** — korzyść pracownika. W kolumnie D:\n" +
        "- **D2**: `=ROUNDUP(B2,0)`\n" +
        "- **D3**: `=ROUNDUP(B3,0)`\n" +
        "- **D4**: `=ROUNDUP(B4,0)`\n" +
        "- **D5**: `=ROUNDUP(B5,0)`\n" +
        "(Po polsku: **ZAOKR.GÓRA**.)",
      initialWorkbook: travelCosts({
        "0": { "2": { v: "Pełne (zł)" }, "3": { v: "W górę (zł)" } },
        "1": { "2": { f: "=ROUND(B2,0)" } },
        "2": { "2": { f: "=ROUND(B3,0)" } },
        "3": { "2": { f: "=ROUND(B4,0)" } },
        "4": { "2": { f: "=ROUND(B5,0)" } },
      }),
      hints: [
        "ROUNDUP zaokrągla zawsze dalej od zera — 86.44 da 87, choć zwykłe ROUND dałoby 86.",
        "Formułę z C2 możesz skopiować i podmienić tylko nazwę funkcji.",
      ],
      checks: [
        { type: "cellFormula", cell: "D2", aliases: ["=ROUNDUP(B2,0)"] },
        { type: "cellValue", cell: "D2", expected: 343 },
        { type: "cellFormula", cell: "D3", aliases: ["=ROUNDUP(B3,0)"] },
        { type: "cellValue", cell: "D3", expected: 420 },
        { type: "cellFormula", cell: "D4", aliases: ["=ROUNDUP(B4,0)"] },
        { type: "cellValue", cell: "D4", expected: 87 },
        { type: "cellFormula", cell: "D5", aliases: ["=ROUNDUP(B5,0)"] },
        { type: "cellValue", cell: "D5", expected: 28 },
      ],
    },
    {
      title: "Zawsze w dół — ROUNDDOWN",
      instructions:
        "Premię piecuszową (napiwki od kontrahentów) księgowość liczy po pełnych **dziesiątkach groszy w dół** — czyli do 1 miejsca po kropce. W kolumnie E:\n" +
        "- **E2**: `=ROUNDDOWN(B2,1)`\n" +
        "- **E3**: `=ROUNDDOWN(B3,1)`\n" +
        "- **E4**: `=ROUNDDOWN(B4,1)`\n" +
        "- **E5**: `=ROUNDDOWN(B5,1)`\n" +
        "(Po polsku: **ZAOKR.DÓŁ**.)",
      initialWorkbook: travelCosts({
        "0": {
          "2": { v: "Pełne (zł)" },
          "3": { v: "W górę (zł)" },
          "4": { v: "W dół (zł)" },
        },
        "1": {
          "2": { f: "=ROUND(B2,0)" },
          "3": { f: "=ROUNDUP(B2,0)" },
        },
        "2": {
          "2": { f: "=ROUND(B3,0)" },
          "3": { f: "=ROUNDUP(B3,0)" },
        },
        "3": {
          "2": { f: "=ROUND(B4,0)" },
          "3": { f: "=ROUNDUP(B4,0)" },
        },
        "4": {
          "2": { f: "=ROUND(B5,0)" },
          "3": { f: "=ROUNDUP(B5,0)" },
        },
      }),
      hints: [
        "Drugi argument `1` zostawia jedno miejsce dziesiętne: 342.57 → 342.5.",
        "ROUNDDOWN obcina bez zastanawiania się nad kolejną cyfrą.",
      ],
      checks: [
        { type: "cellFormula", cell: "E2", aliases: ["=ROUNDDOWN(B2,1)"] },
        { type: "cellValue", cell: "E2", expected: 342.5, tolerance: 0.01 },
        { type: "cellFormula", cell: "E3", aliases: ["=ROUNDDOWN(B3,1)"] },
        { type: "cellValue", cell: "E3", expected: 419.9, tolerance: 0.01 },
        { type: "cellFormula", cell: "E4", aliases: ["=ROUNDDOWN(B4,1)"] },
        { type: "cellValue", cell: "E4", expected: 86.4, tolerance: 0.01 },
        { type: "cellFormula", cell: "E5", aliases: ["=ROUNDDOWN(B5,1)"] },
        { type: "cellValue", cell: "E5", expected: 27.5, tolerance: 0.01 },
      ],
    },
    {
      title: "Wygląd to nie wartość",
      instructions:
        "Najczęstsza pułapka: format zmienia WYGLĄD, nie wartość.\n" +
        "- w **F1** wpisz nagłówek `Kwota dokładna`, a w **F2** wartość `129.9867`\n" +
        "- w **F3** wpisz `=ROUND(F2,2)` — prawdziwe zaokrąglenie do groszy\n" +
        "- zaznacz F2 i w panelu **Więcej** kliknij dwukrotnie **Zwiększ liczbę miejsc dziesiętnych**\n" +
        "F2 pokaże 129.99 — ale pod spodem wciąż jest 129.9867. W F3 zaokrąglenie jest realne: komórka faktycznie trzyma 129.99.",
      initialWorkbook: travelCosts({
        "0": {
          "2": { v: "Pełne (zł)" },
          "3": { v: "W górę (zł)" },
          "4": { v: "W dół (zł)" },
        },
        "1": {
          "2": { f: "=ROUND(B2,0)" },
          "3": { f: "=ROUNDUP(B2,0)" },
          "4": { f: "=ROUNDDOWN(B2,1)" },
        },
        "2": {
          "2": { f: "=ROUND(B3,0)" },
          "3": { f: "=ROUNDUP(B3,0)" },
          "4": { f: "=ROUNDDOWN(B3,1)" },
        },
        "3": {
          "2": { f: "=ROUND(B4,0)" },
          "3": { f: "=ROUNDUP(B4,0)" },
          "4": { f: "=ROUNDDOWN(B4,1)" },
        },
        "4": {
          "2": { f: "=ROUND(B5,0)" },
          "3": { f: "=ROUNDUP(B5,0)" },
          "4": { f: "=ROUNDDOWN(B5,1)" },
        },
      }),
      hints: [
        "Liczbę dziesiętną wpisuj z kropką: 129.9867.",
        "Gdyby F2 po sformatowaniu pokazało coś innego niż 129.99, dostrój liczbę miejsc dziesiętnych.",
        "Tylko F3 liczy przez formułę — F2 to nadal surowa wartość w przebraniu.",
      ],
      checks: [
        { type: "cellFormula", cell: "F3", aliases: ["=ROUND(F2,2)"] },
        { type: "cellValue", cell: "F3", expected: 129.99, tolerance: 0.001 },
        { type: "cellStyle", cell: "F2", numberFormatSet: true },
      ],
    },
  ],
};
