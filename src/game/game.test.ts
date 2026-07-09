import { describe, expect, it } from "vitest";
import { applyAutoNotes, getCandidates } from "./candidates";
import { boxIndex, cellIndex, cloneCells } from "./cellUtils";
import { getDailyPuzzle } from "./daily";
import { createMove } from "./history";
import { getNextHint } from "./hints";
import { parsePuzzle } from "./puzzleParser";
import { countSolutions, hasUniqueSolution, solve } from "./solver";
import { markErrors, validateBoard } from "./validator";
const puzzle = {
  id: "test-001",
  difficulty: "easy" as const,
  puzzle: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
  solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  givens: 30,
  seed: "test",
  generatedAt: "2026-07-03T00:00:00.000Z",
  rating: { score: 10, strategies: ["naked-single"] },
};

describe("parsePuzzle", () => {
  it("parses puzzle cells with positions and givens", () => {
    const cells = parsePuzzle(puzzle);
    expect(cells).toHaveLength(81);
    expect(cells[0]).toMatchObject({ row: 0, col: 0, box: 0, value: 5, solution: 5, given: true });
    expect(cells[2]).toMatchObject({ row: 0, col: 2, box: 0, value: null, solution: 4, given: false });
  });

  it("creates editable empty cells with empty notes and correct box indexes", () => {
    const cells = parsePuzzle(puzzle);
    expect(cells[2].given).toBe(false);
    expect(cells[2].notes.size).toBe(0);
    expect(cells[cellIndex(4, 4)].box).toBe(boxIndex(4, 4));
    expect(cells[cellIndex(8, 8)].box).toBe(8);
  });

  it("rejects givens that do not match the solution", () => {
    expect(() => parsePuzzle({ ...puzzle, puzzle: `9${puzzle.puzzle.slice(1)}` })).toThrow(
      "puzzle value must match solution",
    );
  });
});

describe("candidates", () => {
  it("computes legal candidates for an empty cell", () => {
    const cells = parsePuzzle(puzzle);
    expect(getCandidates(cells, 0, 2)).toEqual([1, 2, 4]);
  });

  it("excludes row, column, and box values without using the hidden solution", () => {
    const cells = parsePuzzle(puzzle);
    expect(cells[cellIndex(0, 2)].solution).toBe(4);
    expect(getCandidates(cells, 0, 2)).toContain(4);
    expect(getCandidates(cells, 0, 2)).not.toContain(3);
    expect(getCandidates(cells, 0, 2)).not.toContain(6);
    expect(getCandidates(cells, 0, 2)).not.toContain(8);
  });

  it("returns no candidates for filled cells", () => {
    expect(getCandidates(parsePuzzle(puzzle), 0, 0)).toEqual([]);
  });

  it("generates auto notes only for empty cells", () => {
    const cells = applyAutoNotes(parsePuzzle(puzzle));
    expect([...cells[2].notes]).toEqual([1, 2, 4]);
    expect(cells[0].notes.size).toBe(0);
  });
});

