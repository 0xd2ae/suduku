import { SudokuCell } from "./SudokuCell";
import { useGameStore } from "../../store/gameStore";
import { useSettingsStore } from "../../store/settingsStore";

export function SudokuBoard() {
  const cells = useGameStore((state) => state.cells);
  const selectedCell = useGameStore((state) => state.selectedCell);
  const activeHint = useGameStore((state) => state.activeHint);
  const selectedDigit = useGameStore((state) => state.selectedDigit);
  const paused = useGameStore((state) => state.paused);
  const completed = useGameStore((state) => state.completed);
  const selectCell = useGameStore((state) => state.selectCell);
  const highlightPeers = useSettingsStore((state) => state.highlightPeers);
  const highlightSameNumbers = useSettingsStore((state) => state.highlightSameNumbers);
  const selected = selectedCell
    ? cells.find((cell) => cell.row === selectedCell.row && cell.col === selectedCell.col)
    : null;

  const highlightedValue = selected?.value ?? selectedDigit;

  return (
    <section className="flex justify-center">
      <div
        className={`grid aspect-square w-[min(92vw,calc(100dvh-400px),560px)] touch-manipulation grid-cols-9 overflow-hidden rounded-md border-2 border-slate-900 bg-slate-900 shadow-sm transition dark:border-slate-500 lg:w-[min(92vw,560px)] ${
          paused ? "pointer-events-none blur-sm" : ""
        }`}
        role="grid"
        aria-label="Sudoku board"
      >
        {cells.map((cell) => {
          const isSelected = selectedCell?.row === cell.row && selectedCell.col === cell.col;
          const isPeer =
            Boolean(selected) &&
            !paused &&
            !completed &&
            !isSelected &&
            (cell.row === selected?.row || cell.col === selected?.col || cell.box === selected?.box);
          const isSameNumber =
            !paused && !completed && Boolean(highlightedValue) && cell.value === highlightedValue && cell.value !== null;
          const isHinted = activeHint?.cell.row === cell.row && activeHint.cell.col === cell.col;
          return (
            <SudokuCell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              selected={isSelected}
              peer={highlightPeers && isPeer}
              sameNumber={highlightSameNumbers && isSameNumber}
              hinted={isHinted}
              onSelect={() => selectCell(cell.row, cell.col)}
            />
          );
        })}
      </div>
    </section>
  );
}
