# AGENT.md — React Sudoku Game

## 目标

使用 React + TypeScript 开发一个现代化数独游戏 Web App。整体体验参考：

* Good Sudoku：优雅 UI、智能提示、减少重复劳动、学习型体验
* Sudoku.com：经典 9x9 数独、难度选择、提示、自动检查、重复数字高亮、每日挑战
* 移动端数独 App：大按钮、单手操作、清晰的选中反馈、流畅动画

最终目标是做成一个可部署的 PWA 数独游戏，支持桌面端和移动端。

---

## 技术栈

* Runtime: Browser
* Framework: React
* Language: TypeScript
* Build: Vite
* Styling: Tailwind CSS
* State: Zustand
* Persistence: localStorage
* Testing: Vitest + React Testing Library
* Package Manager: pnpm
* Optional PWA: vite-plugin-pwa

---

## 核心功能

### 1. 数独棋盘

实现标准 9x9 数独棋盘。

每个格子需要支持以下状态：

```ts
type Cell = {
  row: number;
  col: number;
  box: number;
  value: number | null;
  solution: number;
  given: boolean;
  notes: Set<number>;
  error: boolean;
};
```

棋盘交互要求：

* 点击格子后选中
* 高亮当前选中格
* 高亮同一行、同一列、同一 3x3 宫
* 高亮相同数字
* 固定题目数字不可修改
* 用户输入数字可删除
* 支持键盘输入 1-9、Backspace、Delete
* 移动端支持数字键盘点击输入

---

### 2. 输入模式

需要支持两种输入模式：

#### Normal Mode

点击数字后，直接把数字填入当前格。

#### Notes Mode

点击数字后，把数字作为候选数写入当前格的小角标。

要求：

* Notes Mode 可通过按钮切换
* 候选数可重复点击取消
* 当格子填入正式数字时，清空 notes
* 当某个数字被正确填入后，可以自动删除同行、同列、同宫中对应的候选数

---

### 3. 自动候选数

实现 Auto Notes 功能。

点击 Auto Notes 后：

* 为所有空格自动计算合法候选数
* 已填数字不生成 notes
* 已经存在的用户 notes 可以选择保留或覆盖，默认覆盖

候选数计算规则：

```ts
candidate(cell) = 1..9 - rowUsed - colUsed - boxUsed
```

---

### 4. 错误检查

支持两种检查模式：

#### 手动检查

点击 Check 按钮后检查当前棋盘。

#### 自动检查

开启 Auto Check 后，每次输入后立即检查。

错误规则：

* 如果用户输入值不等于 solution，则标记为错误
* 或者同一行、列、宫出现重复数字，也标记为错误
* given 数字永远不标记错误

错误表现：

* 错误格子显示红色
* 震动或轻微动画提示
* 记录错误次数

---

### 5. 提示系统

实现基础 Hint 功能。

第一版不需要完整 AI，但要做成可扩展架构。

Hint 分三层：

#### Level 1: 指出一个可推进的格子

提示用户「这个格子可以确定」。

#### Level 2: 展示原因

例如：

* 该行只缺一个数字
* 该列只缺一个数字
* 该宫只缺一个数字
* 该数字在这个宫内只能放这里

#### Level 3: 填入答案

用户再次点击时，可以自动填入答案。

Hint 数据结构：

```ts
type Hint = {
  cell: { row: number; col: number };
  value: number;
  strategy: HintStrategy;
  explanation: string;
  relatedCells: Array<{ row: number; col: number }>;
};

type HintStrategy =
  | "naked-single"
  | "hidden-single-row"
  | "hidden-single-column"
  | "hidden-single-box";
```

需要先实现以下策略：

* Naked Single
* Hidden Single in Row
* Hidden Single in Column
* Hidden Single in Box

以后可以扩展：

* Locked Candidates
* Naked Pair
* Hidden Pair
* X-Wing
* Swordfish

