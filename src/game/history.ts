import { cloneCells } from "./cellUtils";
import type { Cell, Move, MoveAction, MoveMeta } from "./types";

export function createMove(
  before: Cell[],
  after: Cell[],
  action: MoveAction,
  beforeMeta?: MoveMeta,
  afterMeta?: MoveMeta,
): Move {
  return {
    before: cloneCells(before),
    after: cloneCells(after),
    action,
    timestamp: Date.now(),
    beforeMeta,
    afterMeta,
  };
}

export function canUndo(history: Move[]): boolean {
  return history.length > 0;
}

export function canRedo(future: Move[]): boolean {
  return future.length > 0;
}
