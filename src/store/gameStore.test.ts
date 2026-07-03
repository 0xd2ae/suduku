import { beforeEach, describe, expect, it } from "vitest";
import { parsePuzzle } from "../game/puzzleParser";
import { cellIndex } from "../game/cellUtils";
import { GAME_STATE_KEY, SAVE_VERSION } from "../game/constants";
import { getFirstPuzzle } from "../data/puzzles";
import { loadGame, saveGame, useGameStore } from "./gameStore";
import { useSettingsStore } from "./settingsStore";
import type { Cell, Puzzle } from "../game/types";

const testPuzzle: Puzzle = {
  id: "store-test",
  difficulty: "easy",
  puzzle: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
  solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  givens: 30,
  seed: "store-test",
  generatedAt: "2026-07-03T00:00:00.000Z",
  rating: { score: 10, strategies: ["naked-single"] },
};

function resetStore() {
  localStorage.clear();
  useSettingsStore.setState({
    autoCheck: true,
    autoRemoveNotes: true,
    checkMode: "solution-check",
    inputOrder: "cell-first",
  });
  useGameStore.setState({
    puzzleId: testPuzzle.id,
    difficulty: testPuzzle.difficulty,
    cells: parsePuzzle(testPuzzle),
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
    daily: false,
  });
}

