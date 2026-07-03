import { useState } from "react";
import { getCandidates } from "../../game/candidates";
import { cellIndex } from "../../game/cellUtils";
import { useGameStore } from "../../store/gameStore";

export function DeveloperPanel() {
  const [showSolution, setShowSolution] = useState(false);
  const puzzleId = useGameStore((state) => state.puzzleId);
  const difficulty = useGameStore((state) => state.difficulty);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const mistakes = useGameStore((state) => state.mistakes);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const selectedCell = useGameStore((state) => state.selectedCell);
  const cells = useGameStore((state) => state.cells);
  const fillSolutionDebug = useGameStore((state) => state.fillSolutionDebug);
  const clearUserInputsDebug = useGameStore((state) => state.clearUserInputsDebug);
  const makeMistakeDebug = useGameStore((state) => state.makeMistakeDebug);
  const triggerCompletionCheckDebug = useGameStore((state) => state.triggerCompletionCheckDebug);
  const selected = selectedCell ? cells[cellIndex(selectedCell.row, selectedCell.col)] : null;
  const candidates = selectedCell ? getCandidates(cells, selectedCell.row, selectedCell.col) : [];

  if (!import.meta.env.DEV) return null;

  return (
    <section className="rounded-lg border border-dashed border-fuchsia-300 bg-fuchsia-50 p-3 text-xs text-slate-900 dark:border-fuchsia-800 dark:bg-fuchsia-950/30 dark:text-slate-100">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-bold">Dev Panel</h2>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showSolution} onChange={(event) => setShowSolution(event.target.checked)} />
          Solution
        </label>
      </div>
      <dl className="grid grid-cols-2 gap-1">
        <dt>puzzleId</dt>
        <dd className="truncate font-semibold">{puzzleId}</dd>
        <dt>difficulty</dt>
        <dd className="font-semibold">{difficulty}</dd>
        <dt>elapsedSeconds</dt>
        <dd className="font-semibold">{elapsedSeconds}</dd>
        <dt>mistakes</dt>
        <dd className="font-semibold">{mistakes}</dd>
        <dt>hintsUsed</dt>
        <dd className="font-semibold">{hintsUsed}</dd>
        <dt>candidates</dt>
        <dd className="font-semibold">{candidates.join(",") || "-"}</dd>
        <dt>notes</dt>
        <dd className="font-semibold">{selected ? [...selected.notes].join(",") || "-" : "-"}</dd>
      </dl>
      {showSolution && (
        <div className="mt-2 grid grid-cols-9 gap-px font-mono">
          {cells.map((cell) => (
            <span key={`${cell.row}-${cell.col}`} className="bg-white p-1 text-center dark:bg-slate-900">
              {cell.solution}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="control-button" onClick={fillSolutionDebug}>
          填满答案
        </button>
        <button className="control-button" onClick={clearUserInputsDebug}>
          清空输入
        </button>
        <button className="control-button" onClick={makeMistakeDebug}>
          制造错误
        </button>
        <button className="control-button" onClick={triggerCompletionCheckDebug}>
          完成检测
        </button>
      </div>
    </section>
  );
}