describe("validator", () => {
  it("detects a solved board", () => {
    const solvedCells = parsePuzzle({ ...puzzle, puzzle: puzzle.solution });
    expect(validateBoard(solvedCells)).toEqual({ solved: true, errors: [] });
  });

  it("flags wrong user values", () => {
    const cells = parsePuzzle(puzzle);
    cells[2] = { ...cells[2], value: 9 };
    const result = validateBoard(cells);
    expect(result.solved).toBe(false);
    expect(result.errors.some((error) => error.row === 0 && error.col === 2)).toBe(true);
  });

  it("supports conflict-only check mode", () => {
    const cells = parsePuzzle(puzzle);
    cells[2] = { ...cells[2], value: 1 };
    expect(validateBoard(cells, "conflict-only").errors).toEqual([]);
    expect(validateBoard(cells, "solution-check").errors.some((error) => error.reason === "wrong-value")).toBe(true);
  });

  it("still detects duplicates in conflict-only mode", () => {
    const cells = parsePuzzle(puzzle);
    cells[2] = { ...cells[2], value: 5 };
    const result = validateBoard(cells, "conflict-only");
    expect(result.errors.some((error) => error.row === 0 && error.col === 2)).toBe(true);
  });

  it("clears errors when a wrong value is deleted", () => {
    const cells = parsePuzzle(puzzle);
    cells[2] = { ...cells[2], value: 9 };
    expect(validateBoard(cells, "solution-check").errors.some((error) => error.row === 0 && error.col === 2)).toBe(
      true,
    );
    cells[2] = { ...cells[2], value: null };
    expect(validateBoard(cells, "solution-check").errors).toEqual([]);
  });

  it("marks every cell in a duplicate conflict, including the given cell it duplicates", () => {
    const cells = parsePuzzle(puzzle);
    // (0,0) is a given 5; setting (0,2) to 5 duplicates it within the same row and box.
    cells[2] = { ...cells[2], value: 5 };
    const result = validateBoard(cells, "conflict-only");
    const positions = new Set(result.errors.map((error) => `${error.row}-${error.col}`));
    expect(positions.has("0-0")).toBe(true);
    expect(positions.has("0-2")).toBe(true);
    expect(result.errors.every((error) => error.reason !== "wrong-value")).toBe(true);
  });

  it("markErrors flags both sides of a duplicate pair, including a given cell", () => {
    const cells = parsePuzzle(puzzle);
    cells[2] = { ...cells[2], value: 5 };
    const marked = markErrors(cells, "conflict-only");
    expect(marked[cellIndex(0, 0)].error).toBe(true);
    expect(marked[cellIndex(0, 2)].error).toBe(true);
    expect(marked[cellIndex(0, 0)].given).toBe(true);
  });

  it("never assigns a given cell the wrong-value reason, even when it conflicts with a duplicate", () => {
    const cells = parsePuzzle(puzzle);
    // (2,1) is a given 9; setting (0,2) to 9 duplicates it within the same box.
    cells[2] = { ...cells[2], value: 9 };
    const result = validateBoard(cells, "solution-check");
    const givenPositions = new Set(cells.filter((cell) => cell.given).map((cell) => `${cell.row}-${cell.col}`));
    const wrongValueOnGiven = result.errors.some(
      (error) => error.reason === "wrong-value" && givenPositions.has(`${error.row}-${error.col}`),
    );
    expect(wrongValueOnGiven).toBe(false);
    expect(result.errors.some((error) => error.row === 2 && error.col === 1)).toBe(true);
  });
});

describe("solver", () => {
  it("solves a valid puzzle", () => {
    expect(solve(puzzle.puzzle)).toBe(puzzle.solution);
  });

  it("detects a unique solution", () => {
    expect(hasUniqueSolution(puzzle.puzzle)).toBe(true);
  });

  it("stops counting after the solution limit", () => {
    expect(countSolutions("0".repeat(81), 2)).toBe(2);
  });

  it("treats conflicting givens as unsolvable", () => {
    const invalid = `55${"0".repeat(79)}`;
    expect(solve(invalid)).toBeNull();
    expect(countSolutions(invalid, 2)).toBe(0);
    expect(hasUniqueSolution(invalid)).toBe(false);
  });
});

describe("hints", () => {
  it("returns a playable hint", () => {
    const cells = parsePuzzle(puzzle);
    const hint = getNextHint(cells);
    expect(hint).not.toBeNull();
    const target = cells[cellIndex(hint?.cell.row ?? 0, hint?.cell.col ?? 0)];
    expect(target.given).toBe(false);
    expect(target.value).toBeNull();
    expect(hint?.value).toBe(target.solution);
    expect(hint?.value).toBeGreaterThanOrEqual(1);
    expect(hint?.value).toBeLessThanOrEqual(9);
    expect(hint?.relatedCells.every((cell) => cell.row >= 0 && cell.row < 9 && cell.col >= 0 && cell.col < 9)).toBe(
      true,
    );
  });
});

describe("history", () => {
  it("stores immutable before and after cells", () => {
    const before = parsePuzzle(puzzle);
    const after = cloneCells(before);
    after[2] = { ...after[2], value: 4 };
    const move = createMove(before, after, "set-value");
    after[2].value = 8;
    expect(move.after[2].value).toBe(4);
    expect(move.before[2].value).toBeNull();
  });
});

describe("daily", () => {
  it("selects the same puzzle for the same date and difficulty", () => {
    const first = getDailyPuzzle("2026-07-03", "easy", [puzzle]);
    const second = getDailyPuzzle("2026-07-03", "easy", [puzzle]);
    expect(first.id).toBe(second.id);
  });
});
