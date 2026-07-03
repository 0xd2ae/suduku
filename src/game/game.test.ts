import { describe, expect, it } from "vitest";
import { applyAutoNotes, getCandidates } from "./candidates";
import { cloneCells } from "./cellUtils";
import { getDailyPuzzle } from "./daily";
import { createMove } from "./history";
import { getNextHint } from "./hints";
import { parsePuzzle } from "./puzzleParser";
import { countSolutions, hasUniqueSolution, solve } from "./solver";
import { validateBoard } from "./validator";
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
});

describe("candidates", () => {
  it("computes legal candidates for an empty cell", () => {
    const cells = parsePuzzle(puzzle);
    expect(getCandidates(cells, 0, 2)).toEqual([1, 2, 4]);
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
});

describe("hints", () => {
  it("returns a playable hint", () => {
    const cells = parsePuzzle(puzzle);
    const hint = getNextHint(cells);
    expect(hint).not.toBeNull();
    expect(hint?.value).toBeGreaterThanOrEqual(1);
    expect(hint?.value).toBeLessThanOrEqual(9);
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
