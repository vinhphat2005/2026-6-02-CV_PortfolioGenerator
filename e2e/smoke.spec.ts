import { test, expect } from "@playwright/test";

test("loads sample profile, scores, matches JD, and previews", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Career Forge" })).toBeVisible();
  await page.getByRole("link", { name: "Open Studio" }).first().click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByText("Career Forge", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Job Match" }).click();
  await page.getByPlaceholder(/Paste a job description/i).fill(
    "We need React, TypeScript, REST API, Docker, MongoDB and testing experience."
  );
  await expect(page.getByText("Matched Keywords")).toBeVisible();
  await page.getByRole("button", { name: "Score" }).click();
  await expect(page.getByText("/ 100")).toBeVisible();
  await page.getByRole("button", { name: "Templates" }).click();
  await page.getByText("Classic Sidebar").click();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByText("A4 resume preview")).toBeVisible();
});
