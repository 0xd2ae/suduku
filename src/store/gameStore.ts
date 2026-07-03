import { create } from "zustand";
import { applyAutoNotes, removePeerNotes } from "../game/candidates";
import { cloneCells, deserializeCells, serializeCells, cellIndex } from "../game/cellUtils";
import { DAILY_RECORDS_KEY, GAME_STATE_KEY, SAVE_VERSION } from "../game/constants";
import { getDailyPuzzle, getDateKey } from "../game/daily";
import { createMove } from "../game/history";
import { getNextHint } from "../game/hints";
import { parsePuzzle } from "../game/puzzleParser";
import { markErrors, validateBoard } from "../game/validator";
import { getFirstPuzzle, getPuzzleById, getRandomPuzzle } from "../data/puzzles";
import { useSettingsStore } from "./settingsStore";
import { useStatsStore } from "./statsStore";
import type { Cell, CellPosition, Difficulty, Hint, InputMode, Move, MoveAction, Puzzle } from "../game/types";

export type GameState = {
  puzzleId: string;
  difficulty: Difficulty;
  cells: Cell[];
  selectedCell: CellPosition | null;
  selectedDigit: number | null;
  inputMode: InputMode;
  mistakes: number;
  hintsUsed: number;
  startedAt: number;
  elapsedSeconds: number;
  paused: boolean;
  completed: boolean;
  history: Move[];
  future: Move[];
  activeHint: Hint | null;
  screen: "home" | "game";
  daily: boolean;
  selectCell: (row: number, col: number) => void;
  setSelectedDigit: (digit: number | null) => void;
  moveSelection: (rowDelta: number, colDelta: number) => void;
  startNewGame: (difficulty: Difficulty, options?: { daily?: boolean }) => void;
  continueGame: () => void;
  resetCurrentGame: () => void;
  setInputMode: (mode: InputMode) => void;
  toggleNotesMode: () => void;
  inputDigit: (digit: number, action?: MoveAction) => void;
  erase: () => void;
  check: () => void;
  autoNotes: () => void;
  hint: () => void;
  fillHint: () => void;
  undo: () => void;
  redo: () => void;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  goHome: () => void;
  fillSolutionDebug: () => void;
  clearUserInputsDebug: () => void;
  makeMistakeDebug: () => void;
  triggerCompletionCheckDebug: () => void;
};

type SerializedCell = ReturnType<typeof serializeCells>[number];
type SerializedMove = Omit<Move, "before" | "after"> & {
  before: SerializedCell[];
  after: SerializedCell[];
};

type PersistedGameState = Omit<
  GameState,
  | "cells"
  | "history"
  | "future"
  | "selectCell"
  | "setSelectedDigit"
  | "moveSelection"
  | "startNewGame"
  | "continueGame"
  | "resetCurrentGame"
  | "setInputMode"
  | "toggleNotesMode"
  | "inputDigit"
  | "erase"
  | "check"
  | "autoNotes"
  | "hint"
  | "fillHint"
  | "undo"
  | "redo"
  | "pause"
  | "resume"
  | "tick"
  | "goHome"
  | "fillSolutionDebug"
  | "clearUserInputsDebug"
  | "makeMistakeDebug"
  | "triggerCompletionCheckDebug"
> & {
  cells: SerializedCell[];
  history: SerializedMove[];
  future: SerializedMove[];
};

function newGameState(puzzle: Puzzle, daily = false): Pick<
  GameState,
  | "puzzleId"
  | "difficulty"
  | "cells"
  | "selectedCell"
  | "selectedDigit"
  | "inputMode"
  | "mistakes"
  | "hintsUsed"
  | "startedAt"
  | "elapsedSeconds"
  | "paused"
  | "completed"
  | "history"
  | "future"
  | "activeHint"
  | "screen"
  | "daily"
> {
  return {
    puzzleId: puzzle.id,
    difficulty: puzzle.difficulty,
    cells: parsePuzzle(puzzle),
    selectedCell: null,
    selectedDigit: null,
    inputMode: "normal",
    mistakes: 0,
    hintsUsed: 0,
    startedAt: Date.now(),
    elapsedSeconds: 0,
    paused: false,
    completed: false,
    history: [],
    future: [],
    activeHint: null,
    screen: "game",
    daily,
  };
}

function serializeMove(move: Move): SerializedMove {
  return {
    ...move,
    before: serializeCells(move.before),
    after: serializeCells(move.after),
  };
}

function deserializeMove(move: SerializedMove): Move {
  return {
    ...move,
    before: deserializeCells(move.before),
    after: deserializeCells(move.after),
  };
}

