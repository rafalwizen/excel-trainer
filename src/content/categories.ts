/**
 * Curated category taxonomy for the lesson catalog. Lesson categories are
 * validated against this list (zod enum), so a typo breaks the build and the
 * catalog's filter chips stay a fixed, coherent set. Adding a category is a
 * deliberate editorial act: extend this array and give lessons the new value.
 */
export const CATEGORIES = [
  "Podstawy",
  "Formatowanie",
  "Formuły i funkcje",
  "Tekst i daty",
  "Wyszukiwanie",
  "Praca z danymi",
  "Raporty i analiza",
] as const;

export type Category = (typeof CATEGORIES)[number];
