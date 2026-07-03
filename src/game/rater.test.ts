import { describe, expect, it } from "vitest";
import { ratePuzzle } from "./rater";
import { generatedPuzzles } from "../data/puzzles.generated";

describe("rater", () => {
  it("returns a valid difficulty", () => {
    const puzzle = generatedPuzzles[0];
    const rating = ratePuzzle(puzzle.puzzle, puzzle.solution);
    expect(["easy", "medium", "hard", "expert"]).toContain(rating.difficulty);
    expect(rating.score).toBeGreaterThanOrEqual(0);
    expect(rating.strategies.length).toBeGreaterThan(0);
  });
});
