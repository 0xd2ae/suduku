import { useGameStore } from "../../store/gameStore";

export function HintModal() {
  const activeHint = useGameStore((state) => state.activeHint);
  const fillHint = useGameStore((state) => state.fillHint);
  const selectCell = useGameStore((state) => state.selectCell);

  if (!activeHint) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-3">
      <div className="pointer-events-auto w-full max-w-xl rounded-lg border border-sky-200 bg-white p-3 shadow-lg dark:border-sky-900 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
              R{activeHint.cell.row + 1}C{activeHint.cell.col + 1} = {activeHint.value}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activeHint.explanation}</p>
          </div>
          <button
            className="min-h-11 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
            onClick={() => {
              selectCell(activeHint.cell.row, activeHint.cell.col);
              fillHint();
            }}
          >
            填入
          </button>
        </div>
      </div>
    </div>
  );
}
