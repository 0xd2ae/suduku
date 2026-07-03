import type { Cell } from "./types";

export function cellIndex(row: number, col: number): number {
  return row * 9 + col;
}

export function boxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
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

