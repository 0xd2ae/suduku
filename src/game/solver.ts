import { DIGITS } from "./constants";

function parseGrid(puzzle: string): number[] {
  if (!/^\d{81}$/.test(puzzle)) {
    throw new Error("puzzle must be exactly 81 digits");
  }
  return puzzle.split("").map(Number);
}

function hasConflictingGivens(grid: number[]): boolean {
  for (let index = 0; index < grid.length; index += 1) {
    const value = grid[index];
    if (value === 0) continue;
    grid[index] = 0;
    const valid = isValid(grid, index, value);
    grid[index] = value;
    if (!valid) return true;
  }
  return false;
}

function isValid(grid: number[], index: number, value: number): boolean {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i += 1) {
    if (grid[row * 9 + i] === value) return false;
    if (grid[i * 9 + col] === value) return false;
  }

  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (grid[(boxRow + r) * 9 + boxCol + c] === value) return false;
    }
  }

  return true;
}

function findBestEmpty(grid: number[]): number {
  let bestIndex = -1;
  let bestCount = 10;
  for (let index = 0; index < grid.length; index += 1) {
    if (grid[index] !== 0) continue;
    let count = 0;
    for (const digit of DIGITS) {
      if (isValid(grid, index, digit)) count += 1;
    }
    if (count < bestCount) {
      bestCount = count;
      bestIndex = index;
    }
    if (count === 1) break;
  }
  return bestIndex;
}

export function solve(puzzle: string): string | null {
  const grid = parseGrid(puzzle);
  if (hasConflictingGivens(grid)) return null;

  function backtrack(): boolean {
    const index = findBestEmpty(grid);
    if (index === -1) return true;

    for (const digit of DIGITS) {
      if (!isValid(grid, index, digit)) continue;
      grid[index] = digit;
      if (backtrack()) return true;
      grid[index] = 0;
    }
    return false;
  }

  return backtrack() ? grid.join("") : null;
}

export function countSolutions(puzzle: string, limit = 2): number {
  const grid = parseGrid(puzzle);
  if (hasConflictingGivens(grid)) return 0;
  let count = 0;

  function backtrack(): void {
    if (count >= limit) return;
    const index = findBestEmpty(grid);
    if (index === -1) {
      count += 1;
      return;
    }

    for (const digit of DIGITS) {
      if (!isValid(grid, index, digit)) continue;
      grid[index] = digit;
      backtrack();
      grid[index] = 0;
      if (count >= limit) return;
    }
  }

  backtrack();
  return count;
}

export function hasUniqueSolution(puzzle: string): boolean {
  return countSolutions(puzzle, 2) === 1;
}
