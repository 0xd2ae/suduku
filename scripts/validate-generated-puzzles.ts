import { generatedPuzzles } from "../src/data/puzzles.generated";
import { DIFFICULTY_GIVENS } from "../src/game/generator";
import { ratePuzzle } from "../src/game/rater";
import { hasUniqueSolution } from "../src/game/solver";
import type { Difficulty, Puzzle } from "../src/game/types";

const difficulties: Difficulty[] = ["easy", "medium", "hard", "expert"];

export function isCompleteSolution(solution: string): boolean {
  const groups: string[] = [];
  for (let index = 0; index < 9; index += 1) {
    groups.push(solution.slice(index * 9, index * 9 + 9));
    groups.push(Array.from({ length: 9 }, (_, row) => solution[row * 9 + index]).join(""));
  }
  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      let group = "";
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          group += solution[(boxRow * 3 + row) * 9 + boxCol * 3 + col];
        }
      }
      groups.push(group);
    }
  }
  return groups.every((group) => group.split("").sort().join("") === "123456789");
}

export function validateGeneratedPuzzles(puzzles: Puzzle[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const puzzleStrings = new Set<string>();
  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0 };

  for (const puzzle of puzzles) {
    const prefix = puzzle.id || "(missing id)";
    if (ids.has(puzzle.id)) errors.push(`${prefix}: duplicate id`);
    ids.add(puzzle.id);
    if (puzzleStrings.has(puzzle.puzzle)) errors.push(`${prefix}: duplicate puzzle`);
    puzzleStrings.add(puzzle.puzzle);

    if (!/^\d{81}$/.test(puzzle.puzzle)) errors.push(`${prefix}: puzzle must be 81 chars 0-9`);
    if (!/^[1-9]{81}$/.test(puzzle.solution)) errors.push(`${prefix}: solution must be 81 chars 1-9`);
    if (/^\d{81}$/.test(puzzle.puzzle) && /^[1-9]{81}$/.test(puzzle.solution)) {
      for (let index = 0; index < 81; index += 1) {
        const given = puzzle.puzzle[index];
        if (given !== "0" && given !== puzzle.solution[index]) {
          errors.push(`${prefix}: given mismatch at index ${index}`);
          break;
        }
      }
      if (!isCompleteSolution(puzzle.solution)) errors.push(`${prefix}: invalid complete solution`);
      const givens = puzzle.puzzle.split("").filter((char) => char !== "0").length;
      if (puzzle.givens !== givens) errors.push(`${prefix}: givens field should be ${givens}`);
      if (givens < 17) errors.push(`${prefix}: puzzle must have at least 17 givens`);
      const range = DIFFICULTY_GIVENS[puzzle.difficulty];
      if (givens < range.min || givens > range.max) {
        errors.push(`${prefix}: givens ${givens} outside ${puzzle.difficulty} range`);
      }
      if (!hasUniqueSolution(puzzle.puzzle)) errors.push(`${prefix}: puzzle is not unique`);
      const rated = ratePuzzle(puzzle.puzzle, puzzle.solution);
      if (!puzzle.rating || typeof puzzle.rating.score !== "number" || !Array.isArray(puzzle.rating.strategies)) {
        errors.push(`${prefix}: missing rating`);
      } else if (rated.difficulty !== puzzle.difficulty) {
        errors.push(`${prefix}: rated as ${rated.difficulty}, expected ${puzzle.difficulty}`);
      }
    }

    counts[puzzle.difficulty] += 1;
  }

  for (const difficulty of difficulties) {
    if (counts[difficulty] < 1) errors.push(`${difficulty}: expected at least 1 puzzle`);
  }

  return errors;
}

const isMain = process.argv[1]?.endsWith("validate-generated-puzzles.ts");
if (isMain) {
  const errors = validateGeneratedPuzzles(generatedPuzzles);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }

  const counts = difficulties.map((difficulty) => [
    difficulty,
    generatedPuzzles.filter((puzzle) => puzzle.difficulty === difficulty).length,
  ] as const);
  console.log("All generated puzzles are valid.");
  for (const [difficulty, count] of counts) console.log(`${difficulty}: ${count}`);
  console.log(`total: ${generatedPuzzles.length}`);
}
