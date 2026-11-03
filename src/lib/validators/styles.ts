/**
 * Normalization shared by the extractor (raw Univer reads) and the check
 * engine (authored expectations), so both sides produce the same comparison
 * keys. Keep this the single place where raw style values are interpreted.
 *
 * Empirical findings baked in (verified against Univer 1.3.1, see
 * src/content/AUTHORING.md):
 * - getBackgrounds() returns "#fff" for cells with no fill, and preserves
 *   the color string as set (e.g. "rgb(255, 230, 153)");
 * - getNumberFormats() returns "" for the default format and preserves the
 *   pattern exactly as applied (e.g. '#,##0.00 "zł"', "0%").
 */

/** Fill values that mean "no fill" once whitespace/case-normalized. */
const DEFAULT_FILLS = new Set([
  "#fff",
  "#ffffff",
  "rgb(255,255,255)",
  "white",
]);

/** Fill color comparison key: lowercase, no whitespace; white/none = no fill. */
export function normalizeColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.replace(/\s+/g, "").toLowerCase();
  if (s === "" || s === "none" || DEFAULT_FILLS.has(s)) return null;
  return s;
}

/** Number-format comparison key: lowercase, no whitespace; default = null. */
export function normalizePattern(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.replace(/\s+/g, "").toLowerCase();
  return s === "" || s === "general" ? null : s;
}
