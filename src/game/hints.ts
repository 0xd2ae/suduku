import { DIGITS } from "./constants";
import { getCandidates } from "./candidates";
import type { Cell, CellPosition, Hint } from "./types";

function positions(cells: Cell[]): CellPosition[] {
  return cells.map(({ row, col }) => ({ row, col }));
}

export function getNextHint(cells: Cell[]): Hint | null {
  for (const cell of cells) {
    if (cell.value !== null) continue;
    const candidates = getCandidates(cells, cell.row, cell.col);
    if (candidates.length === 1) {
      return {
        cell: { row: cell.row, col: cell.col },
        value: candidates[0],
        strategy: "naked-single",
        explanation: "这个格子的同行、同列和同宫已经排除了其他数字。",
        relatedCells: positions(
          cells.filter(
            (peer) =>
              peer.value !== null &&
              (peer.row === cell.row || peer.col === cell.col || peer.box === cell.box),
          ),
        ),
      };
    }
  }

  for (let row = 0; row < 9; row += 1) {
    const hint = hiddenSingle(cells, cells.filter((cell) => cell.row === row), "row");
    if (hint) return hint;
  }
  for (let col = 0; col < 9; col += 1) {
    const hint = hiddenSingle(cells, cells.filter((cell) => cell.col === col), "column");
    if (hint) return hint;
  }
  for (let box = 0; box < 9; box += 1) {
    const hint = hiddenSingle(cells, cells.filter((cell) => cell.box === box), "box");
    if (hint) return hint;
  }

  return null;
}

function hiddenSingle(cells: Cell[], group: Cell[], kind: "row" | "column" | "box"): Hint | null {
  for (const digit of DIGITS) {
    const possible = group.filter(
      (cell) => cell.value === null && getCandidates(cells, cell.row, cell.col).includes(digit),
    );
    if (possible.length !== 1) continue;
    const cell = possible[0];
    const strategy =
      kind === "row"
        ? "hidden-single-row"
        : kind === "column"
          ? "hidden-single-column"
          : "hidden-single-box";
    const unit = kind === "row" ? "这一行" : kind === "column" ? "这一列" : "这个 3x3 宫";
    return {
      cell: { row: cell.row, col: cell.col },
      value: digit,
      strategy,
      explanation: `${unit}中，数字 ${digit} 只能放在这个格子。`,
      relatedCells: positions(group),
    };
  }
  return null;
}

