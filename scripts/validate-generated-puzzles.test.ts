import { describe, expect, it } from "vitest";
import { generatedPuzzles } from "../src/data/puzzles.generated";
import { validateGeneratedPuzzles } from "./validate-generated-puzzles";

describe("validate-generated-puzzles", () => {
  it("accepts generated puzzles", () => {
    expect(validateGeneratedPuzzles(generatedPuzzles)).toEqual([]);
  });

  it("detects bad puzzles", () => {
    const bad = {
      ...generatedPuzzles[0],
      id: "bad-0001",
      puzzle: `9${generatedPuzzles[0].puzzle.slice(1)}`,
    };
    const errors = validateGeneratedPuzzles([bad, generatedPuzzles[1], generatedPuzzles[2], generatedPuzzles[3]]);
    expect(errors.some((error) => error.includes("bad-0001"))).toBe(true);
  });
});
