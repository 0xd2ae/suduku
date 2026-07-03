import { describe, expect, it } from "vitest";
import { areCellsRelated, boxIndex, cellIndex, isSameNumberHighlight } from "./cellUtils";
import type { Cell } from "./types";

function makeCell(overrides: Partial<Cell>): Cell {
  return {
    row: 0,
    col: 0,
    box: 0,
    value: null,
    solution: 1,
    given: false,
    notes: new Set<number>(),
    error: false,
    ...overrides,
  };
}

describe("boxIndex", () => {
  it("maps every row/col pair to the correct 3x3 box (0-8)", () => {
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const expected = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        expect(boxIndex(row, col)).toBe(expected);
      }
    }
  });

  it("matches known corner and center boxes", () => {
    expect(boxIndex(0, 0)).toBe(0);
    expect(boxIndex(0, 8)).toBe(2);
    expect(boxIndex(8, 0)).toBe(6);
    expect(boxIndex(8, 8)).toBe(8);
    expect(boxIndex(4, 4)).toBe(4);
  });

  it("stays constant across an entire 3x3 box and changes across the boundary", () => {
    expect(boxIndex(2, 2)).toBe(boxIndex(0, 0));
    expect(boxIndex(3, 2)).not.toBe(boxIndex(2, 2));
    expect(boxIndex(2, 3)).not.toBe(boxIndex(2, 2));
  });
});

describe("cellIndex", () => {
  it("is row-major and matches boxIndex's grid semantics", () => {
    expect(cellIndex(0, 0)).toBe(0);
    expect(cellIndex(0, 8)).toBe(8);
    expect(cellIndex(1, 0)).toBe(9);
    expect(cellIndex(8, 8)).toBe(80);
  });
});

describe("areCellsRelated", () => {
  it("is true for cells sharing a row", () => {
    const a = makeCell({ row: 3, col: 1, box: boxIndex(3, 1) });
    const b = makeCell({ row: 3, col: 7, box: boxIndex(3, 7) });
    expect(areCellsRelated(a, b)).toBe(true);
  });

  it("is true for cells sharing a column", () => {
    const a = makeCell({ row: 1, col: 4, box: boxIndex(1, 4) });
    const b = makeCell({ row: 6, col: 4, box: boxIndex(6, 4) });
    expect(areCellsRelated(a, b)).toBe(true);
  });

  it("is true for cells sharing a 3x3 box even with different row and column", () => {
    const a = makeCell({ row: 0, col: 0, box: boxIndex(0, 0) });
    const b = makeCell({ row: 2, col: 2, box: boxIndex(2, 2) });
    expect(a.row).not.toBe(b.row);
    expect(a.col).not.toBe(b.col);
    expect(areCellsRelated(a, b)).toBe(true);
  });

  it("is false for cells with no shared row, column, or box", () => {
    const a = makeCell({ row: 0, col: 0, box: boxIndex(0, 0) });
    const b = makeCell({ row: 4, col: 5, box: boxIndex(4, 5) });
    expect(areCellsRelated(a, b)).toBe(false);
  });

  it("is true for a cell compared with itself", () => {
    const a = makeCell({ row: 5, col: 5, box: boxIndex(5, 5) });
    expect(areCellsRelated(a, a)).toBe(true);
  });
});

describe("isSameNumberHighlight", () => {
  it("matches when the cell value equals the highlighted value", () => {
    expect(isSameNumberHighlight(makeCell({ value: 7 }), 7)).toBe(true);
  });

  it("does not match a different value", () => {
    expect(isSameNumberHighlight(makeCell({ value: 7 }), 3)).toBe(false);
  });

  it("does not match an empty cell even if a highlight value is active", () => {
    expect(isSameNumberHighlight(makeCell({ value: null }), 7)).toBe(false);
  });

  it("does not match anything when no highlight value is selected", () => {
    expect(isSameNumberHighlight(makeCell({ value: 7 }), null)).toBe(false);
  });

  it("matches given cells the same as user-filled cells", () => {
    expect(isSameNumberHighlight(makeCell({ value: 4, given: true }), 4)).toBe(true);
    expect(isSameNumberHighlight(makeCell({ value: 4, given: false }), 4)).toBe(true);
  });
});
