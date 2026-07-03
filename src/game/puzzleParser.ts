import { boxIndex } from "./cellUtils";
import type { Cell, Puzzle } from "./types";

function assertPuzzleString(value: string, label: string): void {
  if (!/^\d{81}$/.test(value)) {
    throw new Error(`${label} must be exactly 81 digits`);
  }
}

export function parsePuzzle(puzzle: Puzzle): Cell[] {
  assertPuzzleString(puzzle.puzzle, "puzzle");
  assertPuzzleString(puzzle.solution, "solution");

  return puzzle.puzzle.split("").map((char, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const value = Number(char);
    const solution = Number(puzzle.solution[index]);

    if (solution < 1 || solution > 9) {
      throw new Error("solution must contain only digits 1-9");
    }

    if (value !== 0 && value !== solution) {
      throw new Error("puzzle value must match solution at every given cell");
    }

    return {
      row,
      col,
      box: boxIndex(row, col),
      value: value === 0 ? null : value,
      solution,
      given: value !== 0,
      notes: new Set<number>(),
      error: false,
    };
  });
}

