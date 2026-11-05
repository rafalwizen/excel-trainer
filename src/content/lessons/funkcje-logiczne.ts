import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 13 — AND and OR, first standalone (raw TRUE/FALSE), then combined
 * with IF: a two-condition pass mark and a capstone IF(AND(...), IF(OR(...)))
 * verdict. Booleans surface in the snapshot as-is, so the first two tasks
 * check real boolean values.
 */
function candidatesSheet(
  extraRows: Record<string, Record<string, { v: string | number } | { f: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v: string | number } | { f: string }>> =
    {
      "0": {
        "0": { v: "Kandydat" },
        "1": { v: "Test (pkt)" },
        "2": { v: "Rozmowa (pkt)" },
      },
      "1": { "0": { v: "Nowak" }, "1": { v: 85 }, "2": { v: 96 } },
      "2": { "0": { v: "Kowalska" }, "1": { v: 68 }, "2": { v: 71 } },
      "3": { "0": { v: "Wiśniewska" }, "1": { v: 91 }, "2": { v: 65 } },
      "4": { "0": { v: "Wójcik" }, "1": { v: 75 }, "2": { v: 78 } },
      "5": { "0": { v: "Zielińska" }, "1": { v: 60 }, "2": { v: 95 } },
      "6": { "0": { v: "Lewandowski" }, "1": { v: 82 }, "2": { v: 70 } },
    };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Rekrutacja", 20, 10, rows);
}