---

### 6. 难度系统

支持以下难度：

```ts
type Difficulty = "easy" | "medium" | "hard" | "expert";
```

每个难度对应挖空数量和生成约束：

| Difficulty | Givens | 说明   |
| ---------- | -----: | ---- |
| easy       |  36-45 | 新手友好 |
| medium     |  30-35 | 普通玩家 |
| hard       |  25-29 | 有挑战  |
| expert     |  21-24 | 高难度  |

要求：

* 每个 puzzle 必须唯一解
* 生成时不能只随机挖空，需要验证唯一解
* 初版可以使用预置题库
* 后续再实现动态生成器

推荐第一版做法：

```ts
type Puzzle = {
  id: string;
  difficulty: Difficulty;
  puzzle: string;   // 81 chars, 0 means empty
  solution: string; // 81 chars
};
```

---

### 7. 游戏状态

需要记录：

```ts
type GameState = {
  puzzleId: string;
  difficulty: Difficulty;
  cells: Cell[];
  selectedCell: { row: number; col: number } | null;
  inputMode: "normal" | "notes";
  autoCheck: boolean;
  autoRemoveNotes: boolean;
  mistakes: number;
  hintsUsed: number;
  startedAt: number;
  elapsedSeconds: number;
  paused: boolean;
  completed: boolean;
};
```

支持：

* 新游戏
* 暂停
* 继续
* 重开本局
* 撤销 Undo
* 重做 Redo
* 保存进度
* 页面刷新后恢复

---

### 8. Undo / Redo

用户每次操作都要进入历史栈。

需要支持撤销：

* 填数字
* 删除数字
* 添加 note
* 删除 note
* Auto Notes
* Hint 填入

数据结构：

```ts
type Move = {
  before: Cell[];
  after: Cell[];
  action:
    | "set-value"
    | "clear-value"
    | "toggle-note"
    | "auto-notes"
    | "hint";
  timestamp: number;
};
```

---

### 9. 完成检测

每次输入后检查：

* 所有格子都有 value
* 所有 value === solution
* 没有错误

完成后显示结果弹窗：

* 用时
* 难度
* 错误次数
* 使用提示次数
* 是否开启 Auto Notes
* 是否开启 Auto Check
* 新游戏按钮
* 再来一局按钮

---

### 10. 每日挑战

实现 Daily Challenge。

规则：

* 每天固定生成一个 puzzleId
* 同一天所有用户看到同一局
* 可以基于日期和难度从题库中稳定取题

示例：

```ts
function getDailyPuzzleId(date: string, difficulty: Difficulty) {
  return hash(`${date}-${difficulty}`) % puzzlePool.length;
}
```

每日挑战记录：

```ts
type DailyRecord = {
  date: string;
  puzzleId: string;
  completed: boolean;
  elapsedSeconds: number;
  mistakes: number;
  hintsUsed: number;
};
```

---

## 页面结构

### Home Page

内容：

* Continue
* New Game
* Daily Challenge
* Difficulty Selector
* Statistics
* Settings

---

### Game Page

布局：

```txt
Header
- Back
- Difficulty
- Timer
- Pause

Board
- 9x9 Sudoku Grid

Controls
- Undo
- Erase
- Notes
- Hint
- Check

Number Pad
- 1 2 3 4 5 6 7 8 9
```

移动端布局：

* 棋盘优先
* 数字键盘放底部
* 操作按钮横向滚动或两行显示
* 不要依赖 hover

桌面端布局：

* 棋盘居中
* 右侧放 Controls 和 Number Pad
* 支持键盘快捷键

---

### Settings Page / Modal

设置项：

* Auto Check
* Auto Remove Notes
* Highlight Same Numbers
* Highlight Row / Column / Box
* Sound
* Vibration
* Dark Mode
* Mistake Limit
* Timer Visible

---

### Stats Page / Modal

统计项：

