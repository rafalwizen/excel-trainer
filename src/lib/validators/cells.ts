/**
 * A1-notation helpers: parsing cell refs ("B3") and ranges ("A2:C4").
 * Rows and columns are 0-based internally.
 */

const CELL_REF_RE = /^([A-Za-z]+)([1-9][0-9]*)$/;

export interface CellPos {
  row: number;
  col: number;
}

export function colToIndex(letters: string): number {
  let n = 0;
  for (const ch of letters.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - "A".charCodeAt(0) + 1);
  }
  return n - 1;
}

export function indexToCol(index: number): string {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode("A".charCodeAt(0) + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

export function parseCellRef(ref: string): CellPos | null {
  const m = CELL_REF_RE.exec(ref.trim());
  if (!m) return null;
  return { col: colToIndex(m[1]), row: Number(m[2]) - 1 };
}

export function refOf(pos: CellPos): string {
  return `${indexToCol(pos.col)}${pos.row + 1}`;
}

/** Parses "A1" or "A1:C3" into an ordered list of refs (row-major). */
export function parseRange(range: string): string[] | null {
  const parts = range.trim().split(":");
  if (parts.length === 1) {
    const p = parseCellRef(parts[0]);
    return p ? [refOf(p)] : null;
  }
  if (parts.length !== 2) return null;
  const a = parseCellRef(parts[0]);
  const b = parseCellRef(parts[1]);
  if (!a || !b) return null;
  if (a.row > b.row || a.col > b.col) return null;

  const refs: string[] = [];
  for (let row = a.row; row <= b.row; row++) {
    for (let col = a.col; col <= b.col; col++) {
      refs.push(refOf({ row, col }));
    }
  }
  return refs;
}
