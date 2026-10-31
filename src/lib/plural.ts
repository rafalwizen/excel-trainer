/**
 * Polish plural form picker: 1 zadanie / 2-4 zadania / 5+ zadań.
 * Teens (12-14) take the "many" form, as in Polish.
 */
export function plPlural(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return few;
  }
  return many;
}
