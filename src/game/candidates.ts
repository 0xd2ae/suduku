import { DIGITS } from "./constants";
import { cellIndex } from "./cellUtils";
import type { Cell } from "./types";

export function getCandidates(cells: Cell[], row: number, col: number): number[] {
  const cell = cells[cellIndex(row, col)];
  if (!cell || cell.value !== null) return [];

  const used = new Set<number>();
  for (const peer of cells) {
    if (
      peer.value !== null &&
      (peer.row === row || peer.col === col || peer.box === cell.box)
    ) {
      used.add(peer.value);
    }
  }

  return DIGITS.filter((digit) => !used.has(digit));
}

export function applyAutoNotes(cells: Cell[]): Cell[] {
  return cells.map((cell) => ({
    ...cell,
    notes:
      cell.value === null
        ? new Set(getCandidates(cells, cell.row, cell.col))
        : new Set<number>(),
  }));
}

export function removePeerNotes(cells: Cell[], row: number, col: number, value: number): Cell[] {
  const origin = cells[cellIndex(row, col)];
  return cells.map((cell) => {
    if (cell.value !== null || !cell.notes.has(value)) return cell;
    if (cell.row !== row && cell.col !== col && cell.box !== origin.box) return cell;
    const notes = new Set(cell.notes);
    notes.delete(value);
    return { ...cell, notes };
  });
}

