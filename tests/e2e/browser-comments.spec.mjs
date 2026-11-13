import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers.mjs';

test('wordmark stays accessible and annotated hero copy and field guide stay removed', async ({ page }) => {
  await gotoHome(page);
  await expect(page.locator('.brand')).toHaveAccessibleName('Elemnexa — Explore elements. Understand chemistry.');
  await expect(page.locator('.brand-wordmark img')).toBeVisible();
  const visibleLetters = await page.locator('.brand-title').evaluate(node => {
    const clone = node.cloneNode(true);
    clone.querySelector('.sr-only').remove();
    return clone.textContent;
  });
  expect(visibleLetters).toBe('lemnexa');
  await expect(page.locator('.discovery-note, .footer-identity, .footer-mark, .learning-strip')).toHaveCount(0);
  for (const copy of [
    'YOUR CURIOSITY. MEET CHEMISTRY.',
    'SMALL ELEMENTS. ENDLESS POSSIBILITIES.',
    'CLICK AN ELEMENT TO MAKE A DISCOVERY',
    'Elements to discover',
    'Reasons to be curious',
    'THE BUILDING BLOCKS OF EVERYTHING',
    'One tile. A whole story.',
    'Big ideas, down to the atom.',
  ]) await expect(page.getByText(copy, { exact: true })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'How to read an element tile' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Interactive Periodic Table', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('synthetic switch works with keyboard, card view, search, and filter reset', async ({ page }) => {
  await gotoHome(page);
  const toggle = page.getByRole('switch', { name: 'Synthetic elements only' });
  const syntheticNumbers = Array.from({ length: 24 }, (_, index) => index + 95);
  await expect(toggle).not.toBeChecked();
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toBeChecked();
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('24 of 118 elements');
  await expect(page.locator('.element-tile:enabled')).toHaveCount(24);
  await page.getByRole('button', { name: 'Periodic table view' }).click();
  await expect(page.locator('.element-tile:visible')).toHaveCount(24);
  await page.getByRole('button', { name: 'Element cards view' }).click();
  const numbers = await page.locator('.element-preview').evaluateAll(cards => cards.map(card => Number(card.dataset.elementNumber)));
  expect(numbers).toEqual(syntheticNumbers);
  await page.getByRole('searchbox').fill('Carbon');
  await expect(page.getByRole('status')).toHaveText('0 of 118 elements');
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(toggle).not.toBeChecked();
  await expect(page.getByRole('status')).toHaveText('118 of 118 elements');
  for (const number of [43, 61, 93, 94]) {
    await expect(page.locator(`.element-preview[data-element-number="${number}"]`)).toBeEnabled();
  }
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});

test('hero actions have matching sizes and the lab button responds to hover and click', async ({ page }) => {
  await gotoHome(page);
  const explore = page.getByRole('button', { name: 'Explore the elements', exact: true });
  const lab = page.getByRole('button', { name: 'Open the lab', exact: true });
  const exploreBounds = await explore.boundingBox();
  const labBounds = await lab.boundingBox();
  expect(Math.abs(exploreBounds.width - labBounds.width)).toBeLessThan(1);
  expect(Math.abs(exploreBounds.height - labBounds.height)).toBeLessThan(1);
  expect(labBounds.height).toBeGreaterThanOrEqual(52);
  const background = await lab.evaluate(node => getComputedStyle(node).backgroundColor);
  await lab.hover();
  await expect.poll(() => lab.evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe(background);
  await expect(lab).not.toHaveCSS('transform', 'none');
  await lab.click();
  await expect(page.getByRole('tab', { name: 'Chemistry Suite', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('textbox', { name: 'Chemical equation' })).toBeVisible();
});

test('header navigation stays visible, fits the viewport and identifies the active workspace', async ({ page }) => {
  await gotoHome(page);
  const navigation = page.getByRole('navigation', { name: 'Quick navigation' });
  for (const button of await navigation.getByRole('button').all()) {
    await expect(button).toBeVisible();
    const bounds = await button.boundingBox();
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize().width);
  }
  for (const [name, tab] of [['Chemistry tools', 'Chemistry Suite'], ['Practice', 'Worksheet Generator'], ['Explore', 'Periodic Table']]) {
    const button = navigation.getByRole('button', { name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-current', 'location');
    await expect(navigation.locator('[aria-current]')).toHaveCount(1);
    await expect(page.getByRole('tab', { name: tab, exact: true })).toHaveAttribute('aria-selected', 'true');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('light is the default on a dark system and an explicit dark preference survives reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await gotoHome(page);
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f7f9f8');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0b1418');
});

test('molar calculator examples compute real results and editing clears the old result', async ({ page }) => {
  await gotoHome(page);
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  await page.getByRole('button', { name: 'Molar Mass Calculator', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'How it adds up' })).toBeVisible();
  const example = page.getByRole('group', { name: 'Example formulas' }).getByRole('button', { name: 'H2O', exact: true });
  await example.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('textbox', { name: 'Molecular formula' })).toHaveValue('H2O');
  await expect(page.locator('.molar-total')).toContainText('18.0150');
  await page.getByRole('textbox', { name: 'Molecular formula' }).fill('NaCl');
  await expect(page.locator('.molar-total')).toHaveCount(0);
  await page.getByRole('button', { name: 'Calculate Mass', exact: true }).click();
  await expect(page.locator('.molar-total')).toContainText('58.4400');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
