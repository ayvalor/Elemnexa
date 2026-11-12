import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers.mjs';
import { elementsData } from '../../data/element-index.js';

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
  await expect(page.locator('.discovery-note, .footer-identity, .footer-mark')).toHaveCount(0);
  for (const copy of [
    'YOUR CURIOSITY. MEET CHEMISTRY.',
    'SMALL ELEMENTS. ENDLESS POSSIBILITIES.',
    'CLICK AN ELEMENT TO MAKE A DISCOVERY',
    'Elements to discover',
    'Reasons to be curious',
    'THE BUILDING BLOCKS OF EVERYTHING',
    'One tile. A whole story.',
  ]) await expect(page.getByText(copy, { exact: true })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'How to read an element tile' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Interactive Periodic Table', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('synthetic switch works with keyboard, card view, search, and filter reset', async ({ page }) => {
  await gotoHome(page);
  const toggle = page.getByRole('switch', { name: 'Synthetic elements only' });
  const synthetic = elementsData.filter(element => element.synthetic);
  await expect(toggle).not.toBeChecked();
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toBeChecked();
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('status')).toHaveText(`${synthetic.length} of 118 elements`);
  await expect(page.locator('.element-tile:enabled')).toHaveCount(synthetic.length);
  await page.getByRole('button', { name: 'Periodic table view' }).click();
  await expect(page.locator('.element-tile:visible')).toHaveCount(synthetic.length);
  await page.getByRole('button', { name: 'Element cards view' }).click();
  const numbers = await page.locator('.element-preview').evaluateAll(cards => cards.map(card => Number(card.dataset.elementNumber)));
  expect(numbers).toEqual(synthetic.map(element => element.number));
  await page.getByRole('searchbox').fill('Carbon');
  await expect(page.getByRole('status')).toHaveText('0 of 118 elements');
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(toggle).not.toBeChecked();
  await expect(page.getByRole('status')).toHaveText('118 of 118 elements');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
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