```ts
type Stats = {
  gamesStarted: number;
  gamesCompleted: number;
  bestTimeByDifficulty: Record<Difficulty, number | null>;
  averageTimeByDifficulty: Record<Difficulty, number | null>;
  currentStreak: number;
  bestStreak: number;
  totalMistakes: number;
  totalHintsUsed: number;
};
```

---

## 组件拆分

建议目录：

```txt
src/
  app/
    App.tsx
    routes.tsx

  components/
    Board/
      SudokuBoard.tsx
      SudokuCell.tsx
      NotesGrid.tsx

    Controls/
      GameControls.tsx
      NumberPad.tsx
      ToggleButton.tsx

    Modals/
      PauseModal.tsx
      CompleteModal.tsx
      SettingsModal.tsx
      HintModal.tsx

    Layout/
      Header.tsx
      Page.tsx

  game/
    types.ts
    constants.ts
    puzzleParser.ts
    solver.ts
    generator.ts
    candidates.ts
    hints.ts
    validator.ts
    daily.ts
    history.ts

  store/
    gameStore.ts
    settingsStore.ts
    statsStore.ts

  data/
    puzzles.easy.ts
    puzzles.medium.ts
    puzzles.hard.ts
    puzzles.expert.ts

  styles/
    globals.css
```

---

## 核心算法要求

### Puzzle Parser

实现：

```ts
parsePuzzle(puzzle: Puzzle): Cell[]
```

要求：

* puzzle 和 solution 都必须是 81 位字符串
* puzzle 中 0 代表空格
* 每个 Cell 包含 row、col、box、value、solution、given、notes

---

### Validator

实现：

```ts
validateBoard(cells: Cell[]): ValidationResult
```

返回：

```ts
type ValidationResult = {
  solved: boolean;
  errors: Array<{ row: number; col: number; reason: string }>;
};
```

检查：

* 用户填入值是否等于 solution
* 行重复
* 列重复
* 宫重复
* 是否完成

---

### Candidates

实现：

```ts
getCandidates(cells: Cell[], row: number, col: number): number[]
```

规则：

* 如果格子已有 value，返回空数组
* 排除同行、同列、同宫已有数字

---

### Solver

实现基础回溯求解器：

```ts
solve(puzzle: string): string | null;
countSolutions(puzzle: string, limit?: number): number;
hasUniqueSolution(puzzle: string): boolean;
```

要求：

* countSolutions 超过 limit 后提前停止
* 默认 limit = 2
* 用于验证 puzzle 是否唯一解

---

### Hint Engine

实现：

```ts
getNextHint(cells: Cell[]): Hint | null;
```

策略顺序：

1. Naked Single
2. Hidden Single Row
3. Hidden Single Column
4. Hidden Single Box

每个 hint 必须包含：

* 要填的 cell
* value
* strategy
* explanation
* relatedCells

---

## UI / UX 要求

### 棋盘样式

* 9x9 网格
* 每 3 格加粗边框
* given 数字颜色更深
* 用户数字颜色更亮
* note 使用 3x3 小数字布局
* selected cell 使用明显背景
* related cells 使用浅色背景
* same number 使用强调背景
* error 使用红色背景或红色文字

---

### 动效

使用 CSS transition 即可：

* 选中格子背景过渡
* 输入数字轻微 scale
* 错误 shake
* 完成弹窗 fade in
* 按钮点击 active scale

不要过度动画，数独游戏要保持安静、清晰、专注。

---

### 响应式

必须支持：

* iPhone SE 宽度
* 普通手机
* iPad
* 桌面浏览器

棋盘要求：

```css
width: min(92vw, 560px);
aspect-ratio: 1 / 1;
```

---

## 快捷键

桌面端支持：