function saveGame(state: GameState): void {
  const data: { version: number; state: PersistedGameState } = {
    version: SAVE_VERSION,
    state: {
      puzzleId: state.puzzleId,
      difficulty: state.difficulty,
      cells: serializeCells(state.cells),
      selectedCell: state.selectedCell,
      selectedDigit: state.selectedDigit,
      inputMode: state.inputMode,
      mistakes: state.mistakes,
      hintsUsed: state.hintsUsed,
      startedAt: state.startedAt,
      elapsedSeconds: state.elapsedSeconds,
      paused: state.paused,
      completed: state.completed,
      history: state.history.map(serializeMove),
      future: state.future.map(serializeMove),
      activeHint: state.activeHint,
      screen: state.screen,
      daily: state.daily,
    },
  };
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem(GAME_STATE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { version: number; state: PersistedGameState };
    if (data.version !== SAVE_VERSION || !getPuzzleById(data.state.puzzleId)) return null;
    return {
      ...data.state,
      cells: deserializeCells(data.state.cells),
      history: data.state.history.map(deserializeMove),
      future: data.state.future.map(deserializeMove),
    };
  } catch {
    return null;
  }
}

function currentCheckMode() {
  return useSettingsStore.getState().checkMode;
}

function withValidation(cells: Cell[], force = false): Cell[] {
  return force || useSettingsStore.getState().autoCheck
    ? markErrors(cells, currentCheckMode())
    : cells.map((cell) => ({ ...cell, error: false }));
}

function pushMove(state: GameState, before: Cell[], after: Cell[], action: MoveAction): Partial<GameState> {
  return {
    cells: after,
    history: [...state.history, createMove(before, after, action)],
    future: [],
    activeHint: null,
  };
}

function maybeComplete(next: GameState): Partial<GameState> {
  const validation = validateBoard(next.cells, "solution-check");
  if (!validation.solved || next.completed) return {};
  useStatsStore.getState().recordCompletion(next.difficulty, next.elapsedSeconds, next.mistakes, next.hintsUsed);
  if (next.daily) {
    const date = getDateKey();
    const record = {
      date,
      puzzleId: next.puzzleId,
      completed: true,
      elapsedSeconds: next.elapsedSeconds,
      mistakes: next.mistakes,
      hintsUsed: next.hintsUsed,
    };
    localStorage.setItem(DAILY_RECORDS_KEY, JSON.stringify({ version: SAVE_VERSION, records: [record] }));
  }
  return { completed: true, paused: true };
}

const restored = loadGame();
const initial = restored ?? { ...newGameState(getFirstPuzzle("easy")), screen: "home" as const };

