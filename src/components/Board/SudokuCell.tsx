import clsx from "clsx";
import { NotesGrid } from "./NotesGrid";
import type { Cell } from "../../game/types";

type SudokuCellProps = {
  cell: Cell;
  selected: boolean;
  peer: boolean;
  sameNumber: boolean;
  hinted: boolean;
  onSelect: () => void;
};

export function SudokuCell({ cell, selected, peer, sameNumber, hinted, onSelect }: SudokuCellProps) {
  const thickLeft = cell.col % 3 === 0;
  const thickTop = cell.row % 3 === 0;
  const thickRight = cell.col === 8;
  const thickBottom = cell.row === 8;

  const notesLabel = cell.notes.size > 0 ? `, notes ${[...cell.notes].join(" ")}` : "";
  const valueLabel = cell.value === null ? "empty" : `value ${cell.value}`;
  const sourceLabel = cell.given ? "given" : "editable";

  return (
    <button
      className={clsx(
        "relative flex aspect-square min-h-0 items-center justify-center border-slate-300 bg-white text-center transition focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-600 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900",
        thickLeft ? "border-l-2" : "border-l",
        thickTop ? "border-t-2" : "border-t",
        thickRight ? "border-r-2" : "border-r",
        thickBottom ? "border-b-2" : "border-b",
        peer && "bg-teal-50 dark:bg-teal-950/50",
        sameNumber && "bg-amber-100 dark:bg-amber-900/45",
        selected && "bg-teal-200 ring-2 ring-inset ring-teal-600 dark:bg-teal-800",
        hinted && "bg-sky-200 ring-2 ring-inset ring-sky-600 dark:bg-sky-800",
        cell.error && "animate-shake bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
      )}
      onClick={onSelect}
      role="gridcell"
      aria-label={`Row ${cell.row + 1} Column ${cell.col + 1}, ${valueLabel}, ${sourceLabel}${notesLabel}`}
      aria-selected={selected}
      aria-current={selected ? "true" : undefined}
    >
      {cell.value === null ? (
        <NotesGrid notes={cell.notes} />
      ) : (
        <span
          className={clsx(
            "text-[clamp(1.25rem,7vw,2.25rem)] font-semibold leading-none",
            cell.given ? "text-slate-950 dark:text-white" : "text-teal-700 dark:text-teal-300",
          )}
        >
          {cell.value}
        </span>
      )}
    </button>
  );
}
