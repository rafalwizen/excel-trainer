/**
 * Difficulty scale shared by all lessons. Stored on lessons as an int 1-3
 * (see schema.ts); this module maps it to the Polish level names used
 * across the UI (catalog filters, lesson cards, runner header).
 */
export const DIFFICULTY_LEVELS = [
  "Podstawowy",
  "Średniozaawansowany",
  "Zaawansowany",
] as const;

export type Difficulty = 1 | 2 | 3;

export function difficultyLabel(difficulty: number): string {
  return DIFFICULTY_LEVELS[difficulty - 1];
}
