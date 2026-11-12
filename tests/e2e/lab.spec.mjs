import { test as base, expect } from '@playwright/test';
import { gotoHome } from './helpers.mjs';

// Surface JavaScript crashes alongside the user-visible assertions in every test.
const test = base.extend({
  appErrors: [async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(errors);
    expect(errors, 'The app must not throw uncaught browser exceptions').toEqual([]);
  }, { auto: true }],
});

async function openApp(page) {
  await gotoHome(page);
  await expect(page.getByRole('heading', { name: 'Interactive Periodic Table', exact: true })).toBeVisible();
  // Confirm the hydrated control updates client state.
  const search = page.getByRole('searchbox', { name: /Search elements/ });
  await search.fill('Hydrogen');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  await search.clear();
  await expect(page.getByRole('status')).toHaveText('118 of 118 elements');
}

async function expectNoPageOverflow(page) {
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(widths.body, JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport + 1);
  expect(widths.document, JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport + 1);
}

const elementButtons = page => page.locator('#panel-table button[aria-haspopup="dialog"]:visible:not([disabled])');

test('all elements render; searching, filters, and empty state work', async ({ page }) => {
  await openApp(page);
  await expect(elementButtons(page)).toHaveCount(118);
  await expectNoPageOverflow(page);
  const search = page.getByRole('searchbox', { name: /Search elements/ });
  await search.fill(' oganesson ');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  await expect(elementButtons(page)).toHaveCount(1);
  await expect(elementButtons(page)).toHaveAccessibleName(/Atomic number 118\b.*Oganesson/);
  await search.fill('not-an-element');
  await expect(page.getByRole('heading', { name: 'No matching elements' })).toBeVisible();
  await expect(elementButtons(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear all filters' }).click();
  await page.getByRole('button', { name: 'Liquid', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('2 of 118 elements');
  await expect(elementButtons(page)).toHaveCount(2);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(elementButtons(page)).toHaveCount(118);
});

test('theme changes both styling and persisted preference', async ({ page }) => {
  await openApp(page);
  const initialColor = await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect.poll(() => page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe(initialColor);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('disabled browser storage does not break theme controls', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
  });
  await openApp(page);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('theme remains usable when storage can be read but writes are denied', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'light');
    Storage.prototype.setItem = () => { throw new DOMException('Writes disabled', 'QuotaExceededError'); };
  });
  await openApp(page);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Chemical equation' })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('keyboard tabs and modal focus remain usable, including animated close', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openApp(page);
  await page.getByRole('tab', { name: 'Periodic Table', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Chemistry Suite', exact: true })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Chemistry Suite', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  const hydrogen = page.getByRole('button', { name: /Atomic number 1\b.*Hydrogen/ });
  await hydrogen.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Hydrogen', exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close Hydrogen details' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close Hydrogen details' })).toBeFocused();
  await expectNoPageOverflow(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(hydrogen).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('balancer handles valid, invalid, and larger-coefficient reactions', async ({ page }) => {
  await openApp(page);
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  await expect(page.getByText('C3H8 + 5O2 = 3CO2 + 4H2O', { exact: true })).toBeVisible();
  const equation = page.getByRole('textbox', { name: 'Chemical equation' });
  await equation.fill('C20H42 + O2 = CO2 + H2O');
  await page.getByRole('button', { name: 'Balance Equation', exact: true }).click();
  await expect(page.getByText('2C20H42 + 61O2 = 40CO2 + 42H2O', { exact: true })).toBeVisible();
  await equation.fill('H2 + O2 = NaCl');
  await page.getByRole('button', { name: 'Balance Equation', exact: true }).click();
  await expect(page.getByText('Error Balancing', { exact: true })).toBeVisible();
  await equation.fill('H2 + O2 = H2O');
  await equation.press('Enter');
  await expect(page.getByText('2H2 + O2 = 2H2O', { exact: true })).toBeVisible();
  await expectNoPageOverflow(page);
  await page.getByRole('tab', { name: 'Periodic Table', exact: true }).click();
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  await expect(equation).toHaveValue('H2 + O2 = H2O');
});

test('molar mass validates formulas and supports hydrate notation', async ({ page }) => {
  await openApp(page);
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  await page.getByRole('button', { name: 'Molar Mass Calculator', exact: true }).click();
  const formula = page.getByRole('textbox', { name: 'Molecular formula' });
  await formula.fill('H2O');
  await formula.press('Enter');
  await expect(page.getByText('18.0150', { exact: false })).toBeVisible();
  await formula.fill('CuSO4·5H2O');
  await formula.press('Enter');
  await expect(page.getByText('249.6770', { exact: false })).toBeVisible();
  await formula.fill('Og');
  await formula.press('Enter');
  await expect(page.getByText('Approximate Molar Mass', { exact: true })).toBeVisible();
  await expect(page.getByText(/This estimate uses representative isotope mass numbers for Og/)).toBeVisible();
  await expect(page.getByText('Isotope mass number:', { exact: false })).toContainText('[294]');
  await expectNoPageOverflow(page);
  await formula.fill('Og1000000');
  await formula.press('Enter');
  await expect(page.locator('.molar-total')).toContainText('294000000.0000');
  await expectNoPageOverflow(page);
  await formula.fill('H2O');
  await formula.press('Enter');
  await expect(page.getByText('Total Molar Mass', { exact: true })).toBeVisible();
  await expect(page.getByText(/This estimate uses representative isotope mass numbers/)).toHaveCount(0);
  await formula.fill('H2O<script>');
  await formula.press('Enter');
  await expect(page.getByText('Error Parsing Formula', { exact: true })).toBeVisible();
  await expectNoPageOverflow(page);
});

test('solubility cells and atom controls work on every viewport', async ({ page }) => {
  await openApp(page);
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  await page.getByRole('button', { name: 'Solubility Table', exact: true }).click();
  await page.getByRole('button', { name: 'Ag⁺ and Cl⁻: Insoluble', exact: true }).click();
  await expect(page.getByText(/Silver and lead\(II\) halides are sparingly soluble/)).toBeVisible();
  await page.getByRole('button', { name: 'Molar Mass Calculator', exact: true }).click();
  await page.getByRole('button', { name: 'Solubility Table', exact: true }).click();
  await page.getByRole('button', { name: 'Close solubility details', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ag⁺ and Cl⁻: Insoluble', exact: true })).toBeFocused();
  await expectNoPageOverflow(page);
  await page.getByRole('button', { name: 'Virtual 3D Atom Showcase', exact: true }).click();
  await expect(page.getByRole('img', { name: /Schematic atom with 6 protons, 6 neutrons and 6 electrons/ })).toBeVisible();
  await page.getByRole('combobox', { name: 'Select predefined atom' }).selectOption('1');
  await expect(page.getByRole('img', { name: /Schematic atom with 1 protons, 0 neutrons and 1 electrons/ })).toBeVisible();
  await page.getByRole('button', { name: 'Increase electrons', exact: true }).click();
  await expect(page.getByRole('img', { name: /and 2 electrons/ })).toBeVisible();
  await page.getByRole('button', { name: 'Play atom animation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause atom animation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause atom animation', exact: true }).click();
  await expectNoPageOverflow(page);
});

test('worksheet generation, answers, empty states, and printing stay consistent', async ({ page }) => {
  await openApp(page);
  await page.getByRole('tab', { name: 'Worksheet Generator', exact: true }).click();
  const questions = page.locator('.worksheet-question');
  await expect(questions).toHaveCount(10);
  await page.getByRole('button', { name: '5', exact: true }).click();
  await expect(page.getByText('Settings changed. Select Generate Worksheet to apply them.')).toBeVisible();
  await page.getByRole('button', { name: 'Generate Worksheet', exact: true }).click();
  await expect(questions).toHaveCount(5);
  await page.getByRole('button', { name: 'Show Answer Key', exact: true }).click();
  await expect(page.getByText('TEACHER ANSWER KEY · 5 questions')).toBeVisible();
  await expect(page.getByText('Explanation', { exact: true })).toHaveCount(5);
  await expectNoPageOverflow(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('heading', { name: 'Chemistry Practice Sheet', exact: true })).toBeVisible();
  await expect(page.getByText('TEACHER ANSWER KEY · 5 questions')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate Worksheet', exact: true })).toBeHidden();
  await expect(page.locator('.site-header')).toBeHidden();
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: 'Hide Answer Key', exact: true }).click();
  await expect(page.getByText('STUDENT WORKSHEET · 5 questions')).toBeVisible();
  await expect(page.getByText('Explanation', { exact: true })).toHaveCount(0);
  for (const checkbox of await page.getByRole('group', { name: 'Reaction categories', exact: true }).getByRole('checkbox').all()) await checkbox.uncheck();
  await page.getByRole('button', { name: 'Generate Worksheet', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No matching reactions', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show Answer Key', exact: true })).toBeDisabled();
});

test('serves security headers and loads self-hosted fonts without remote requests', async ({ page }) => {
  const externalRequests = [];
  const response = await gotoHome(page);
  const origin = new URL(page.url()).origin;
  page.on('request', request => { if (new URL(request.url()).origin !== origin) externalRequests.push(request.url()); });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
  expect(response.headers()['content-security-policy']).toContain("object-src 'none'");
  expect(response.headers()['x-powered-by']).toBeUndefined();
  expect(await page.locator('body').evaluate(node => getComputedStyle(node).fontFamily)).toContain('Inter Variable');
  expect(await page.locator('h1').evaluate(node => getComputedStyle(node).fontFamily)).toContain('Manrope Variable');
  expect(await page.evaluate(() => document.fonts.check('16px "Inter Variable"') && document.fonts.check('32px "Manrope Variable"'))).toBe(true);
  expect(externalRequests).toEqual([]);
});
