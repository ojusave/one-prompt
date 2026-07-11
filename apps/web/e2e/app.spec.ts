import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "One Prompt" })).toBeVisible();
  await expect(page.getByText("See what one AI instruction becomes at runtime.")).toBeVisible();
});

test("late-failure replay journey", async ({ page }) => {
  await page.goto("/runs/demo-late-failure?autoplay=1");

  await expect(page.getByText(/Investigate why retrying/)).toBeVisible();

  // Graph should appear
  await expect(page.locator(".react-flow")).toBeVisible({ timeout: 10000 });

  // Timeline controls
  await expect(page.getByRole("button", { name: "Play" }).or(page.getByRole("button", { name: "Pause" }))).toBeVisible();

  // Wait for completion or significant progress
  await page.waitForTimeout(3000);
});

test("compare page shows three traces", async ({ page }) => {
  await page.goto("/compare?runs=demo-clean,demo-detour,demo-late-failure");
  await expect(page.getByText("Clean path")).toBeVisible();
  await expect(page.getByText("Unexpected detour")).toBeVisible();
  await expect(page.getByText("Late failure")).toBeVisible();
});

test("presentation mode query param", async ({ page }) => {
  await page.goto("/runs/demo-late-failure?present=1");
  await expect(page.getByText("One Prompt")).toBeVisible();
  // Nav links hidden in presentation mode
  await expect(page.getByRole("link", { name: "Compare" })).not.toBeVisible();
});
