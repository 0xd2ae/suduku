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

type CellVisualState = "error" | "selected" | "hinted" | "sameNumber" | "peer" | "default";

// Priority (highest first): error/conflict > selected > hinted > same-number > row/col/box peer > default.
// Resolved to a single state up front so exactly one background style ever applies -
// stacking independent bg-* utility classes would leave the winner up to Tailwind's
// generated stylesheet order rather than this priority.
type CellVisualFlags = { error: boolean; selected: boolean; hinted: boolean; sameNumber: boolean; peer: boolean };

function resolveVisualState({ error, selected, hinted, sameNumber, peer }: CellVisualFlags): CellVisualState {
  if (error) return "error";
  if (selected) return "selected";
  if (hinted) return "hinted";
  if (sameNumber) return "sameNumber";
  if (peer) return "peer";
  return "default";
}

const STATE_STYLES: Record<CellVisualState, string> = {
  error: "animate-shake bg-rose-100 dark:bg-rose-950",
  selected: "bg-teal-200 ring-2 ring-inset ring-teal-600 dark:bg-teal-800",
  hinted: "bg-sky-200 ring-2 ring-inset ring-sky-600 dark:bg-sky-800",
  sameNumber: "bg-amber-100 dark:bg-amber-900/45",
  peer: "bg-teal-50 dark:bg-teal-950/50",
  default: "bg-white dark:bg-slate-900",
};

export function SudokuCell({ cell, selected, peer, sameNumber, hinted, onSelect }: SudokuCellProps) {
  const thickLeft = cell.col % 3 === 0;
  const thickTop = cell.row % 3 === 0;
  const thickRight = cell.col === 8;
  const thickBottom = cell.row === 8;

  const visualState = resolveVisualState({ error: cell.error, selected, hinted, sameNumber, peer });

  const notesLabel = cell.notes.size > 0 ? `, notes ${[...cell.notes].join(" ")}` : "";
  const valueLabel = cell.value === null ? "empty" : `value ${cell.value}`;
  const sourceLabel = cell.given ? "given" : "editable";
  const conflictLabel = cell.error ? ", conflict" : "";

  return (
    <button
      className={clsx(
        "relative flex aspect-square min-h-0 items-center justify-center text-center transition focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-600 active:scale-[0.98]",
        thickLeft
          ? "border-l-2 border-l-slate-500 dark:border-l-slate-400"
          : "border-l border-l-slate-300 dark:border-l-slate-600",
        thickTop
          ? "border-t-2 border-t-slate-500 dark:border-t-slate-400"
          : "border-t border-t-slate-300 dark:border-t-slate-600",
        thickRight
          ? "border-r-2 border-r-slate-500 dark:border-r-slate-400"
          : "border-r border-r-slate-300 dark:border-r-slate-600",
        thickBottom
          ? "border-b-2 border-b-slate-500 dark:border-b-slate-400"
          : "border-b border-b-slate-300 dark:border-b-slate-600",
        STATE_STYLES[visualState],
      )}
      onClick={onSelect}
      role="gridcell"
      aria-label={`Row ${cell.row + 1} Column ${cell.col + 1}, ${valueLabel}, ${sourceLabel}${notesLabel}${conflictLabel}`}
      aria-selected={selected}
      aria-current={selected ? "true" : undefined}
    >
      {cell.value === null ? (
        <NotesGrid notes={cell.notes} />
      ) : (
        <span
          className={clsx(
            "text-[clamp(1.25rem,7vw,2.25rem)] font-semibold leading-none",
            cell.error
              ? "text-rose-700 dark:text-rose-300"
              : cell.given
                ? "text-slate-950 dark:text-white"
                : "text-teal-700 dark:text-teal-300",
          )}
        >
          {cell.value}
        </span>
      )}
    </button>
  );
}
