import { useEffect } from "react";
import { useGameStore } from "../../store/gameStore";

export function PauseModal() {
  const paused = useGameStore((state) => state.paused);
  const completed = useGameStore((state) => state.completed);
  const screen = useGameStore((state) => state.screen);
  const resume = useGameStore((state) => state.resume);

  useEffect(() => {
    if (!paused || completed || screen !== "game") return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") resume();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [completed, paused, resume, screen]);

  if (!paused || completed || screen !== "game") return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <div className="modal-panel">
        <h2 id="pause-title" className="text-xl font-bold">已暂停</h2>
        <button className="mt-4 w-full rounded-md bg-teal-600 px-4 py-3 font-semibold text-white" onClick={resume}>
          继续
        </button>
      </div>
    </div>
  );
}
