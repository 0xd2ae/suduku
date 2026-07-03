import { useGameStore } from "../../store/gameStore";
import { useSettingsStore } from "../../store/settingsStore";

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
}

export function Header() {
  const difficulty = useGameStore((state) => state.difficulty);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const paused = useGameStore((state) => state.paused);
  const completed = useGameStore((state) => state.completed);
  const goHome = useGameStore((state) => state.goHome);
  const pause = useGameStore((state) => state.pause);
  const resume = useGameStore((state) => state.resume);
  const daily = useGameStore((state) => state.daily);
  const timerVisible = useSettingsStore((state) => state.timerVisible);
  const toggleDarkMode = useSettingsStore((state) => state.toggle);

  return (
    <header className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-3">
      <button className="control-button w-10" onClick={goHome} title="Back" aria-label="Back">
        ‹
      </button>
      <div className="min-w-0 flex-1 text-center">
        <div className="truncate text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">
          {daily ? "Daily" : difficulty}
        </div>
        {timerVisible && <div className="text-lg font-bold tabular-nums">{formatTime(elapsedSeconds)}</div>}
      </div>
      <button className="control-button w-10" onClick={() => toggleDarkMode("darkMode")} title="Theme" aria-label="Theme">
        ◐
      </button>
      <button
        className="control-button w-10"
        disabled={completed}
        onClick={paused ? resume : pause}
        title={paused ? "Resume" : "Pause"}
        aria-label={paused ? "Resume" : "Pause"}
      >
        {paused ? "▶" : "Ⅱ"}
      </button>
    </header>
  );
}
