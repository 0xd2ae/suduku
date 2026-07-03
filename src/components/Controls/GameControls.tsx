import { ToggleButton } from "./ToggleButton";
import { useGameStore } from "../../store/gameStore";
import { useSettingsStore } from "../../store/settingsStore";

export function GameControls() {
  const inputMode = useGameStore((state) => state.inputMode);
  const history = useGameStore((state) => state.history);
  const future = useGameStore((state) => state.future);
  const mistakes = useGameStore((state) => state.mistakes);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const paused = useGameStore((state) => state.paused);
  const completed = useGameStore((state) => state.completed);
  const undo = useGameStore((state) => state.undo);
  const redo = useGameStore((state) => state.redo);
  const erase = useGameStore((state) => state.erase);
  const toggleNotesMode = useGameStore((state) => state.toggleNotesMode);
  const hint = useGameStore((state) => state.hint);
  const fillHint = useGameStore((state) => state.fillHint);
  const check = useGameStore((state) => state.check);
  const autoNotes = useGameStore((state) => state.autoNotes);
  const resetCurrentGame = useGameStore((state) => state.resetCurrentGame);
  const autoCheck = useSettingsStore((state) => state.autoCheck);
  const autoRemoveNotes = useSettingsStore((state) => state.autoRemoveNotes);
  const inputOrder = useSettingsStore((state) => state.inputOrder);
  const checkMode = useSettingsStore((state) => state.checkMode);
  const toggleSetting = useSettingsStore((state) => state.toggle);
  const setInputOrder = useSettingsStore((state) => state.setInputOrder);
  const setCheckMode = useSettingsStore((state) => state.setCheckMode);
  const disabled = paused || completed;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-3">
      <div className="mb-2 grid grid-cols-2 gap-1 text-xs lg:mb-3 lg:gap-2 lg:text-sm">
        <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-950 lg:p-2">错误 {mistakes}</div>
        <div className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-950 lg:p-2">提示 {hintsUsed}</div>
      </div>
      <div className="grid grid-cols-5 gap-1 lg:grid-cols-3 lg:gap-2">
        <button
          className="control-button min-h-9 px-1 py-1 text-xs lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm"
          disabled={paused || history.length === 0}
          onClick={undo}
          title="Undo"
          aria-label="Undo"
        >
          ↶
        </button>
        <button
          className="control-button min-h-9 px-1 py-1 text-xs lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm"
          disabled={paused || future.length === 0}
          onClick={redo}
          title="Redo"
          aria-label="Redo"
        >
          ↷
        </button>
        <button
          className="control-button min-h-9 px-1 py-1 text-xs lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm"
          disabled={disabled}
          onClick={erase}
          title="Erase"
          aria-label="Erase"
        >
          ⌫
        </button>
        <ToggleButton pressed={inputMode === "notes"} disabled={disabled} onClick={toggleNotesMode}>
          Notes
        </ToggleButton>
        <button
          className="control-button min-h-9 px-1 py-1 text-xs lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm"
          disabled={disabled}
          onClick={hint}
        >
          Hint
        </button>
        <button
          className="control-button min-h-9 px-1 py-1 text-xs lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm"
          disabled={disabled}
          onClick={fillHint}
        >
          Fill
        </button>
        <button
          className="control-button min-h-9 px-1 py-1 text-xs lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm"
          disabled={disabled}
          onClick={check}
        >
          Check
        </button>
        <button
          className="control-button min-h-9 px-1 py-1 text-xs lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm"
          disabled={disabled}
          onClick={autoNotes}
        >
          Auto
        </button>
        <button
          className="control-button min-h-9 px-1 py-1 text-xs lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm"
          onClick={resetCurrentGame}
        >
          Reset
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 lg:mt-3 lg:gap-2">
        <ToggleButton pressed={autoCheck} onClick={() => toggleSetting("autoCheck")}>
          Auto Check
        </ToggleButton>
        <ToggleButton pressed={autoRemoveNotes} onClick={() => toggleSetting("autoRemoveNotes")}>
          Clean Notes
        </ToggleButton>
      </div>
      <div className="mt-2 lg:mt-3 lg:rounded-md lg:bg-slate-100 lg:p-2 lg:dark:bg-slate-950">
        <div className="mb-2 hidden text-xs font-semibold uppercase text-slate-500 lg:block">Settings</div>
        <div className="grid grid-cols-4 gap-1 lg:grid-cols-2 lg:gap-2">
          <ToggleButton pressed={inputOrder === "cell-first"} onClick={() => setInputOrder("cell-first")}>
            Cell First
          </ToggleButton>
          <ToggleButton pressed={inputOrder === "number-first"} onClick={() => setInputOrder("number-first")}>
            Number First
          </ToggleButton>
          <ToggleButton pressed={checkMode === "conflict-only"} onClick={() => setCheckMode("conflict-only")}>
            Conflicts
          </ToggleButton>
          <ToggleButton pressed={checkMode === "solution-check"} onClick={() => setCheckMode("solution-check")}>
            Solution
          </ToggleButton>
        </div>
      </div>
    </section>
  );
}
