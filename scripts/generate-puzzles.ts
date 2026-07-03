import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DIFFICULTY_GIVENS, generatePuzzleFromSolution, generateSolvedGrid } from "../src/game/generator";
import { ratePuzzle } from "../src/game/rater";
import { hasUniqueSolution } from "../src/game/solver";
import type { Difficulty, Puzzle } from "../src/game/types";

const DEFAULT_COUNTS: Record<Difficulty, number> = {
  easy: 100,
  medium: 100,
  hard: 100,
  expert: 100,
};

const MAX_ATTEMPTS_PER_PUZZLE = 200;
const MAX_TOTAL_ATTEMPTS_PER_DIFFICULTY = 50000;
const difficulties: Difficulty[] = ["easy", "medium", "hard", "expert"];

function parseCounts(): Record<Difficulty, number> {
  const counts = { ...DEFAULT_COUNTS };
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (!arg.startsWith("--")) continue;
    const difficulty = arg.slice(2) as Difficulty;
    if (!difficulties.includes(difficulty)) continue;
    const value = Number(process.argv[index + 1]);
    if (!Number.isInteger(value) || value < 0) throw new Error(`Invalid count for ${arg}`);
    counts[difficulty] = value;
    index += 1;
  }
  return counts;
}

function validateCandidate(puzzle: string, solution: string, difficulty: Difficulty): string | null {
  if (!/^\d{81}$/.test(puzzle)) return "invalid puzzle chars";
  if (!/^[1-9]{81}$/.test(solution)) return "invalid solution chars";
  const givens = puzzle.split("").filter((char) => char !== "0").length;
  const range = DIFFICULTY_GIVENS[difficulty];
  if (givens < range.min || givens > range.max) return `givens ${givens} outside target range`;
  for (let index = 0; index < 81; index += 1) {
    if (puzzle[index] !== "0" && puzzle[index] !== solution[index]) return "given mismatch";
  }
  if (!hasUniqueSolution(puzzle)) return "not unique";
  return null;
}

function formatPuzzleFile(puzzles: Puzzle[]): string {
  return `import type { Puzzle } from "../game/types";

export const generatedPuzzles: Puzzle[] = ${JSON.stringify(puzzles, null, 2)};

export const puzzlesByDifficulty = {
  easy: generatedPuzzles.filter((p) => p.difficulty === "easy"),
  medium: generatedPuzzles.filter((p) => p.difficulty === "medium"),
  hard: generatedPuzzles.filter((p) => p.difficulty === "hard"),
  expert: generatedPuzzles.filter((p) => p.difficulty === "expert"),
};
`;
}

function generate(): Puzzle[] {
  const counts = parseCounts();
  const generatedAt = new Date().toISOString();
  const puzzles: Puzzle[] = [];
  const seen = new Set<string>();

  for (const difficulty of difficulties) {
    let accepted = 0;
    let totalAttempts = 0;
    while (accepted < counts[difficulty]) {
      if (totalAttempts >= MAX_TOTAL_ATTEMPTS_PER_DIFFICULTY) {
        throw new Error(`Failed to generate ${difficulty}: reached ${MAX_TOTAL_ATTEMPTS_PER_DIFFICULTY} attempts`);
      }

      for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PUZZLE; attempt += 1) {
        totalAttempts += 1;
        if (totalAttempts > MAX_TOTAL_ATTEMPTS_PER_DIFFICULTY) break;
        const seed = `${difficulty}-${accepted + 1}-${totalAttempts}`;
        const solution = generateSolvedGrid(seed);
        const { puzzle, givens } = generatePuzzleFromSolution({ solution, difficulty, seed });
        const validationError = validateCandidate(puzzle, solution, difficulty);
        if (validationError) {
          console.log(`Discarded ${difficulty}: ${validationError}`);
          continue;
        }
        if (seen.has(puzzle)) {
          console.log(`Discarded ${difficulty}: duplicate puzzle`);
          continue;
        }

        const rating = ratePuzzle(puzzle, solution);
        if (rating.difficulty !== difficulty) {
          console.log(`Discarded ${difficulty}: rated as ${rating.difficulty}`);
          continue;
        }

        accepted += 1;
        const id = `${difficulty}-${accepted.toString().padStart(4, "0")}`;
        seen.add(puzzle);
        puzzles.push({
          id,
          difficulty,
          puzzle,
          solution,
          givens,
          seed,
          generatedAt,
          rating: {
            score: rating.score,
            strategies: rating.strategies,
          },
        });
        console.log(`Generated ${id} givens=${givens} score=${rating.score}`);
        break;
      }

      console.log(`Generating ${difficulty} puzzles: ${accepted}/${counts[difficulty]}, attempts: ${totalAttempts}`);
    }
  }

  return puzzles;
}

const outputPath = resolve(process.cwd(), "src/data/puzzles.generated.ts");
writeFileSync(outputPath, formatPuzzleFile(generate()));
console.log(`Wrote ${outputPath}`);
