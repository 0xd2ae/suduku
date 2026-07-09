import type { Cell, CheckMode, ValidationResult } from "./types";

type Reason = "wrong-value" | "duplicate-row" | "duplicate-column" | "duplicate-box";

function addError(
  errors: Map<string, { row: number; col: number; reason: string }>,
  row: number,
  col: number,
  reason: Reason,
) {
  errors.set(`${row}-${col}-${reason}`, { row, col, reason });
}

function checkGroup(cells: Cell[], reason: Reason, errors: Map<string, { row: number; col: number; reason: string }>) {
  const byValue = new Map<number, Cell[]>();
  for (const cell of cells) {
    if (cell.value === null) continue;
    byValue.set(cell.value, [...(byValue.get(cell.value) ?? []), cell]);
  }
  for (const duplicates of byValue.values()) {
    if (duplicates.length > 1) {
      for (const cell of duplicates) {
        addError(errors, cell.row, cell.col, reason);
      }
    }
  }
}

export function validateBoard(cells: Cell[], checkMode: CheckMode = "solution-check"): ValidationResult {
  const errors = new Map<string, { row: number; col: number; reason: string }>();

  if (checkMode === "solution-check") {
    for (const cell of cells) {
      if (!cell.given && cell.value !== null && cell.value !== cell.solution) {
        addError(errors, cell.row, cell.col, "wrong-value");
      }
    }
  }

  for (let index = 0; index < 9; index += 1) {
    checkGroup(
      cells.filter((cell) => cell.row === index),
      "duplicate-row",
      errors,
    );
    checkGroup(
      cells.filter((cell) => cell.col === index),
      "duplicate-column",
      errors,
    );
    checkGroup(
      cells.filter((cell) => cell.box === index),
      "duplicate-box",
      errors,
    );
  }

  const errorList = [...errors.values()];
  const solved = errorList.length === 0 && cells.every((cell) => cell.value === cell.solution);
  return { solved, errors: errorList };
}

export function markErrors(cells: Cell[], checkMode: CheckMode = "solution-check"): Cell[] {
  const validation = validateBoard(cells, checkMode);
  const errorKeys = new Set(validation.errors.map((error) => `${error.row}-${error.col}`));
  return cells.map((cell) => ({
    ...cell,
    error: errorKeys.has(`${cell.row}-${cell.col}`),
  }));
}
