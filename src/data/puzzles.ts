import { generatedPuzzles, puzzlesByDifficulty } from "./puzzles.generated";
import type { Difficulty, Puzzle } from "../game/types";

export const puzzles: Puzzle[] = generatedPuzzles;

export function getPuzzlesByDifficulty(difficulty: Difficulty): Puzzle[] {
  return puzzlesByDifficulty[difficulty];
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return puzzles.find((puzzle) => puzzle.id === id);
}

export function getFirstPuzzle(difficulty: Difficulty): Puzzle {
  const puzzle = getPuzzlesByDifficulty(difficulty)[0];
  if (!puzzle) throw new Error(`No puzzle found for ${difficulty}`);
  return puzzle;
}

export function getRandomPuzzle(difficulty: Difficulty): Puzzle {
  const pool = getPuzzlesByDifficulty(difficulty);
  if (pool.length === 0) throw new Error(`No puzzle found for ${difficulty}`);
  return pool[Math.floor(Math.random() * pool.length)];
}
