import { workbook, type LessonInput, type WorkbookInit } from "../schema";

/**
 * Lesson 6 — first formatting lesson (cellStyle checks). Formatting cannot be
 * carried between task workbooks (cellData has no style fields), so every
 * task teaches one formatting skill on the same invoice table and the final
 * task re-applies everything from scratch as a summary. Checks only assert
 * the fields the task teaches, paired with a cellValue guard on the data.
 */
function invoiceTable(
  extraRows: Record<string, Record<string, { v?: string | number; f?: string }>> = {},
): WorkbookInit {
  const rows: Record<string, Record<string, { v?: string | number; f?: string }>> = {
    "0": {
      "0": { v: "Nr faktury" },
      "1": { v: "Kontrahent" },
      "2": { v: "Termin zapłaty" },
      "3": { v: "Kwota (zł)" },
    },
    "1": { "0": { v: "FV/2026/11/01" }, "1": { v: "Kowalski Sp. z o.o." }, "2": { v: "2026-11-10" }, "3": { v: 1250 } },
    "2": { "0": { v: "FV/2026/11/02" }, "1": { v: "Nowak Trading" }, "2": { v: "2026-11-12" }, "3": { v: 890 } },
    "3": { "0": { v: "FV/2026/11/03" }, "1": { v: "Biuro Zofia" }, "2": { v: "2026-11-15" }, "3": { v: 2300 } },
    "4": { "0": { v: "FV/2026/11/04" }, "1": { v: "Mega Serwis" }, "2": { v: "2026-11-20" }, "3": { v: 640 } },
  };
  for (const [row, cols] of Object.entries(extraRows)) {
    rows[row] = { ...rows[row], ...cols };
  }
  return workbook("Faktury", 20, 8, rows);
}

// The note the learner italicizes in task 3 (pre-filled from task 3 on).
const NOTE = "Do doprecyzowania z kontrahentem";

export const formatowanieCzcionekIKolorowLesson: LessonInput = {
  slug: "formatowanie-czcionek-i-kolorow",
  title: "Formatowanie: czcionki i kolory",
  shortDescription:
    "Pogrub nagłówki, dodaj kolor wypełnienia i kursywę — tabela faktur stanie się czytelna na pierwszy rzut oka.",
  category: "Formatowanie",
  difficulty: 1,
  learningGoals: [
    "Pogrubiać nagłówki tabeli i stosować kursywę przyciskami paska narzędzi",
    "Wyróżniać nagłówki kolorem wypełnienia komórki",
    "Zaznaczać zakresy komórek, aby formatować wiele naraz zamiast pojedynczo",
    "Wiedzieć, które elementy raportu warto wizualnie wyróżnić",
  ],
  estimatedMinutes: 15,
  tasks: [
    {
      title: "Pogrubione nagłówki",
      instructions:
        "Zaznacz wiersz nagłówków: kliknij **A1** i przeciągnij myszą do **D1** (albo kliknij A1, przytrzymaj Shift i kliknij D1). " +
        "Na pasku narzędzi kliknij przycisk **B** (pogrubienie). Cały zaznaczony wiersz nagłówków stanie się pogrubiony jednym kliknięciem.",
      initialWorkbook: invoiceTable(),
      hints: [
        "Skrót klawiszowy pogrubienia to **Ctrl+B** — działa na całym zaznaczeniu.",
        "Formatowanie stosuje się do zaznaczonych komórek — nie trzeba klikać każdej osobno.",
      ],
      checks: [
        { type: "cellStyle", cell: "A1", bold: true },
        { type: "cellStyle", cell: "B1", bold: true },
        { type: "cellStyle", cell: "C1", bold: true },
        { type: "cellStyle", cell: "D1", bold: true },
        { type: "cellValue", cell: "D1", expected: "Kwota (zł)" },
      ],
    },
    {
      title: "Kolor wypełnienia nagłówków",
      instructions:
        "Nagłówki wyróżnisz jeszcze lepiej kolorem tła. Zaznacz ponownie **A1:D1**, na pasku narzędzi kliknij przycisk **wypełnienia** " +
        "(ikona wiaderka z farbą) i wybierz z palety dowolny kolor. " +
        "Dalej po prawej stronie paska jest podobny przycisk z literą **A** — zmienia kolor czcionki; możesz poeksperymentować.",
      initialWorkbook: invoiceTable(),
      hints: [
        "Paleta otwiera się po kliknięciu strzałki obok wiaderka — potem kliknij konkretny kolor.",
        "Kolor może być dowolny — sprawdzamy tylko, czy nagłówki mają wypełnienie inne niż białe.",
      ],
      checks: [
        { type: "cellStyle", cell: "A1", backgroundSet: true },
        { type: "cellStyle", cell: "B1", backgroundSet: true },
        { type: "cellStyle", cell: "C1", backgroundSet: true },
        { type: "cellStyle", cell: "D1", backgroundSet: true },
        { type: "cellValue", cell: "A1", expected: "Nr faktury" },
      ],
    },
    {
      title: "Kursywa — notatka w tabeli",
      instructions:
        "W **A6** dopisano notatkę „" + NOTE + "”. Zaznacz **A6** i kliknij przycisk **I** (kursywa) na pasku narzędzi. " +
        "Kursywa świetnie pasuje do uwag i przypisów — odróżnia je od właściwych danych tabeli.",
      initialWorkbook: invoiceTable({ "5": { "0": { v: NOTE } } }),
      hints: [
        "Skrót klawiszowy kursywy to **Ctrl+I**.",
        "Kliknij samą komórkę A6 — tym razem nie potrzebujesz zakresu.",
      ],
      checks: [
        { type: "cellStyle", cell: "A6", italic: true },
        { type: "cellValue", cell: "A6", expected: NOTE },
      ],
    },
    {
      title: "Podsumowanie: czytelny raport faktur",
      instructions:
        "Zebrałeś całą lekcję — sformatuj raport od zera:\n" +
        "- **A1:D1**: nagłówki pogrubione **i** z dowolnym kolorem wypełnienia\n" +
        "- **A6**: notatka kursywą\n" +
        "- **A7** „Razem (zł)”: kursywa\n" +
        "- **D7** (suma): pogrubienie\n" +
        "Suma w D7 jest już policzona — ty zajmujesz się tylko formatowaniem.",
      initialWorkbook: invoiceTable({
        "5": { "0": { v: NOTE } },
        "6": { "0": { v: "Razem (zł)" }, "3": { f: "=SUM(D2:D5)" } },
      }),
      hints: [
        "Najpierw zaznacz A1:D1 i nałóż oba formaty naraz (B + wiaderko), potem pojedyncze komórki.",
        "Zaczepisz się? Przejdź poprzednie zadania — tu używasz dokładnie tych samych przycisków.",
      ],
      checks: [
        { type: "cellStyle", cell: "A1", bold: true, backgroundSet: true },
        { type: "cellStyle", cell: "D1", bold: true, backgroundSet: true },
        { type: "cellStyle", cell: "A6", italic: true },
        { type: "cellStyle", cell: "A7", italic: true },
        { type: "cellStyle", cell: "D7", bold: true },
        { type: "cellValue", cell: "D7", expected: 5080, tolerance: 0.01 },
      ],
    },
  ],
};
