import { create } from "zustand";
import { SAVE_VERSION, STATS_KEY } from "../game/constants";
import type { Difficulty, Stats } from "../game/types";

const emptyTimeRecord: Record<Difficulty, number | null> = {
  easy: null,
  medium: null,
  hard: null,
  expert: null,
};

const defaults: Stats = {
  gamesStarted: 0,
  gamesCompleted: 0,
  bestTimeByDifficulty: { ...emptyTimeRecord },
  averageTimeByDifficulty: { ...emptyTimeRecord },
  currentStreak: 0,
  bestStreak: 0,
  totalMistakes: 0,
  totalHintsUsed: 0,
};

type StatsState = Stats & {
  recordStart: () => void;
  recordCompletion: (difficulty: Difficulty, elapsedSeconds: number, mistakes: number, hintsUsed: number) => void;
};

function loadStats(): Stats {
  const raw = localStorage.getItem(STATS_KEY);
  if (!raw) return defaults;
  try {
    const data = JSON.parse(raw) as { version?: number; state?: Partial<Stats> };
    if (data.version !== SAVE_VERSION || !data.state) return defaults;
    return { ...defaults, ...data.state } as Stats;
  } catch {
    return defaults;
  }
}

function saveStats(stats: Stats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify({ version: SAVE_VERSION, state: stats }));
}

export const useStatsStore = create<StatsState>((set, get) => ({
  ...loadStats(),
  recordStart: () => {
    const next = { ...get(), gamesStarted: get().gamesStarted + 1 };
    saveStats(next);
    set({ gamesStarted: next.gamesStarted });
  },
  recordCompletion: (difficulty, elapsedSeconds, mistakes, hintsUsed) => {
    const current = get();
    const completed = current.gamesCompleted + 1;
    const previousAverage = current.averageTimeByDifficulty[difficulty];
    const average =
      previousAverage === null
        ? elapsedSeconds
        : Math.round((previousAverage * current.gamesCompleted + elapsedSeconds) / completed);
    const best = current.bestTimeByDifficulty[difficulty];
    const currentStreak = current.currentStreak + 1;
    const next: Stats = {
      gamesStarted: current.gamesStarted,
      gamesCompleted: completed,
      bestTimeByDifficulty: {
        ...current.bestTimeByDifficulty,
        [difficulty]: best === null ? elapsedSeconds : Math.min(best, elapsedSeconds),
      },
      averageTimeByDifficulty: {
        ...current.averageTimeByDifficulty,
        [difficulty]: average,
      },
      currentStreak,
      bestStreak: Math.max(current.bestStreak, currentStreak),
      totalMistakes: current.totalMistakes + mistakes,
      totalHintsUsed: current.totalHintsUsed + hintsUsed,
    };
    saveStats(next);
    set(next);
  },
}));
