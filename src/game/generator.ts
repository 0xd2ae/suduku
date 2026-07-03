import { DIGITS } from "./constants";
import { hasUniqueSolution } from "./solver";
import type { Difficulty } from "./types";

export type RNG = () => number;

export const DIFFICULTY_GIVENS: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 36, max: 45 },
  medium: { min: 30, max: 35 },
  hard: { min: 25, max: 29 },
  expert: { min: 21, max: 24 },
};

export function createSeededRng(seed: string): RNG {
  let hash = 1779033703 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  };
}

export function shuffleWithRng<T>(values: readonly T[], rng: RNG): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function canPlace(grid: number[], index: number, value: number): boolean {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let cursor = 0; cursor < 9; cursor += 1) {
    if (grid[row * 9 + cursor] === value) return false;
    if (grid[cursor * 9 + col] === value) return false;
  }

  for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
    for (let colOffset = 0; colOffset < 3; colOffset += 1) {
      if (grid[(boxRow + rowOffset) * 9 + boxCol + colOffset] === value) return false;
    }
  }

  return true;
}

function findEmpty(grid: number[]): number {
  return grid.findIndex((value) => value === 0);
}

export function generateSolvedGrid(seed: string): string {
  const rng = createSeededRng(seed);
  const grid = Array<number>(81).fill(0);

  function backtrack(): boolean {
    const index = findEmpty(grid);
    if (index === -1) return true;

    for (const digit of shuffleWithRng(DIGITS, rng)) {
      if (!canPlace(grid, index, digit)) continue;
      grid[index] = digit;
      if (backtrack()) return true;
      grid[index] = 0;
    }

    return false;
  }

  if (!backtrack()) throw new Error(`Unable to generate solved grid for seed ${seed}`);
  return grid.join("");
}

export function generatePuzzleFromSolution(params: {
  solution: string;
  difficulty: Difficulty;
  seed: string;
}): {
  puzzle: string;
  givens: number;
} {
  if (!/^[1-9]{81}$/.test(params.solution)) {
    throw new Error("solution must be exactly 81 digits from 1-9");
  }

  const rng = createSeededRng(`${params.seed}-dig`);
  const range = DIFFICULTY_GIVENS[params.difficulty];
  const targetGivens = range.min + Math.floor(rng() * (range.max - range.min + 1));
  const grid = params.solution.split("");
  const order = shuffleWithRng(
    Array.from({ length: 41 }, (_, index) => index),
    rng,
  );

  for (const index of order) {
    const mirror = 80 - index;
    const remove = index === mirror ? [index] : [index, mirror];
    const currentlyFilled = grid.filter((char) => char !== "0").length;
    if (currentlyFilled - remove.filter((cellIndex) => grid[cellIndex] !== "0").length < targetGivens) {
      continue;
    }

    const previous = remove.map((cellIndex) => grid[cellIndex]);
    for (const cellIndex of remove) grid[cellIndex] = "0";

    const candidate = grid.join("");
    if (!hasUniqueSolution(candidate)) {
      remove.forEach((cellIndex, cursor) => {
        grid[cellIndex] = previous[cursor];
      });
    }

    const givens = grid.filter((char) => char !== "0").length;
    if (givens <= range.max && givens >= range.min) break;
  }

  if (grid.filter((char) => char !== "0").length > range.max) {
    for (const index of shuffleWithRng(
      Array.from({ length: 81 }, (_, cellIndex) => cellIndex),
      createSeededRng(`${params.seed}-single-dig`),
    )) {
      const givens = grid.filter((char) => char !== "0").length;
      if (givens <= range.max) break;
      if (grid[index] === "0" || givens - 1 < range.min) continue;

      const previous = grid[index];
      grid[index] = "0";
      if (!hasUniqueSolution(grid.join(""))) {
        grid[index] = previous;
      }
    }
  }

  const puzzle = grid.join("");
  return {
    puzzle,
    givens: puzzle.split("").filter((char) => char !== "0").length,
  };
}
