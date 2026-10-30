/**
 * Formula normalization: both lesson content aliases and formulas read from
 * the spreadsheet go through the same function, so "=suma( B2:B5 )" matches
 * an expected "=SUM(B2:B5)". The Univer engine only understands English
 * function names, but Polish users type Polish names — the alias table maps
 * them onto English equivalents before comparison.
 */

// Polish → English function names (longest-first matters, e.g.
// "LICZ.JEŻELI" must be replaced before "LICZ", "SUMA.JEŻELI" before "SUMA").
const PL_ALIASES: Record<string, string> = {
  "WYSZUKAJ.PIONOWO": "VLOOKUP",
  "WYSZUKAJ.POZIOMO": "HLOOKUP",
  "SUMA.WARUNKÓW": "SUMIFS",
  "LICZ.WARUNKI": "COUNTIFS",
  "LICZ.JEŻELI": "COUNTIF",
  "SUMA.JEŻELI": "SUMIF",
  "ŚREDNIA.JEŻELI": "AVERAGEIF",
  "JEŻELI.BŁĄD": "IFERROR",
  "ILE.NIEPUSTYCH": "COUNTA",
  "USUŃ.ZBĘDNE.ODSTĘPY": "TRIM",
  "ZAOKR.GÓRA": "ROUNDUP",
  "ZAOKR.DÓŁ": "ROUNDDOWN",
  "ZŁĄCZ.TEKSTY": "CONCAT",
  "PODAJ.POZYCJĘ": "MATCH",
  "SZUKAJ.TEKST": "SEARCH",
  "LITERA.MAŁA": "LOWER",
  "LITERA.WIELKA": "UPPER",
  "FRAGMENT.TEKSTU": "MID",
  "ODCH.ŚREDNIE": "AVEDEV",
  "SUMA": "SUM",
  "ŚREDNIA": "AVERAGE",
  "LICZ": "COUNT",
  "JEŻELI": "IF",
  "ORAZ": "AND",
  "ZAOKR": "ROUND",
  "INDEKS": "INDEX",
  "ILOCZYN": "PRODUCT",
  "TEKST": "TEXT",
  "ZAMIEŃ": "SUBSTITUTE",
  "LEWY": "LEFT",
  "PRAWY": "RIGHT",
  "POWT": "REPT",
  "MODUŁ": "ABS",
  "POTĘGA": "POWER",
  "DŁ": "LEN",
  "DZIŚ": "TODAY",
  "TERAZ": "NOW",
};

// Sorted by length descending so longer names win during replacement.
const SORTED_ALIASES: Array<[string, string]> = Object.entries(
  PL_ALIASES,
).sort((a, b) => b[0].length - a[0].length);

export function normalizeFormula(formula: string): string {
  let f = formula.trim();
  if (f.startsWith("=")) f = f.slice(1);
  // Locale-aware uppercase keeps Polish diacritics correct (Ś, Ż, Ó...)
  f = f.toLocaleUpperCase("pl-PL");
  // Strip all whitespace: "=suma( B2 : B5 )" === "=SUMA(B2:B5)"
  f = f.replace(/\s+/g, "");
  for (const [pl, en] of SORTED_ALIASES) {
    f = f.split(pl + "(").join(en + "(");
  }
  return f;
}
