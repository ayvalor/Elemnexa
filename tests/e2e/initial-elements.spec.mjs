import { test, expect } from '@playwright/test';

for (const javaScriptEnabled of [true, false]) {
  test.describe(`automatic element layout with JavaScript ${javaScriptEnabled ? 'enabled' : 'disabled'}`, () => {
    test.use({ javaScriptEnabled });

    test('elements appear on first load and refresh across responsive boundaries without switching views', async ({ page }) => {
      for (const width of [639, 640, 731, 767, 768]) {
        await test.step(`${width}px first load and refresh`, async () => {
          await page.setViewportSize({ width, height: 850 });
          for (const navigation of ['first load', 'refresh']) {
            if (navigation === 'first load') await page.goto('/');
            else await page.reload();
            await expect(page.locator('.periodic-explorer')).toHaveAttribute('data-view', 'auto');
            await expect(page.locator('.element-preview:visible')).toHaveCount(width < 768 ? 118 : 0);
            await expect(page.locator('.element-tile:visible')).toHaveCount(width < 768 ? 0 : 118);
            const hydrogen = page.locator('#panel-table button[data-element-number="1"]:visible');
            await hydrogen.scrollIntoViewIfNeeded();
            await expect(hydrogen).toBeInViewport();
            await expect(hydrogen).toContainText('Hydrogen');
          }
        });
      }
    });
  });
}
