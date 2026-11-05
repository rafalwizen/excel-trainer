import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 14 — SUMIF and COUNTIF over a department expense register: criteria
 * on text (department, status) and on numbers (">=1000"). Criteria strings in
 * formulas stay diacritics-free ("Biuro", "IT", "OPLACONA") for forgiving
 * exact-match value checks on results.
 */
function invoicesSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": { "0": { v: "Dział" }, "1": { v: "Kwota (zł)" }, "2": { v: "Status" } },
      "1": { "0": { v: "Biuro" }, "1": { v: 450 }, "2": { v: "OPLACONA" } },
      "2": { "0": { v: "IT" }, "1": { v: 1200 }, "2": { v: "OCZEKUJE" } },
      "3": { "0": { v: "Marketing" }, "1": { v: 780 }, "2": { v: "OPLACONA" } },
      "4": { "0": { v: "Biuro" }, "1": { v: 320 }, "2": { v: "OCZEKUJE" } },
      "5": { "0": { v: "IT" }, "1": { v: 950 }, "2": { v: "OPLACONA" } },
      "6": { "0": { v: "Marketing" }, "1": { v: 150 }, "2": { v: "OCZEKUJE" } },
      "7": { "0": { v: "Biuro" }, "1": { v: 210 }, "2": { v: "OPLACONA" } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Faktury", 20, 10, rows);
}

export const sumaJezeliLesson: LessonInput = {
  slug: "suma-jezeli",
  title: "Sumowanie warunkowe: SUMIF i COUNTIF",
  shortDescription:
    "SUMIF i COUNTIF: suma i licznik tylko dla wierszy spełniających warunek — raport z rejestru faktur.",
  category: "Formuły i funkcje",
  difficulty: 2,
  estimatedMinutes: 25,
  prerequisites: ["logika-jezeli"],
  learningGoals: [
    "Sumować wartości spełniające warunek funkcją SUMIF",
    "Liczyć wiersze spełniające warunek funkcją COUNTIF",
    "Podawać kryterium tekstowe (dział) i liczbowe (>=1000)",
    "Wiedzieć, kiedy SUMIF potrzebuje trzeciego argumentu",
  ],
  tasks: [
    {
      title: "Ile wydaje biuro? — SUMIF",
      instructions:
        "W **E2** (obok etykiety w D2) policz sumę faktur działu **Biuro**:\n" +
        '`=SUMIF(A2:A8,"Biuro",B2:B8)`\n' +
        "Czytamy: szukaj „Biuro” w A2:A8 i **dodawaj** odpowiadające im kwoty z B2:B8.\n" +
        "(W polskim Excelu: **SUMA.JEŻELI** — ten arkusz liczy angielskie nazwy.)",
      initialWorkbook: invoicesSheet({
        "1": { "3": { v: "Suma dla Biura (zł)" } },
      }),
      hints: [
        "Kryterium („Biuro”) zawsze w cudzysłowach.",
        "Trzeci argument to kolumna z liczbami — pierwsza (A) tylko „wskazuje palcem”.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E2",
          aliases: ['=SUMIF(A2:A8,"Biuro",B2:B8)'],
        },
        { type: "cellValue", cell: "E2", expected: 980, tolerance: 0.01 },
      ],
    },
    {
      title: "Ile to faktur? — COUNTIF",
      instructions:
        "Teraz nie suma, tylko **licznik**: w **E3** policz, ile faktur wystawił dział **IT**:\n" +
        '`=COUNTIF(A2:A8,"IT")`\n' +
        "COUNTIF ma tylko dwa argumenty — nic tu nie sumujemy, tylko liczymy trafienia. (Po polsku: **LICZ.JEŻELI**.)",
      initialWorkbook: invoicesSheet({
        "1": { "3": { v: "Suma dla Biura (zł)" }, "4": { f: '=SUMIF(A2:A8,"Biuro",B2:B8)' } },
        "2": { "3": { v: "Faktury IT" } },
      }),
      hints: [
        "COUNTIF nie ma trzeciego argumentu — zakres i kryterium wystarczą.",
      ],
      checks: [
        { type: "cellFormula", cell: "E3", aliases: ['=COUNTIF(A2:A8,"IT")'] },
        { type: "cellValue", cell: "E3", expected: 2 },
      ],
    },
    {
      title: "Kryterium liczbowe — faktury powyżej 1000 zł",
      instructions:
        "Warunkiem może być też **porównanie liczbowe** — całe wyrażenie wpisujesz w cudzysłowach. W **E4** policz sumę faktur o kwocie **co najmniej 1000 zł**:\n" +
        '`=SUMIF(B2:B8,">=1000")`\n' +
        "Gdy kryterium dotyczy tej samej kolumny, którą sumujesz, trzeci argument nie jest potrzebny.",
      initialWorkbook: invoicesSheet({
        "1": { "3": { v: "Suma dla Biura (zł)" }, "4": { f: '=SUMIF(A2:A8,"Biuro",B2:B8)' } },
        "2": { "3": { v: "Faktury IT" }, "4": { f: '=COUNTIF(A2:A8,"IT")' } },
        "3": { "3": { v: "Faktury >=1000 (zł)" } },
      }),
      hints: [
        "Cudzysłów obejmuje całe `>=1000` — razem ze znakiem porównania.",
        "Trafia tylko faktura 1200 zł — jedna pozycja, więc suma równa 1200.",
      ],
      checks: [
        { type: "cellFormula", cell: "E4", aliases: ['=SUMIF(B2:B8,">=1000")'] },
        { type: "cellValue", cell: "E4", expected: 1200, tolerance: 0.01 },
      ],
    },
    {
      title: "Raport — ile do zapłaty",
      instructions:
        "Na koniec odpowiedz na pytanie kierownika: **jaka kwota czeka jeszcze na zapłatę?** W **E5** zsumuj faktury o statusie `OCZEKUJE`:\n" +
        '`=SUMIF(C2:C8,"OCZEKUJE",B2:B8)`\n' +
        "To ten sam wzorzec co w pierwszym zadaniu — tylko kryterium patrzy na kolumnę statusu.",
      initialWorkbook: invoicesSheet({
        "1": { "3": { v: "Suma dla Biura (zł)" }, "4": { f: '=SUMIF(A2:A8,"Biuro",B2:B8)' } },
        "2": { "3": { v: "Faktury IT" }, "4": { f: '=COUNTIF(A2:A8,"IT")' } },
        "3": { "3": { v: "Faktury >=1000 (zł)" }, "4": { f: '=SUMIF(B2:B8,">=1000")' } },
        "4": { "3": { v: "Do zapłaty (zł)" } },
      }),
      hints: [
        "OPLACONA i OCZEKUJE — arkusz rozróżnia wielkość liter? Nie, ale tekst musi się zgadzać co do znaku.",
        "Czekają trzy faktury: 1200 + 320 + 150.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "E5",
          aliases: ['=SUMIF(C2:C8,"OCZEKUJE",B2:B8)'],
        },
        { type: "cellValue", cell: "E5", expected: 1670, tolerance: 0.01 },
      ],
    },
  ],
};
