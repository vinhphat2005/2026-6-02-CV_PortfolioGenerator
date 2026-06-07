import { expect, test } from "@playwright/test";

test("edits, persists, templates, and resets a portfolio deck session", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/studio");
  await page.getByRole("button", { name: "Portfolio Deck" }).click();
  await expect(page.getByRole("heading", { name: "Portfolio Deck" })).toBeVisible();
  await page.getByRole("button", { name: "Deck", exact: true }).click();

  const template = page.getByLabel("Deck Template");
  for (const templateId of [
    "editorial-blue",
    "architectural-minimal",
    "bold-studio-orange",
    "digital-agency-noir",
    "swiss-editorial-coral",
    "playful-product-grid"
  ]) {
    await template.selectOption(templateId);
    await expect(page.locator(`[data-deck-template="${templateId}"]`)).toBeVisible();
    const templatePages = await page.locator(".portfolio-deck-page").evaluateAll((pages) =>
      pages.map((item) => ({
        blank: !item.textContent?.trim(),
        overflowX: item.scrollWidth > item.clientWidth + 1,
        overflowY: item.scrollHeight > item.clientHeight + 1
      }))
    );
    expect(templatePages.every((item) => !item.blank && !item.overflowX && !item.overflowY)).toBe(true);
  }

  await expect(page.getByLabel("Primary Color")).toHaveValue("#c7f000");
  await expect(page.getByLabel("Secondary Color")).toHaveValue("#251f47");
  await page.getByLabel("Primary Color").fill("#f59e0b");
  await page.getByLabel("Secondary Color").fill("#111827");
  await page.getByRole("button", { name: "Add Case Study" }).click();
  await expect(page.locator('input[value="New Case Study"]')).toBeVisible();

  const include = page.getByLabel("Include in printable deck").first();
  await include.uncheck();
  await expect(include).not.toBeChecked();
  await page.getByTitle("Move case study down").first().click();

  const upload = page.locator('input[type="file"][accept="image/png,image/jpeg,image/webp"]').first();
  await upload.setInputFiles({
    name: "local-cover.webp",
    mimeType: "image/webp",
    buffer: Buffer.from([1, 2, 3, 4])
  });
  await expect(page.getByText("Image stored in this browser session.")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Portfolio Deck" }).click();
  await page.getByRole("button", { name: "Deck", exact: true }).click();
  await expect(page.getByRole("button", { name: "Clear Cover" }).first()).toBeEnabled();
  await expect(page.locator('input[value="New Case Study"]')).toBeVisible();

  const pageMetrics = await page.locator(".portfolio-deck-page").evaluateAll((pages) =>
    pages.map((item) => ({
      width: item.clientWidth,
      height: item.clientHeight,
      overflowX: item.scrollWidth > item.clientWidth + 1,
      overflowY: item.scrollHeight > item.clientHeight + 1
    }))
  );
  expect(pageMetrics.length).toBeGreaterThanOrEqual(7);
  expect(pageMetrics.every((item) => item.width > 0 && item.height > 0 && !item.overflowX && !item.overflowY)).toBe(true);

  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByRole("status", { name: "Preview zoom" })).toHaveText("110%");
  await page.getByRole("button", { name: "Fit preview" }).click();
  await expect(page.getByRole("status", { name: "Preview zoom" })).toHaveText("100%");
  await page.getByRole("button", { name: "Focus Preview" }).click();
  await expect(page.getByRole("button", { name: "Back to Editor" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Focus Preview" })).toBeVisible();

  await page.getByRole("button", { name: "Reset Local Session" }).click();
  await page.getByRole("button", { name: "Portfolio Deck" }).click();
  await expect(page.getByRole("button", { name: "Clear Cover" }).first()).toBeDisabled();
  await expect(page.locator('input[value="New Case Study"]')).toHaveCount(0);
});