export const useGameStore = create<GameState>((set, get) => ({
  ...initial,
  selectCell: (row, col) => {
    const selectedDigit = get().selectedDigit;
    set({ selectedCell: { row, col } });
    if (
      selectedDigit !== null &&
      useSettingsStore.getState().inputOrder === "number-first" &&
      !get().paused &&
      !get().completed
    ) {
      get().inputDigit(selectedDigit);
    }
  },
  setSelectedDigit: (digit) => set({ selectedDigit: digit }),
  moveSelection: (rowDelta, colDelta) => {
    const selected = get().selectedCell ?? { row: 0, col: 0 };
    set({
      selectedCell: {
        row: Math.max(0, Math.min(8, selected.row + rowDelta)),
        col: Math.max(0, Math.min(8, selected.col + colDelta)),
      },
    });
  },
  startNewGame: (difficulty, options) => {
    const puzzle = options?.daily ? getDailyPuzzle(getDateKey(), difficulty) : getRandomPuzzle(difficulty);
    const next = newGameState(puzzle, Boolean(options?.daily));
    useStatsStore.getState().recordStart();
    set(next);
    saveGame({ ...get(), ...next });
  },
  continueGame: () => set({ screen: "game", paused: false }),
  resetCurrentGame: () => {
    const puzzle = getPuzzleById(get().puzzleId) ?? getFirstPuzzle(get().difficulty);
    const next = newGameState(puzzle, get().daily);
    set(next);
    saveGame({ ...get(), ...next });
  },
  setInputMode: (mode) => set({ inputMode: mode }),
  toggleNotesMode: () => set({ inputMode: get().inputMode === "normal" ? "notes" : "normal" }),
  inputDigit: (digit, action = "set-value") => {
    const state = get();
    if (state.completed || state.paused || !state.selectedCell) return;
    const index = cellIndex(state.selectedCell.row, state.selectedCell.col);
    const target = state.cells[index];
    if (target.given) return;
    const before = cloneCells(state.cells);
    let after = cloneCells(state.cells);

    if (state.inputMode === "notes" && action !== "hint") {
      if (after[index].value !== null) return;
      const notes = new Set(after[index].notes);
      if (notes.has(digit)) notes.delete(digit);
      else notes.add(digit);
      after[index] = { ...after[index], notes };
      after = withValidation(after);
      const update = pushMove(state, before, after, "toggle-note");
      set(update);
      saveGame({ ...state, ...update } as GameState);
      return;
    }

    after[index] = { ...after[index], value: digit, notes: new Set<number>() };
    if (useSettingsStore.getState().autoRemoveNotes && digit === after[index].solution) {
      after = removePeerNotes(after, after[index].row, after[index].col, digit);
    }
    after = withValidation(after);
    const mistakeIncrement = currentCheckMode() === "solution-check" && digit !== target.solution ? 1 : 0;
    const update = pushMove({ ...state, mistakes: state.mistakes + mistakeIncrement }, before, after, action);
    const next = { ...state, ...update, mistakes: state.mistakes + mistakeIncrement } as GameState;
    const completion = maybeComplete(next);
    set({ ...update, mistakes: next.mistakes, ...completion });
    saveGame({ ...next, ...completion });
  },
  erase: () => {
    const state = get();
    if (state.completed || state.paused || !state.selectedCell) return;
    const index = cellIndex(state.selectedCell.row, state.selectedCell.col);
    if (state.cells[index].given) return;
    const before = cloneCells(state.cells);
    let after = cloneCells(state.cells);
    after[index] = { ...after[index], value: null, notes: new Set<number>(), error: false };
    after = withValidation(after);
    const update = pushMove(state, before, after, "clear-value");
    set(update);
    saveGame({ ...state, ...update } as GameState);
  },
  check: () => {
    const state = get();
    const cells = markErrors(state.cells, currentCheckMode());
    set({ cells });
    saveGame({ ...state, cells });
  },
  autoNotes: () => {
    const state = get();
    if (state.completed || state.paused) return;
    const before = cloneCells(state.cells);
    const after = withValidation(applyAutoNotes(state.cells));
    const update = pushMove(state, before, after, "auto-notes");
    set(update);
    saveGame({ ...state, ...update } as GameState);
  },
  hint: () => {
    if (get().completed || get().paused) return;
    const activeHint = getNextHint(get().cells);
    set({ activeHint, selectedCell: activeHint?.cell ?? get().selectedCell });
  },
  fillHint: () => {
    const state = get();
    if (state.completed || state.paused) return;
    const hint = state.activeHint ?? getNextHint(state.cells);
    if (!hint) return;
    set({ selectedCell: hint.cell, inputMode: "normal", hintsUsed: state.hintsUsed + 1, activeHint: hint });
    get().inputDigit(hint.value, "hint");
  },
  undo: () => {
    const state = get();
    if (state.paused) return;
    const move = state.history.at(-1);
    if (!move) return;
    const next = {
      cells: cloneCells(move.before),
      history: state.history.slice(0, -1),
      future: [...state.future, move],
      completed: false,
      paused: false,
    };
    set(next);
    saveGame({ ...state, ...next });
  },
  redo: () => {
    const state = get();
    if (state.paused) return;
    const move = state.future.at(-1);
    if (!move) return;
    const next = {
      cells: cloneCells(move.after),
      history: [...state.history, move],
      future: state.future.slice(0, -1),
    };
    set(next);
    saveGame({ ...state, ...next });
  },
  pause: () => {
    set({ paused: true });
    saveGame({ ...get(), paused: true });
  },
  resume: () => {
    set({ paused: false, screen: "game" });
    saveGame({ ...get(), paused: false, screen: "game" });
  },
  tick: () => {
    const state = get();
    if (state.paused || state.completed || state.screen !== "game") return;
    const elapsedSeconds = state.elapsedSeconds + 1;
    set({ elapsedSeconds });
    saveGame({ ...state, elapsedSeconds });
  },
  goHome: () => {
    set({ screen: "home" });
    saveGame({ ...get(), screen: "home" });
  },
  fillSolutionDebug: () => {
    const state = get();
    const before = cloneCells(state.cells);
    const cells = state.cells.map((cell) => ({
      ...cell,
      value: cell.solution,
      notes: new Set<number>(),
      error: false,
    }));
    const update = pushMove(state, before, cells, "hint");
    const next = { ...state, ...update } as GameState;
    const completion = maybeComplete(next);
    set({ ...update, ...completion });
    saveGame({ ...next, ...completion });
  },
  clearUserInputsDebug: () => {
    const state = get();
    const before = cloneCells(state.cells);
    const cells = state.cells.map((cell) =>
      cell.given ? cell : { ...cell, value: null, notes: new Set<number>(), error: false },
    );
    const update = pushMove(state, before, cells, "clear-value");
    set({ ...update, completed: false, paused: false });
    saveGame({ ...state, ...update, completed: false, paused: false } as GameState);
  },
  makeMistakeDebug: () => {
    const state = get();
    const target = state.cells.find((cell) => !cell.given);
    if (!target) return;
    const wrong = target.solution === 1 ? 2 : 1;
    set({
      selectedCell: { row: target.row, col: target.col },
      inputMode: "normal",
      paused: false,
      completed: false,
    });
    get().inputDigit(wrong);
  },
  triggerCompletionCheckDebug: () => {
    const state = get();
    const cells = markErrors(state.cells, currentCheckMode());
    const next = { ...state, cells };
    const completion = maybeComplete(next);
    set({ cells, ...completion });
    saveGame({ ...next, ...completion });
  },
}));
