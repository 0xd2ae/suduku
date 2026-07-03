export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type InputMode = "normal" | "notes";
export type InputOrder = "cell-first" | "number-first";
export type CheckMode = "conflict-only" | "solution-check";

export type Cell = {
  row: number;
  col: number;
  box: number;
  value: number | null;
  solution: number;
  given: boolean;
  notes: Set<number>;
  error: boolean;
};

export type Puzzle = {
  id: string;
  difficulty: Difficulty;
  puzzle: string;
  solution: string;
  givens: number;
  seed: string;
  generatedAt: string;
  rating: {
    score: number;
    strategies: string[];
  };
};

export type CellPosition = {
  row: number;
  col: number;
};

export type HintStrategy =
  | "naked-single"
  | "hidden-single-row"
  | "hidden-single-column"
  | "hidden-single-box";

export type Hint = {
  cell: CellPosition;
  value: number;
  strategy: HintStrategy;
  explanation: string;
  relatedCells: CellPosition[];
};

export type ValidationResult = {
  solved: boolean;
  errors: Array<{ row: number; col: number; reason: string }>;
};

export type MoveAction =
  | "set-value"
  | "clear-value"
  | "toggle-note"
  | "auto-notes"
  | "hint";

export type Move = {
  before: Cell[];
  after: Cell[];
  action: MoveAction;
  timestamp: number;
};

export type DailyRecord = {
  date: string;
  puzzleId: string;
  completed: boolean;
  elapsedSeconds: number;
  mistakes: number;
  hintsUsed: number;
};

export type Stats = {
  gamesStarted: number;
  gamesCompleted: number;
  bestTimeByDifficulty: Record<Difficulty, number | null>;
  averageTimeByDifficulty: Record<Difficulty, number | null>;
  currentStreak: number;
  bestStreak: number;
  totalMistakes: number;
  totalHintsUsed: number;
};
