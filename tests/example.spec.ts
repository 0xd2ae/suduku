import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

async function startEasyGame(page: import("@playwright/test").Page) {
  await page.goto("http://127.0.0.1:5173/");
  await page.getByRole("button", { name: /简单/ }).click();
  await expect(page.getByRole("grid", { name: "Sudoku board" })).toBeVisible();
}

for (const viewport of viewports) {
  test(`sudoku board and controls fit ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await startEasyGame(page);

    const board = page.getByRole("grid", { name: "Sudoku board" });
    const boardBox = await board.boundingBox();
    expect(boardBox).not.toBeNull();
    expect(Math.abs((boardBox?.width ?? 0) - (boardBox?.height ?? 0))).toBeLessThanOrEqual(1);
    expect(boardBox?.width ?? 0).toBeLessThanOrEqual(viewport.width);

    await expect(page.getByRole("gridcell")).toHaveCount(81);

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth).toBeLessThanOrEqual(viewport.width);

    const minButtonHeight = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button:not([role='gridcell'])")];
      return Math.min(...buttons.map((button) => button.getBoundingClientRect().height));
    });
    expect(minButtonHeight).toBeGreaterThanOrEqual(44);
  });
}

test("basic input, notes, erase, and pause interactions work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startEasyGame(page);

  const cells = page.getByRole("gridcell");
  const emptyIndex = await cells.evaluateAll((elements) =>
    elements.findIndex((element) => element.getAttribute("aria-label")?.includes("empty, editable")),
  );
  expect(emptyIndex).toBeGreaterThanOrEqual(0);
  const emptyCell = cells.nth(emptyIndex);
  await emptyCell.click();
  await page.getByRole("button", { name: /Number 5/ }).click();
  await expect(emptyCell).toContainText("5");

  await page.getByRole("button", { name: "Erase" }).click();
  await expect(emptyCell).not.toContainText("5");

  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByRole("button", { name: /Number 1/ }).click();
  await page.getByRole("button", { name: /Number 2/ }).click();
  await expect(emptyCell).toContainText("1");
  await expect(emptyCell).toContainText("2");
  await page.getByRole("button", { name: /Number 2/ }).click();
  await expect(emptyCell).not.toContainText("2");

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("dialog", { name: "已暂停" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "已暂停" })).toBeHidden();
});

test("complete modal closes when returning home", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startEasyGame(page);

  await page.getByRole("button", { name: "填满答案" }).click();
  await expect(page.getByRole("dialog", { name: "完成" })).toBeVisible();

  await page.getByRole("button", { name: "首页" }).click();
  await expect(page.getByRole("heading", { name: "开始游戏" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "完成" })).toBeHidden();
});
