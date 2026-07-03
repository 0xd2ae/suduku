import type { Difficulty } from "../game/types";
import { useGameStore } from "../store/gameStore";
import { useStatsStore } from "../store/statsStore";

const difficulties: Array<{ value: Difficulty; label: string }> = [
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困难" },
  { value: "expert", label: "专家" },
];

export function HomePage() {
  const startNewGame = useGameStore((state) => state.startNewGame);
  const continueGame = useGameStore((state) => state.continueGame);
  const puzzleId = useGameStore((state) => state.puzzleId);
  const completed = useGameStore((state) => state.completed);
  const stats = useStatsStore();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
            Sudoku
          </p>
          <h1 className="text-4xl font-bold">数独</h1>
        </header>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">开始游戏</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">选择难度或继续当前进度</p>
              </div>
              <button
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white active:scale-95 disabled:opacity-40 dark:bg-white dark:text-slate-900"
                disabled={completed}
                onClick={continueGame}
              >
                继续
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.value}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-left transition active:scale-95 hover:border-teal-500 dark:border-slate-800 dark:bg-slate-950"
                  onClick={() => startNewGame(difficulty.value)}
                >
                  <span className="block text-base font-semibold">{difficulty.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{difficulty.value}</span>
                </button>
              ))}
            </div>
            <button
              className="mt-4 w-full rounded-md bg-teal-600 px-4 py-3 text-sm font-semibold text-white active:scale-95"
              onClick={() => startNewGame("medium", { daily: true })}
            >
              每日挑战
            </button>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">统计</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="当前题目" value={puzzleId} />
              <Stat label="已开始" value={stats.gamesStarted} />
              <Stat label="已完成" value={stats.gamesCompleted} />
              <Stat label="连续完成" value={stats.currentStreak} />
              <Stat label="总错误" value={stats.totalMistakes} />
              <Stat label="提示次数" value={stats.totalHintsUsed} />
            </dl>
          </section>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-950">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 truncate font-semibold">{value}</dd>
    </div>
  );
}

