import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 7 — number formats: currency, percent, decimal places. Empirical
 * notes (Univer 1.3.1, pl-PL), verified with a live probe:
 * - the numfmt buttons live in the toolbar's "Więcej" (More) panel;
 * - "Walutowy" applies '"zł"#,##0.00_);[Red]("zł"#,##0.00)', "Procentowy"
 *   applies "0%", and two clicks of "Zwiększ liczbę miejsc dziesiętnych"
 *   on an integer apply "0.00";
 * - getValues() returns the DISPLAY string for formatted cells ("zł12.00 ",
 *   "23%"), so cellValue checks on formatted cells use exact display
 *   strings; raw numbers are never checked on formatted cells.
 */
const CURRENCY_PATTERNS = ['"zł"#,##0.00_);[Red]("zł"#,##0.00)', '"zł"#,##0.00'];
const PERCENT_PATTERNS = ["0%"];
const TWO_DECIMALS_PATTERNS = ["0.00"];

function budgetTable(
  extraRows: Record<string, Record<string, { v: string | number }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number }>> = {
    "0": { "0": { v: "Wydatek" }, "1": { v: "Kwota (zł)" } },
    "1": { "0": { v: "Czynsz" }, "1": { v: 3500 } },
    "2": { "0": { v: "Internet" }, "1": { v: 120 } },
    "3": { "0": { v: "Prąd" }, "1": { v: 480 } },
    "4": { "0": { v: "Woda" }, "1": { v: 210 } },
    "5": { "0": { v: "Sprzątanie" }, "1": { v: 400 } },
    "6": { "0": { v: "Materiały" }, "1": { v: 85 } },
  };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Budżet", 20, 8, rows);
}

export const formatowanieLiczbLesson: LessonInput = {
  slug: "formatowanie-liczb",
  title: "Formatowanie liczb",
  shortDescription:
    "Waluta, procent i miejsca dziesiętne: jak sprawić, by kwoty wyglądały jak pieniądze, a nie surowe liczby.",
  category: "Formatowanie",
  difficulty: 1,
  learningGoals: [
    "Nadawać komórkom format walutowy zł",
    "Formatować procenty i wpisywać je jako ułamki dziesiętne",
    "Sterować liczbą miejsc dziesiętnych",
    "Rozpoznawać, kiedy kolumna ma niewłaściwy format",
  ],
  estimatedMinutes: 20,
  tasks: [
    {
      title: "Kwoty jak z faktury — format walutowy",
      instructions:
        "Kolumna B trzyma same liczby. Zaznacz zakres **B2:B7** (kliknij B2 i przeciągnij w dół do B7), a potem na końcu paska narzędzi kliknij **Więcej** — rozwinie się dodatkowy pasek — i wybierz **Walutowy**.\n" +
        "Kwoty od razu pokażą złotówki i dwa miejsca dziesiętne.",
      initialWorkbook: budgetTable(),
      hints: [
        "Format stosuje się do CAŁEGO zaznaczenia, więc najpierw zaznacz B2:B7, potem klikaj w pasku.",
        "Przycisk Więcej jest ostatni na pasku narzędzi; po użyciu panel możesz zamknąć tym samym przyciskiem.",
      ],
      checks: [
        { type: "cellStyle", cell: "B2", numberFormatOneOf: CURRENCY_PATTERNS },
        { type: "cellStyle", cell: "B7", numberFormatOneOf: CURRENCY_PATTERNS },
      ],
    },
    {
      title: "Stawki VAT — procenty",
      instructions:
        "Procenty w arkuszu wpisuje się jako ułamki: 23% to `0.23`.\n" +
        "Wpisz w **C2**: `0.23`, **C3**: `0.08`, **C4**: `0.05`, **C5**: `0.23`, a potem zaznacz C2:C5 i w panelu **Więcej** wybierz **Procentowy**.",
      initialWorkbook: budgetTable({ "0": { "2": { v: "Stawka VAT" } } }),
      hints: [
        "Najpierw wartości, potem format — kolejność ma znaczenie, bo format zmienia tylko wygląd.",
        "Gdybyś wpisał 23 zamiast 0.23, po sformatowaniu zobaczysz 2300% — wtedy popraw surową wartość.",
      ],
      checks: [
        { type: "cellStyle", cell: "C2", numberFormatOneOf: PERCENT_PATTERNS },
        { type: "cellValue", cell: "C2", expected: "23%" },
        { type: "cellValue", cell: "C4", expected: "8%" },
      ],
    },
    {
      title: "Grosze — miejsca dziesiętne",
      instructions:
        "Stawki godzinowe wpisz w **D2**: `60`, **D3**: `45.5`, **D4**: `52.25`. Następnie zaznacz D2:D4 i w panelu **Więcej** kliknij dwa razy **Zwiększ liczbę miejsc dziesiętnych**.\n" +
        "Każda wartość pokaże dokładnie dwa miejsca po kropce — 60.00, 45.50, 52.25.",
      initialWorkbook: budgetTable({
        "0": { "2": { v: "Stawka VAT" }, "3": { v: "Stawka godzinowa (zł)" } },
        "1": { "2": { v: 0.23 } },
        "2": { "2": { v: 0.08 } },
        "3": { "2": { v: 0.05 } },
        "4": { "2": { v: 0.23 } },
      }),
      hints: [
        "Liczby dziesiętne wpisuj z kropką: 45.5, nie 45,5.",
        "Dwa kliknięcia = dwa miejsca dziesiętne; licznik miejsc widać od razu w komórkach.",
      ],
      checks: [
        { type: "cellStyle", cell: "D2", numberFormatOneOf: TWO_DECIMALS_PATTERNS },
        { type: "cellStyle", cell: "D4", numberFormatOneOf: TWO_DECIMALS_PATTERNS },
        { type: "cellValue", cell: "D3", expected: "45.50" },
      ],
    },
    {
      title: "Premie — procenty od nowa",
      instructions:
        "W kolumnie F ktoś wpisał premie jako `10`, `15`, `20` — po sformatowaniu procentem pokazałoby się 1000%!\n" +
        "Popraw wpisy na ułamki: **F2**: `0.1`, **F3**: `0.15`, **F4**: `0.2`, zaznacz F2:F4 i zastosuj **Procentowy** z panelu **Więcej**.",
      initialWorkbook: budgetTable({
        "0": {
          "2": { v: "Stawka VAT" },
          "3": { v: "Stawka godzinowa (zł)" },
          "5": { v: "Premia (%)" },
        },
        "1": { "2": { v: 0.23 }, "5": { v: 10 } },
        "2": { "2": { v: 0.08 }, "5": { v: 15 } },
        "3": { "2": { v: 0.05 }, "5": { v: 20 } },
        "4": { "2": { v: 0.23 } },
      }),
      hints: [
        "Nadpisz stare wartości — kliknij komórkę i wpisz ułamek od nowa.",
        "10% to 0.1, 15% to 0.15 — procent to setna część, więc dzielimy przez 100.",
      ],
      checks: [
        { type: "cellStyle", cell: "F2", numberFormatOneOf: PERCENT_PATTERNS },
        { type: "cellValue", cell: "F2", expected: "10%" },
        { type: "cellValue", cell: "F3", expected: "15%" },
      ],
    },
  ],
};
