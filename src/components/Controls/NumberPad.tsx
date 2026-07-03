import { useGameStore } from "../../store/gameStore";
import { useSettingsStore } from "../../store/settingsStore";

export function NumberPad() {
  const inputDigit = useGameStore((state) => state.inputDigit);
  const setSelectedDigit = useGameStore((state) => state.setSelectedDigit);
  const selectedDigit = useGameStore((state) => state.selectedDigit);
  const cells = useGameStore((state) => state.cells);
  const paused = useGameStore((state) => state.paused);
  const completed = useGameStore((state) => state.completed);
  const inputOrder = useSettingsStore((state) => state.inputOrder);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-3">
      <div className="grid grid-cols-9 gap-1 lg:grid-cols-3 lg:gap-2">
        {Array.from({ length: 9 }, (_, index) => {
          const digit = index + 1;
          const placed = cells.filter((cell) => cell.value === digit).length;
          const remaining = Math.max(0, 9 - placed);
          const filled = remaining === 0;
          return (
            <button
              key={digit}
              className={`relative min-h-11 rounded-md bg-teal-600 text-lg font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 lg:aspect-square lg:text-2xl ${
                filled ? "opacity-35" : ""
              } ${selectedDigit === digit && inputOrder === "number-first" ? "ring-2 ring-teal-950 dark:ring-white" : ""}`}
              disabled={paused || completed}
              aria-label={`Number ${digit}, ${remaining} remaining`}
              aria-pressed={selectedDigit === digit && inputOrder === "number-first"}
              onClick={() => {
                if (inputOrder === "number-first") setSelectedDigit(digit);
                else inputDigit(digit);
              }}
            >
              <span>{digit}</span>
              <span className="absolute bottom-1 right-1 text-[10px] font-semibold opacity-80">{remaining}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
