import { useGameStore } from "../../store/gameStore";

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}分 ${rest}秒`;
}

export function CompleteModal() {
  const completed = useGameStore((state) => state.completed);
  const screen = useGameStore((state) => state.screen);
  const difficulty = useGameStore((state) => state.difficulty);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const mistakes = useGameStore((state) => state.mistakes);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const startNewGame = useGameStore((state) => state.startNewGame);
  const goHome = useGameStore((state) => state.goHome);

  if (!completed || screen !== "game") return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="complete-title">
      <div className="modal-panel">
        <h2 id="complete-title" className="text-xl font-bold">完成</h2>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Result label="难度" value={difficulty} />
          <Result label="用时" value={formatTime(elapsedSeconds)} />
          <Result label="错误" value={mistakes} />
          <Result label="提示" value={hintsUsed} />
        </dl>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="control-button" onClick={goHome}>
            首页
          </button>
          <button className="rounded-md bg-teal-600 px-4 py-3 font-semibold text-white" onClick={() => startNewGame(difficulty)}>
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-950">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
