# Bug Audit Report

## Commands Run

- `pnpm install` - passed, lockfile already up to date.
- `pnpm lint` - passed.
- `pnpm test` - initially failed because Vitest collected `tests/example.spec.ts`, which imports missing `@playwright/test`.
- `pnpm test` - passed after limiting Vitest to unit test files, 45 tests.
- `pnpm build` - passed.
- `pnpm validate:puzzles` - passed, 400 generated puzzles.
- `pnpm dev --host 127.0.0.1` - started at `http://127.0.0.1:5173/`.
- `pnpm add -D @playwright/test@1.61.1` - added Playwright test runner for local UI audit.
- `pnpm exec playwright test tests/example.spec.ts --project=chromium --reporter=line` - passed, 7 Chromium UI tests.
- `pnpm exec playwright test tests/example.spec.ts --project=chromium --reporter=line -g "complete modal closes"` - passed.
- `pnpm exec playwright test tests/example.spec.ts --project=chromium --reporter=line` - passed, 8 Chromium UI tests after completion modal regression coverage.

## Fixed Logic Bugs

### 1. Vitest collected a Playwright example spec

原因：`tests/example.spec.ts` imports `@playwright/test`, but that package is not installed and should not be part of the unit test run.

修复：Scoped Vitest `include` to `src/**/*.test.ts` and `scripts/**/*.test.ts`.

验证：`pnpm test` passes.

### 2. Auto Remove Notes depended on the hidden solution

原因：Peer notes were removed only when the entered value matched `cell.solution`.

修复：Auto Remove Notes now removes peer candidates for any placed formal value, based on current board state.

验证：Added a test that enters a wrong value and confirms matching peer notes are still removed.

### 3. Completed games were also marked paused

原因：Completion returned `{ completed: true, paused: true }`, mixing completion state with pause state and blocking consistent undo semantics.

修复：Completion now leaves `paused: false`; timer/input still stop because `completed` is checked directly.

验证：Added completion tests for solved board, blocked editing after completion, and undo from completion.

### 4. Solver treated conflicting givens as solvable in edge cases

原因：`solve` / `countSolutions` did not validate the initial fixed digits before backtracking.

修复：Added an initial givens conflict check; conflicting puzzles now return no solution.

验证：Added tests for invalid duplicate givens.

## Fixed UI Bugs

### 1. Controls stayed visually enabled while paused or completed

原因：Store actions guarded input, but several control buttons did not show disabled state.

修复：Disabled erase, notes, hint, fill, check, auto notes, and pause controls when inappropriate.

验证：Type check, tests, and build pass.

### 2. Number pad accessibility state was incomplete

原因：Digit buttons did not expose selected state in number-first mode.

修复：Added `aria-label` and `aria-pressed` to digit buttons.

验证：Build pass.

### 3. Mobile modal/toast edges were fragile

原因：Modal panels lacked max-height overflow handling, and hint toast did not account for safe-area bottom inset.

修复：Added modal max-height/overflow, safe-area-aware hint bottom offset, and minimum height for the hint fill button.

验证：Build pass. Real iOS Safari safe-area behavior still needs device confirmation.

### 4. Pause modal had no dialog metadata or ESC close

原因：Pause modal was visually modal but lacked dialog attributes and keyboard dismissal.

修复：Added `role="dialog"`, `aria-modal`, labelled heading, and ESC-to-resume for the pause modal.

验证：Type check and build pass.

### 5. Icon-only controls lacked stable accessible names

原因：Header icon buttons used symbol text plus `title`, which was not reliable for Playwright/user agents as an accessible button name.

修复：Added explicit `aria-label` to Back, Theme, Pause/Resume, Undo, Redo, and Erase controls.

验证：Playwright interaction test can now find and operate Pause and Erase by accessible name.

### 6. Complete modal stayed open after returning home

原因：`CompleteModal` is mounted at app level and rendered whenever `completed` was true, regardless of whether the current screen was `home` or `game`.

修复：`CompleteModal` now renders only when `completed` is true and `screen === "game"`.

验证：Added a Playwright regression test that completes the game through the dev panel, clicks `首页`, verifies the home page is visible, and verifies the complete dialog is hidden.

## Added Tests

- Parser: 81 cells, editable empty cells, empty notes, box indexes, given/solution mismatch rejection.
- Candidates: row/column/box exclusions, filled-cell empty candidates, hidden solution independence.
- Validator: conflict-only vs solution-check, deletion clears errors, givens are not marked as user mistakes.
- Solver: conflicting givens are unsolvable.
- Store/input: null selection ignored, givens locked, paused/completed blocked, notes toggle, delete behavior.
- Store/history: valid move pushes history, invalid move does not, undo/redo notes, new move clears redo.
- Store/restart/new game: restart restores initial puzzle, clears completed and history; new game clears stale state.
- Store/completion/timer: solved board completes, completed board cannot edit, undo reopens, tick stops on paused/completed, new game resets elapsed time.
- Store/persistence: save/load game state, notes `Set` serializes as arrays and restores as `Set`, invalid JSON/version/missing puzzle are discarded.
- Hint: targets editable empty cells, value matches solution, related cells stay in board bounds, hint move is undoable.
- Playwright UI audit: verifies board fit at `320x568`, `375x667`, `390x844`, `430x932`, `768x1024`, and `1440x900`.
- Playwright interaction audit: verifies basic input, erase, notes toggle, note removal, pause modal, and ESC resume.
- Playwright completion modal regression: verifies `首页` from the completion modal returns to the home page and closes the dialog.

## Remaining Manual QA

- Manually confirm real iOS Safari bottom toolbar and safe-area behavior.
- Manually confirm repeated pause/resume does not create duplicate intervals in a real browser runtime.
- Modal focus trapping is still minimal; current fix adds dialog metadata and ESC for pause only.

## Suggested Follow-up

- Add screenshot attachments to Playwright UI tests if visual regression artifacts are required.
- Consider a small focus-trap utility for modals.
- Consider an explicit non-modal conflict message for Hint when the board has conflicts.
