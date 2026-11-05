import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 19 — date arithmetic on a project schedule. In this engine typed
 * dates live as text in "yyyy-mm-dd" form, so every function here must
 * coerce text to a date — DAYS/YEAR/MONTH/EDATE/NETWORKDAYS all do. EDATE
 * returns a raw serial number, so the task wraps it in TEXT(...) to get a
 * readable, deterministic date string.
 */
function scheduleSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Zadanie" },
        "1": { v: "Start" },
        "2": { v: "Koniec" },
        "3": { v: "Deadline" },
      },
      "1": {
        "0": { v: "Oferta handlowa" },
        "1": { v: "2026-11-10" },
        "2": { v: "2026-11-24" },
        "3": { v: "2026-11-27" },
      },
      "2": {
        "0": { v: "Migracja danych" },
        "1": { v: "2026-12-01" },
        "2": { v: "2026-12-15" },
        "3": { v: "2026-12-18" },
      },
      "3": {
        "0": { v: "Raport roczny" },
        "1": { v: "2026-12-07" },
        "2": { v: "2026-12-23" },
        "3": { v: "2026-12-30" },
      },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Harmonogram", 20, 10, rows);
}

export const datyPodstawyLesson: LessonInput = {
  slug: "daty-podstawy",
  title: "Praca z datami",
  shortDescription:
    "DAYS, YEAR, MONTH, EDATE i NETWORKDAYS: terminy projektów liczone datami, nie na palcach.",
  category: "Tekst i daty",
  difficulty: 2,
  estimatedMinutes: 20,
  learningGoals: [
    "Liczyć liczbę dni między datami funkcją DAYS",
    "Wyciągać rok i miesiąc z daty (YEAR, MONTH)",
    "Przesuwać datę o całe miesiące funkcją EDATE",
    "Liczyć dni robocze funkcją NETWORKDAYS",
  ],
  tasks: [
    {
      title: "Ile dni trwa zadanie? — DAYS",
      instructions:
        "Harmonogram trzyma daty w formacie `RRRR-MM-DD` (np. `2026-11-10`). W **F2** policz, ile dni trwa przygotowanie oferty:\n" +
        "`=DAYS(C2,B2)`\n" +
        "DAYS liczy różnicę **koniec minus start** — koniec zawsze jako pierwszy argument.\n" +
        "(Ten arkusz liczy angielskie nazwy funkcji. Gdybyś kiedyś potrzebował dzisiejszej daty w formule, służy do tego `=TODAY()` — po polsku **DZIŚ** — ale zmienia się codziennie, więc nie ma stałego wyniku.)",
      initialWorkbook: scheduleSheet({ "0": { "5": { v: "Dni" } } }),
      hints: [
        "Obie daty w cudzysłowach nie są potrzebne — B2 i C2 to zwykłe odwołania.",
        "Od 10 do 24 listopada: policz, nie zgaduj — arkusz to zrobi za Ciebie.",
      ],
      checks: [
        { type: "cellFormula", cell: "F2", aliases: ["=DAYS(C2,B2)"] },
        { type: "cellValue", cell: "F2", expected: 14 },
      ],
    },
    {
      title: "Rok i miesiąc — YEAR i MONTH",
      instructions:
        "Do raportu miesięcznego potrzebny rok i miesiąc startu. W **G2** i **H2** wpisz:\n" +
        "- `=YEAR(B2)` — rok z daty startu\n" +
        "- `=MONTH(B2)` — numer miesiąca (styczeń = 1)\n" +
        "(Po polsku: **ROK** i **MIESIĄĆ**.)",
      initialWorkbook: scheduleSheet({
        "0": { "5": { v: "Dni" }, "6": { v: "Rok" }, "7": { v: "Miesiąc" } },
        "1": { "5": { f: "=DAYS(C2,B2)" } },
      }),
      hints: [
        "Obie funkcje wyciągają kawałek daty i zwracają liczbę.",
        "Listopad to jedenasty miesiąc roku.",
      ],
      checks: [
        { type: "cellFormula", cell: "G2", aliases: ["=YEAR(B2)"] },
        { type: "cellValue", cell: "G2", expected: 2026 },
        { type: "cellFormula", cell: "H2", aliases: ["=MONTH(B2)"] },
        { type: "cellValue", cell: "H2", expected: 11 },
      ],
    },
    {
      title: "Termin plus miesiąc — EDATE z TEXT",
      instructions:
        "Umowy płatne są „do 10. dnia następnego miesiąca”. Funkcja EDATE przesuwa datę o całe miesiące, ale zwraca surowy numer daty — dlatego owijamy ją w TEXT, żeby pokazała się jak data:\n" +
        'W **I2** wpisz:\n' +
        '`=TEXT(EDATE(B2,1),"yyyy-mm-dd")`\n' +
        "Wnętrze czytamy: EDATE(B2,1) = ta sama data miesiąc później; TEXT(...) formatuje ją z powrotem na `yyyy-mm-dd`. (Po polsku: **DATA.EDATE**… właściwie EDATE, a TEXT to **TEKST**.)",
      initialWorkbook: scheduleSheet({
        "0": {
          "5": { v: "Dni" },
          "6": { v: "Rok" },
          "7": { v: "Miesiąc" },
          "8": { v: "Termin +1 mies." },
        },
        "1": {
          "5": { f: "=DAYS(C2,B2)" },
          "6": { f: "=YEAR(B2)" },
          "7": { f: "=MONTH(B2)" },
        },
      }),
      hints: [
        "Wzorzec w TEXT piszesz w cudzysłowach, małymi literami: `\"yyyy-mm-dd\"`.",
        "EDATE(B2,1): jeden miesiąc do przodu; (B2,-1) byłby miesiąc wstecz.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "I2",
          aliases: ['=TEXT(EDATE(B2,1),"yyyy-mm-dd")'],
          mustInclude: ["EDATE"],
        },
        { type: "cellValue", cell: "I2", expected: "2026-12-10" },
      ],
    },
    {
      title: "Dni robocze — NETWORKDAYS",
      instructions:
        "Na koniec pytanie, które zadaje każdy kierownik: **ile dni roboczych** zajmie zadanie? W **J2** policz dni robocze oferty (weekendy wypadają automatycznie):\n" +
        "`=NETWORKDAYS(B2,C2)`\n" +
        "Porównaj z F2: 14 dni kalendarzowych to tylko 11 roboczych — reszta to weekendy.",
      initialWorkbook: scheduleSheet({
        "0": {
          "5": { v: "Dni" },
          "6": { v: "Rok" },
          "7": { v: "Miesiąc" },
          "8": { v: "Termin +1 mies." },
          "9": { v: "Dni robocze" },
        },
        "1": {
          "5": { f: "=DAYS(C2,B2)" },
          "6": { f: "=YEAR(B2)" },
          "7": { f: "=MONTH(B2)" },
          "8": { f: '=TEXT(EDATE(B2,1),"yyyy-mm-dd")' },
        },
      }),
      hints: [
        "NETWORKDAYS liczy od pierwszej do ostatniej daty włącznie.",
        "W listopadzie 2026 między 10. a 24. dniem mieszczą się dwa pełne weekendy.",
      ],
      checks: [
        { type: "cellFormula", cell: "J2", aliases: ["=NETWORKDAYS(B2,C2)"] },
        { type: "cellValue", cell: "J2", expected: 11 },
      ],
    },
  ],
};
