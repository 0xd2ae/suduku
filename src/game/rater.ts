import { DIGITS } from "./constants";
import { countSolutions } from "./solver";
import type { Difficulty } from "./types";

export type RatingResult = {
  difficulty: Difficulty;
  score: number;
  strategies: string[];
};

function getGridCandidates(grid: number[], index: number): number[] {
  if (grid[index] !== 0) return [];
  const row = Math.floor(index / 9);
  const col = index % 9;
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  const used = new Set<number>();

  for (let cursor = 0; cursor < 81; cursor += 1) {
    const peerRow = Math.floor(cursor / 9);
    const peerCol = cursor % 9;
    const peerBox = Math.floor(peerRow / 3) * 3 + Math.floor(peerCol / 3);
    if (grid[cursor] !== 0 && (peerRow === row || peerCol === col || peerBox === box)) {
      used.add(grid[cursor]);
    }
  }

  return DIGITS.filter((digit) => !used.has(digit));
}

function hiddenSingle(grid: number[], unit: number[], strategy: string): { index: number; value: number; strategy: string } | null {
  for (const digit of DIGITS) {
    const positions = unit.filter((index) => grid[index] === 0 && getGridCandidates(grid, index).includes(digit));
    if (positions.length === 1) return { index: positions[0], value: digit, strategy };
  }
  return null;
}

function estimateSearchNodes(puzzle: string): number {
  const grid = puzzle.split("").map(Number);
  let nodes = 0;
  const limit = 300;

  function bestEmpty(): number {
    let best = -1;
    let bestCount = 10;
    for (let index = 0; index < 81; index += 1) {
      if (grid[index] !== 0) continue;
      const count = getGridCandidates(grid, index).length;
      if (count < bestCount) {
        best = index;
        bestCount = count;
      }
    }
    return best;
  }

  function search(): boolean {
    if (nodes >= limit) return false;
    const index = bestEmpty();
    if (index === -1) return true;
    for (const digit of getGridCandidates(grid, index)) {
      nodes += 1;
      grid[index] = digit;
      if (search()) return true;
      grid[index] = 0;
    }
    return false;
  }

  search();
  return nodes;
}

function scoreToDifficulty(score: number): Difficulty {
  if (score < 30) return "easy";
  if (score < 60) return "medium";
  if (score < 100) return "hard";
  return "expert";
}

export function ratePuzzle(puzzle: string, solution: string): RatingResult {
  if (!/^\d{81}$/.test(puzzle) || !/^[1-9]{81}$/.test(solution)) {
    throw new Error("puzzle and solution must be 81 chars");
  }

  const grid = puzzle.split("").map(Number);
  const strategies = new Set<string>();
  let hiddenSingles = 0;

  let progressed = true;
  while (progressed) {
    progressed = false;

    for (let index = 0; index < 81; index += 1) {
      const candidates = getGridCandidates(grid, index);
      if (grid[index] === 0 && candidates.length === 1) {
        grid[index] = candidates[0];
        strategies.add("naked-single");
        progressed = true;
      }
    }

    const units: Array<{ indexes: number[]; strategy: string }> = [];
    for (let cursor = 0; cursor < 9; cursor += 1) {
      units.push({
        indexes: Array.from({ length: 9 }, (_, col) => cursor * 9 + col),
        strategy: "hidden-single-row",
      });
      units.push({
        indexes: Array.from({ length: 9 }, (_, row) => row * 9 + cursor),
        strategy: "hidden-single-column",
      });
      const boxRow = Math.floor(cursor / 3) * 3;
      const boxCol = (cursor % 3) * 3;
      units.push({
        indexes: Array.from({ length: 9 }, (_, offset) => (boxRow + Math.floor(offset / 3)) * 9 + boxCol + (offset % 3)),
        strategy: "hidden-single-box",
      });
    }

    for (const unit of units) {
      const single = hiddenSingle(grid, unit.indexes, unit.strategy);
      if (!single) continue;
      grid[single.index] = single.value;
      hiddenSingles += 1;
      strategies.add(single.strategy);
      progressed = true;
    }
  }

  const givens = puzzle.split("").filter((char) => char !== "0").length;
  const holes = 81 - givens;
  let score = Math.max(0, Math.round((holes - 35) * 2.6)) + hiddenSingles;

  if (grid.some((value) => value === 0)) {
    const nodes = estimateSearchNodes(puzzle);
    if (countSolutions(puzzle, 2) === 1) strategies.add("limited-backtracking");
    score += Math.min(80, Math.ceil(nodes / 4));
  }

  return {
    difficulty: scoreToDifficulty(score),
    score,
    strategies: [...strategies],
  };
}
