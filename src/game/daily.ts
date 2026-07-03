import { puzzlesByDifficulty } from "../data/puzzles.generated";
import type { Difficulty, Puzzle } from "./types";

export function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getDailyPuzzle(date: string, difficulty: Difficulty, puzzles?: Puzzle[]): Puzzle {
  const pool = puzzles ?? puzzlesByDifficulty[difficulty];
  if (pool.length === 0) throw new Error(`No puzzles for difficulty ${difficulty}`);
  return pool[stableHash(`${date}-${difficulty}`) % pool.length];
}