| Key                    | Action   |
| ---------------------- | -------- |
| 1-9                    | 输入数字     |
| Backspace              | 删除       |
| Delete                 | 删除       |
| N                      | 切换 Notes |
| H                      | Hint     |
| C                      | Check    |
| Z / Ctrl+Z             | Undo     |
| Shift+Z / Ctrl+Shift+Z | Redo     |
| Arrow Keys             | 移动选中格    |

---

## 存储

使用 localStorage 保存：

```txt
sudoku:game-state
sudoku:settings
sudoku:stats
sudoku:daily-records
```

要求：

* 每次有效操作后保存
* 页面加载时恢复
* 如果 puzzleId 不存在或数据版本不匹配，自动丢弃旧存档

加入版本号：

```ts
const SAVE_VERSION = 1;
```

---

## 测试要求

至少测试：

* parsePuzzle
* getCandidates
* validateBoard
* solve
* countSolutions
* hasUniqueSolution
* getNextHint
* undo / redo
* daily puzzle id 稳定性

示例测试：

```ts
describe("solver", () => {
  it("solves a valid puzzle", () => {});
  it("detects unique solution", () => {});
  it("detects multiple solutions", () => {});
});
```

---

## 第一阶段开发任务

### Phase 1: 可玩版本

完成：

* React 项目初始化
* 9x9 棋盘
* 数字输入
* 删除
* 选中高亮
* 相同数字高亮
* row / column / box 高亮
* 预置 puzzle
* 完成检测

---

### Phase 2: 数独核心体验

完成：

* Notes Mode
* Auto Notes
* Auto Remove Notes
* Auto Check
* Mistakes
* Undo / Redo
* Timer
* Pause

---

### Phase 3: 学习体验

完成：

* Hint Engine
* Hint Modal
* Naked Single
* Hidden Single Row
* Hidden Single Column
* Hidden Single Box
* 相关格子高亮
* 解释文案

---

### Phase 4: 产品化

完成：

* Daily Challenge
* Statistics
* Settings
* Dark Mode
* LocalStorage
* PWA
* Mobile polish

---

## 示例 puzzle 数据

先放几局内置题目，保证能快速跑起来：

```ts
export const easyPuzzles = [
  {
    id: "easy-001",
    difficulty: "easy",
    puzzle:
      "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    solution:
      "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
];
```

---

## 代码风格

* 所有核心逻辑必须放在 `src/game`
* React 组件不要直接写复杂算法
* Store 负责状态流转
* UI 组件保持纯净
* TypeScript 开 strict
* 不使用 `any`
* 函数尽量小而明确
* 游戏逻辑必须有单元测试

---

## 不要做

* 不要一开始做复杂动画
* 不要一开始做账号系统
* 不要一开始接后端
* 不要一开始做排行榜
* 不要使用随机 puzzle 而不验证唯一解
* 不要把求解器逻辑写进 React 组件
* 不要让移动端依赖键盘输入

---

## 验收标准

项目完成后需要满足：

1. 用户可以选择难度并开始新游戏
2. 用户可以完整玩完一局数独
3. 棋盘交互在手机和桌面都流畅
4. 支持 notes、auto notes、hint、check、undo、redo
5. 每局都有唯一解
6. 刷新页面后可以恢复当前游戏
7. 完成后显示统计结果
8. 核心算法有测试
9. UI 清晰、安静、专注
10. 可以通过 `pnpm build` 正常构建

---

## 推荐命令

```bash
pnpm create vite sudoku-game --template react-ts
cd sudoku-game
pnpm install
pnpm add zustand clsx
pnpm add -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm dlx tailwindcss init -p
pnpm dev
```

---

## 可选增强

后续可以加入：

* 主题皮肤
* 成就系统
* 连胜系统
* 每日挑战日历
* 排行榜
* 用户自定义导入 puzzle
* OCR 导入数独题目
* 分享成绩图
* 逻辑技巧教学库
* 更高级 Hint 策略
* Web Worker 求解器
* IndexedDB 存储
* 离线 PWA
