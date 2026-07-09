import type { Cell } from "./types";

export function cellIndex(row: number, col: number): number {
  return row * 9 + col;
}

export function boxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

export function areCellsRelated(a: Cell, b: Cell): boolean {
  return a.row === b.row || a.col === b.col || a.box === b.box;
}

export function isSameNumberHighlight(cell: Cell, highlightValue: number | null): boolean {
  return highlightValue !== null && cell.value !== null && cell.value === highlightValue;
}

export function cloneCells(cells: Cell[]): Cell[] {
  return cells.map((cell) => ({
    ...cell,
    notes: new Set(cell.notes),
  }));
}

export function serializeCells(cells: Cell[]) {
  return cells.map((cell) => ({
    ...cell,
    notes: [...cell.notes],
  }));
}

export function deserializeCells(cells: ReturnType<typeof serializeCells>): Cell[] {
  return cells.map((cell) => ({
    ...cell,
    notes: new Set(cell.notes),
  }));
}

