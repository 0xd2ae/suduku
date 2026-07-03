import { ToggleButton } from "./ToggleButton";
import { useGameStore } from "../../store/gameStore";
import { useSettingsStore } from "../../store/settingsStore";

export function GameControls() {
  const inputMode = useGameStore((state) => state.inputMode);
  const history = useGameStore((state) => state.history);
  const future = useGameStore((state) => state.future);
  const mistakes = useGameStore((state) => state.mistakes);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-950">错误 {mistakes}</div>
        <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-950">提示 {hintsUsed}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button className="control-button" disabled={history.length === 0} onClick={undo} title="Undo">
          ↶
        </button>
        <button className="control-button" disabled={future.length === 0} onClick={redo} title="Redo">
          ↷
        </button>
        <button className="control-button" onClick={erase} title="Erase">
          ⌫
        </button>
        <ToggleButton pressed={inputMode === "notes"} onClick={toggleNotesMode}>
          Notes
        </ToggleButton>
        <button className="control-button" onClick={hint}>
          Hint
        </button>
        <button className="control-button" onClick={fillHint}>
          Fill
        </button>
        <button className="control-button" onClick={check}>
          Check
        </button>
        <button className="control-button" onClick={autoNotes}>
          Auto
        </button>
        <button className="control-button" onClick={resetCurrentGame}>
          Reset
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ToggleButton pressed={autoCheck} onClick={() => toggleSetting("autoCheck")}>
          Auto Check
        </ToggleButton>
        <ToggleButton pressed={autoRemoveNotes} onClick={() => toggleSetting("autoRemoveNotes")}>
          Clean Notes
        </ToggleButton>
      </div>
      <div className="mt-3 rounded-md bg-slate-100 p-2 dark:bg-slate-950">
        <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Settings</div>
        <div className="grid grid-cols-2 gap-2">
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
