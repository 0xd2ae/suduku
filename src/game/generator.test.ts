import { describe, expect, it } from "vitest";
import { DIFFICULTY_GIVENS, generatePuzzleFromSolution, generateSolvedGrid } from "./generator";
import { hasUniqueSolution } from "./solver";
import { isCompleteSolution } from "../../scripts/validate-generated-puzzles";

describe("generator", () => {
  it("generateSolvedGrid returns a valid solved sudoku", () => {
    const solution = generateSolvedGrid("generator-test");
    expect(solution).toMatch(/^[1-9]{81}$/);
    expect(isCompleteSolution(solution)).toBe(true);
  });

  it("uses deterministic seeds", () => {
    expect(generateSolvedGrid("same-seed")).toBe(generateSolvedGrid("same-seed"));
  });

  it("different seeds usually generate different grids", () => {
    expect(generateSolvedGrid("seed-a")).not.toBe(generateSolvedGrid("seed-b"));
  });

  it("generatePuzzleFromSolution creates a unique puzzle in the target givens range", () => {
    const solution = generateSolvedGrid("puzzle-seed");
    const result = generatePuzzleFromSolution({ solution, difficulty: "easy", seed: "puzzle-seed" });
    const range = DIFFICULTY_GIVENS.easy;
    expect(result.givens).toBeGreaterThanOrEqual(range.min);
    expect(result.givens).toBeLessThanOrEqual(range.max);
    expect(hasUniqueSolution(result.puzzle)).toBe(true);
  });
});
