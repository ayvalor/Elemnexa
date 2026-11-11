import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers.mjs';

test('workspace tabs have thin borders, fit their labels and support keyboard navigation', async ({ page }) => {
  await gotoHome(page);
  const search = page.getByRole('searchbox', { name: /Search elements/ });
  await search.fill('Carbon');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  const tabs = page.getByRole('tablist', { name: 'Chemistry workspaces' });
  for (const tab of await tabs.getByRole('tab').all()) {
    const metrics = await tab.evaluate(node => {
      const style = getComputedStyle(node);
      const bounds = node.getBoundingClientRect();
      const label = node.querySelector('span');
      const range = document.createRange();
      range.selectNodeContents(label);
      return {
        width: style.borderTopWidth, style: style.borderTopStyle, height: bounds.height,
        fits: [...range.getClientRects()].every(rect => rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom),
      };
    });
    expect(metrics).toMatchObject({ width: '1px', style: 'solid', fits: true });
    expect(metrics.height).toBeGreaterThanOrEqual(44);
  }
  await tabs.getByRole('tab', { name: 'Periodic Table' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: 'Chemistry Suite' })).toBeFocused();
  await expect(tabs.getByRole('tab', { name: 'Chemistry Suite' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(tabs.getByRole('tab', { name: 'Periodic Table' })).toHaveAttribute('aria-selected', 'true');
});

test('Instagram profile and feedback use the requested account and remain reachable on mobile', async ({ page }) => {
  await gotoHome(page);
  const footer = page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  const profile = footer.getByRole('link', { name: '@ayvalor on Instagram (opens in a new tab)', exact: true });
  const feedback = footer.getByRole('link', { name: 'Send feedback via Instagram DM (opens in a new tab)', exact: true });
  await expect(profile).toHaveAttribute('href', 'https://www.instagram.com/ayvalor/');
  await expect(feedback).toHaveAttribute('href', 'https://ig.me/m/ayvalor');
  await expect(footer).toContainText('Opens Instagram messages. You may need to sign in.');
  for (const link of [profile, feedback]) {
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const bounds = await link.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize().width);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
  }
});