export const funkcjeLogiczneLesson: LessonInput = {
  slug: "funkcje-logiczne",
  title: "Funkcje logiczne: ORAZ i LUB",
  shortDescription:
    "AND i OR: warunki, które muszą się zgadzać razem albo wystarczy jeden — i IF na ich kombinacji.",
  category: "Formuły i funkcje",
  difficulty: 2,
  estimatedMinutes: 25,
  prerequisites: ["logika-jezeli"],
  learningGoals: [
    "Łączyć warunki funkcją AND — wszystkie muszą być spełnione",
    "Łączyć warunki funkcją OR — wystarczy jeden",
    "Czytać surowe wyniki PRAWDA/FAŁSZ z formuł",
    "Wkładać AND i OR do funkcji IF",
  ],
  tasks: [
    {
      title: "ORAZ — oba egzaminy zdane",
      instructions:
        "Rekrutacja ma dwa etapy: test i rozmowę. Do drugiej tury przechodzi, kto zdobył **co najmniej 70 pkt z każdego**.\n" +
        "W **D2** wpisz `=AND(B2>=70,C2>=70)` — arkusz odpowie **TRUE**, gdy oba warunki są spełnione, **FALSE**, gdy choć jeden nie jest.\n" +
        "(W polskim Excelu: **ORAZ**; TRUE/FALSE to PRAWDA/FAŁSZ. Ten arkusz liczy angielskie nazwy.)",
      initialWorkbook: candidatesSheet({ "0": { "3": { v: "Oba zdane" } } }),
      hints: [
        "AND przyjmuje dowolną liczbę warunków oddzielonych przecinkami.",
        "Nowak ma 85 i 96 — oba warunki spełnione, więc wynik to TRUE.",
      ],
      checks: [
        { type: "cellFormula", cell: "D2", aliases: ["=AND(B2>=70,C2>=70)"] },
        // The grid displays TRUE/FALSE, but the snapshot surfaces booleans as 1/0.
        { type: "cellValue", cell: "D2", expected: 1 },
      ],
    },
    {
      title: "LUB — jedna mocna strona wystarczy",
      instructions:
        "Menedżer chce też zobaczyć kandydatów z **mocną stroną**: co najmniej 95 pkt z **jednego** z etapów.\n" +
        "W **E2** wpisz `=OR(B2>=95,C2>=95)` i skopiuj do **E3:E7**. " +
        "OR zwraca TRUE, gdy spełniony jest **choć jeden** warunek. (Po polsku: **LUB**.)",
      initialWorkbook: candidatesSheet({
        "0": { "3": { v: "Oba zdane" }, "4": { v: "Mocna strona" } },
        "1": { "3": { f: "=AND(B2>=70,C2>=70)" } },
      }),
      hints: [
        "Kowalska (68, 71): żaden wynik nie sięga 95, więc OR da FALSE.",
        "Kopiujesz tak jak każde inne formuły: uchwytem wypełniania albo Ctrl+C/V.",
      ],
      checks: [
        { type: "cellFormula", cell: "E2", aliases: ["=OR(B2>=95,C2>=95)"] },
        { type: "cellValue", cell: "E2", expected: 1 },
        {
          type: "rangeValues",
          range: "E3:E7",
          expected: [0, 0, 0, 1, 0],
        },
      ],
    },
    {
      title: "IF + AND — decyzja zamiast TRUE/FALSE",
      instructions:
        "Surowe TRUE/FALSE są dla analityka, nie dla ludzi. W **F2** wpisz decyzję rekrutera:\n" +
        '`=IF(AND(B2>=70,C2>=70),"DALEJ","STOP")`\n' +
        "i skopiuj do **F3:F7**. Warunek AND siedzi teraz w środku IF-a.",
      initialWorkbook: candidatesSheet({
        "0": {
          "3": { v: "Oba zdane" },
          "4": { v: "Mocna strona" },
          "5": { v: "Decyzja" },
        },
        "1": {
          "3": { f: "=AND(B2>=70,C2>=70)" },
          "4": { f: "=OR(B2>=95,C2>=95)" },
        },
        "2": { "4": { f: "=OR(B3>=95,C3>=95)" } },
        "3": { "4": { f: "=OR(B4>=95,C4>=95)" } },
        "4": { "4": { f: "=OR(B5>=95,C5>=95)" } },
        "5": { "4": { f: "=OR(B6>=95,C6>=95)" } },
        "6": { "4": { f: "=OR(B7>=95,C7>=95)" } },
      }),
      hints: [
        "Cały AND(...) pełni rolę warunku — nie musi być porównanie typu >=.",
        "Cudzysłowy wokół DALEJ i STOP są obowiązkowe: to tekst.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "F2",
          aliases: ['=IF(AND(B2>=70,C2>=70),"DALEJ","STOP")'],
          mustInclude: ["AND", "B2", "C2"],
        },
        { type: "cellValue", cell: "F2", expected: "DALEJ" },
        {
          type: "rangeValues",
          range: "F3:F7",
          expected: ["STOP", "STOP", "DALEJ", "STOP", "DALEJ"],
        },
      ],
    },
    {
      title: "Werdykt — AND i OR w jednej formule",
      instructions:
        "Podsumowanie rekrutacji: kto przechodzi dalej, dostaje etat — a przy mocnej stronie od razu **z bonusem**. W **G2** wpisz:\n" +
        '`=IF(AND(B2>=70,C2>=70),IF(OR(B2>=95,C2>=95),"ETAT+BONUS","ETAT"),"BRAK")`\n' +
        "Czytanie: JEŻELI oba zdane → sprawdź mocną stronę (bonus); w przeciwnym razie BRAK. Skopiuj do **G3:G7**.",
      initialWorkbook: candidatesSheet({
        "0": {
          "3": { v: "Oba zdane" },
          "4": { v: "Mocna strona" },
          "5": { v: "Decyzja" },
          "6": { v: "Werdykt" },
        },
        "1": {
          "3": { f: "=AND(B2>=70,C2>=70)" },
          "4": { f: "=OR(B2>=95,C2>=95)" },
          "5": { f: '=IF(AND(B2>=70,C2>=70),"DALEJ","STOP")' },
        },
        "2": {
          "4": { f: "=OR(B3>=95,C3>=95)" },
          "5": { f: '=IF(AND(B3>=70,C3>=70),"DALEJ","STOP")' },
        },
        "3": {
          "4": { f: "=OR(B4>=95,C4>=95)" },
          "5": { f: '=IF(AND(B4>=70,C4>=70),"DALEJ","STOP")' },
        },
        "4": {
          "4": { f: "=OR(B5>=95,C5>=95)" },
          "5": { f: '=IF(AND(B5>=70,C5>=70),"DALEJ","STOP")' },
        },
        "5": {
          "4": { f: "=OR(B6>=95,C6>=95)" },
          "5": { f: '=IF(AND(B6>=70,C6>=70),"DALEJ","STOP")' },
        },
        "6": {
          "4": { f: "=OR(B7>=95,C7>=95)" },
          "5": { f: '=IF(AND(B7>=70,C7>=70),"DALEJ","STOP")' },
        },
      }),
      hints: [
        "To zagnieżdżenie z lekcji o IF — tym razem w środku siedzi drugi IF z warunkiem OR.",
        "Zielińska (60, 95): do etatu się nie łapie, więc bonus już nie ma znaczenia — wynik BRAK.",
        "Policz nawiasy: trzy otwarte, trzy zamknięte.",
      ],
      checks: [
        {
          type: "cellFormula",
          cell: "G2",
          aliases: [
            '=IF(AND(B2>=70,C2>=70),IF(OR(B2>=95,C2>=95),"ETAT+BONUS","ETAT"),"BRAK")',
          ],
          mustInclude: ["AND", "OR"],
        },
        { type: "cellValue", cell: "G2", expected: "ETAT+BONUS" },
        {
          type: "rangeValues",
          range: "G3:G7",
          expected: ["BRAK", "BRAK", "ETAT", "BRAK", "ETAT"],
        },
      ],
    },
  ],
};
