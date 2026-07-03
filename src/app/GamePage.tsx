import { useEffect } from "react";
import { GameControls } from "../components/Controls/GameControls";
import { DeveloperPanel } from "../components/Debug/DeveloperPanel";
import { NumberPad } from "../components/Controls/NumberPad";
import { Header } from "../components/Layout/Header";
import { SudokuBoard } from "../components/Board/SudokuBoard";
import { useGameStore } from "../store/gameStore";

export function GamePage() {
  const inputDigit = useGameStore((state) => state.inputDigit);
  const erase = useGameStore((state) => state.erase);
  const toggleNotesMode = useGameStore((state) => state.toggleNotesMode);
  const hint = useGameStore((state) => state.hint);
  const check = useGameStore((state) => state.check);
  const undo = useGameStore((state) => state.undo);
  const redo = useGameStore((state) => state.redo);
  const moveSelection = useGameStore((state) => state.moveSelection);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (/^[1-9]$/.test(event.key)) inputDigit(Number(event.key));
      else if (event.key === "Backspace" || event.key === "Delete") erase();
      else if (event.key.toLowerCase() === "n") toggleNotesMode();
      else if (event.key.toLowerCase() === "h") hint();
      else if (event.key.toLowerCase() === "c") check();
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && event.shiftKey) redo();
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") undo();
      else if (event.key === "Z" && event.shiftKey) redo();
      else if (event.key.toLowerCase() === "z") undo();
      else if (event.key === "ArrowUp") moveSelection(-1, 0);
      else if (event.key === "ArrowDown") moveSelection(1, 0);
      else if (event.key === "ArrowLeft") moveSelection(0, -1);
      else if (event.key === "ArrowRight") moveSelection(0, 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [check, erase, hint, inputDigit, moveSelection, redo, toggleNotesMode, undo]);

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-3 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <Header />
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,620px)_320px] lg:justify-center">
          <SudokuBoard />
          <aside className="flex flex-col gap-3">
            <NumberPad />
            <GameControls />
            <DeveloperPanel />
          </aside>
        </div>
      </div>
    </main>
  );
}