describe("gameStore input and history", () => {
  beforeEach(resetStore);

  it("cannot edit given cells and invalid moves do not push history", () => {
    useGameStore.getState().inputDigit(4);
    expect(useGameStore.getState().history).toHaveLength(0);

    useGameStore.getState().selectCell(0, 0);
    useGameStore.getState().inputDigit(9);
    const state = useGameStore.getState();
    expect(state.cells[cellIndex(0, 0)].value).toBe(5);
    expect(state.history).toHaveLength(0);
  });

  it("cannot input while paused or completed", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.setState({ paused: true });
    useGameStore.getState().inputDigit(4);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBeNull();

    useGameStore.setState({ paused: false, completed: true });
    useGameStore.getState().inputDigit(4);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBeNull();
  });

  it("normal input clears notes and delete clears only user values", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.setState({ inputMode: "notes" });
    useGameStore.getState().inputDigit(1);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].notes.has(1)).toBe(true);

    useGameStore.setState({ inputMode: "normal" });
    useGameStore.getState().inputDigit(4);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBe(4);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].notes.size).toBe(0);

    useGameStore.getState().erase();
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBeNull();

    useGameStore.getState().selectCell(0, 0);
    useGameStore.getState().erase();
    expect(useGameStore.getState().cells[cellIndex(0, 0)].value).toBe(5);
  });

  it("cell-first keyboard input and number pad input produce the same state", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().inputDigit(4);
    const keyboardValue = useGameStore.getState().cells[cellIndex(0, 2)].value;

    resetStore();
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().inputDigit(4);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBe(keyboardValue);
  });

  it("number-first mode applies the selected digit when an editable cell is selected", () => {
    useSettingsStore.setState({ inputOrder: "number-first" });
    useGameStore.getState().setSelectedDigit(4);
    useGameStore.getState().selectCell(0, 2);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBe(4);
  });

  it("toggle note adds and removes notes", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.setState({ inputMode: "notes" });
    useGameStore.getState().inputDigit(1);
    useGameStore.getState().inputDigit(1);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].notes.has(1)).toBe(false);
  });

  it("auto notes affects empty cells and undo/redo restores notes", () => {
    useGameStore.getState().autoNotes();
    expect(useGameStore.getState().cells[cellIndex(0, 2)].notes.size).toBeGreaterThan(0);
    expect(useGameStore.getState().cells[cellIndex(0, 0)].notes.size).toBe(0);

    useGameStore.getState().undo();
    expect(useGameStore.getState().cells[cellIndex(0, 2)].notes.size).toBe(0);
    useGameStore.getState().redo();
    expect(useGameStore.getState().cells[cellIndex(0, 2)].notes.size).toBeGreaterThan(0);
  });

  it("auto remove notes removes peer candidates", () => {
    const cells = parsePuzzle(testPuzzle);
    cells[cellIndex(0, 2)] = { ...cells[cellIndex(0, 2)], notes: new Set([4]) };
    cells[cellIndex(1, 2)] = { ...cells[cellIndex(1, 2)], notes: new Set([4]) };
    useGameStore.setState({ cells, selectedCell: { row: 0, col: 2 } });
    useGameStore.getState().inputDigit(4);
    expect(useGameStore.getState().cells[cellIndex(1, 2)].notes.has(4)).toBe(false);
  });

  it("auto remove notes follows the placed value instead of the hidden solution", () => {
    const cells = parsePuzzle(testPuzzle);
    cells[cellIndex(1, 2)] = { ...cells[cellIndex(1, 2)], notes: new Set([1]) };
    useGameStore.setState({ cells, selectedCell: { row: 0, col: 2 } });
    useGameStore.getState().inputDigit(1);
    expect(useGameStore.getState().cells[cellIndex(1, 2)].notes.has(1)).toBe(false);
  });

  it("same wrong value does not repeatedly increase mistakes", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().inputDigit(1);
    useGameStore.getState().inputDigit(1);
    expect(useGameStore.getState().mistakes).toBe(1);
  });

  it("hint move increments once and is undoable", () => {
    useGameStore.getState().hint();
    useGameStore.getState().fillHint();
    const afterHint = useGameStore.getState();
    expect(afterHint.hintsUsed).toBe(1);
    expect(afterHint.history.at(-1)?.action).toBe("hint");

    useGameStore.getState().undo();
    expect(useGameStore.getState().hintsUsed).toBe(0);
  });

  it("valid moves push history, undo restores board, and a new move clears redo", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().inputDigit(4);
    expect(useGameStore.getState().history).toHaveLength(1);

    useGameStore.getState().undo();
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBeNull();
    expect(useGameStore.getState().future).toHaveLength(1);

    useGameStore.getState().inputDigit(2);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBe(2);
    expect(useGameStore.getState().future).toHaveLength(0);
  });

  it("restart restores the initial puzzle state and clears completion/history", () => {
    const puzzle = getFirstPuzzle("easy");
    const empty = puzzle.puzzle.indexOf("0");
    const row = Math.floor(empty / 9);
    const col = empty % 9;
    useGameStore.setState({
      puzzleId: puzzle.id,
      difficulty: puzzle.difficulty,
      cells: parsePuzzle(puzzle),
      selectedCell: { row, col },
      completed: true,
      paused: true,
      history: [{ ...useGameStore.getState().history[0], before: [], after: [], action: "set-value", timestamp: 1 }],
      future: [{ ...useGameStore.getState().future[0], before: [], after: [], action: "set-value", timestamp: 2 }],
    });

    useGameStore.getState().resetCurrentGame();
    const state = useGameStore.getState();
    expect(state.cells.map((cell) => cell.value ?? 0).join("")).toBe(puzzle.puzzle);
    expect(state.completed).toBe(false);
    expect(state.paused).toBe(false);
    expect(state.history).toHaveLength(0);
    expect(state.future).toHaveLength(0);
  });

  it("solved board completes once, stops editing, and can be undone consistently", () => {
    const cells: Cell[] = parsePuzzle(testPuzzle).map((cell) => ({
      ...cell,
      value: cell.solution,
      notes: new Set<number>(),
      error: false,
    }));
    cells[cellIndex(0, 2)] = { ...cells[cellIndex(0, 2)], value: null, given: false };
    useGameStore.setState({ cells, selectedCell: { row: 0, col: 2 }, completed: false, paused: false });

    useGameStore.getState().inputDigit(4);
    expect(useGameStore.getState().completed).toBe(true);
    expect(useGameStore.getState().paused).toBe(false);

    useGameStore.getState().inputDigit(1);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBe(4);

    useGameStore.getState().undo();
    expect(useGameStore.getState().completed).toBe(false);
    expect(useGameStore.getState().cells[cellIndex(0, 2)].value).toBeNull();
  });

  it("new game clears board history and stale state", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().inputDigit(4);
    useGameStore.setState({ future: useGameStore.getState().history, completed: true, activeHint: { cell: { row: 0, col: 2 }, value: 4, strategy: "naked-single", explanation: "", relatedCells: [] } });

    useGameStore.getState().startNewGame("hard");
    const state = useGameStore.getState();
    expect(state.difficulty).toBe("hard");
    expect(state.completed).toBe(false);
    expect(state.history).toHaveLength(0);
    expect(state.future).toHaveLength(0);
    expect(state.activeHint).toBeNull();
    expect(state.cells).toHaveLength(81);
  });

  it("timer ticks only while an active game is running and resets for new games", () => {
    useGameStore.setState({ elapsedSeconds: 10, paused: false, completed: false, screen: "game" });
    useGameStore.getState().tick();
    expect(useGameStore.getState().elapsedSeconds).toBe(11);

    useGameStore.setState({ paused: true });
    useGameStore.getState().tick();
    expect(useGameStore.getState().elapsedSeconds).toBe(11);

    useGameStore.setState({ paused: false, completed: true });
    useGameStore.getState().tick();
    expect(useGameStore.getState().elapsedSeconds).toBe(11);

    useGameStore.getState().startNewGame("easy");
    expect(useGameStore.getState().elapsedSeconds).toBe(0);
  });

  it("saves and loads game state with notes serialized as Sets", () => {
    const puzzle = getFirstPuzzle("easy");
    const cells = parsePuzzle(puzzle);
    cells[cellIndex(0, 2)] = { ...cells[cellIndex(0, 2)], notes: new Set([1, 2, 3]) };
    useGameStore.setState({ puzzleId: puzzle.id, difficulty: puzzle.difficulty, cells });

    saveGame(useGameStore.getState());
    const raw = localStorage.getItem(GAME_STATE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? "{}").state.cells[cellIndex(0, 2)].notes).toEqual([1, 2, 3]);

    const loaded = loadGame();
    expect(loaded?.cells[cellIndex(0, 2)].notes).toBeInstanceOf(Set);
    expect([...(loaded?.cells[cellIndex(0, 2)].notes ?? [])]).toEqual([1, 2, 3]);
  });

  it("discards invalid, mismatched, or missing-puzzle saves", () => {
    localStorage.setItem(GAME_STATE_KEY, "{bad json");
    expect(loadGame()).toBeNull();

    localStorage.setItem(GAME_STATE_KEY, JSON.stringify({ version: SAVE_VERSION - 1, state: {} }));
    expect(loadGame()).toBeNull();

    const puzzle = getFirstPuzzle("easy");
    useGameStore.setState({ puzzleId: puzzle.id, difficulty: puzzle.difficulty, cells: parsePuzzle(puzzle) });
    saveGame(useGameStore.getState());
    const saved = JSON.parse(localStorage.getItem(GAME_STATE_KEY) ?? "{}");
    saved.state.puzzleId = "missing-puzzle";
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(saved));
    expect(loadGame()).toBeNull();
  });
});
