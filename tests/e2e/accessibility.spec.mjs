import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers.mjs';
import AxeBuilder from '@axe-core/playwright';

async function audit(page, label) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), label).toEqual([]);
}
for (const theme of ['light', 'dark']) {
  test(`WCAG checks across the learning workspaces in ${theme} mode`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.addInitScript(theme => localStorage.setItem('theme', theme), theme);
    await gotoHome(page);
    await page.getByRole('searchbox', { name: /Search elements/ }).fill('Carbon');
    await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
    await page.getByRole('searchbox', { name: /Search elements/ }).clear();
    await audit(page, `${theme} periodic table`);
    await page.getByRole('button', { name: 'Element cards view' }).click();
    await audit(page, `${theme} element cards`);
    await page.getByRole('button', { name: /Atomic number 6\b.*Carbon/ }).click();
    await expect(page.getByRole('dialog', { name: 'Carbon', exact: true })).toBeVisible();
    for (const label of ['Overview', 'Structure', 'Physical & Energy', 'Context & Mnemonic']) {
      const tab = page.getByRole('dialog').getByRole('tab', { name: new RegExp(label, 'i') });
      await tab.click();
      if (label === 'Context & Mnemonic') await page.getByRole('button', { name: 'Show', exact: true }).click();
      await audit(page, `${theme} element ${label}`);
    }
    await page.keyboard.press('Escape');
    await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
    for (const label of ['Equation Balancer', 'Molar Mass Calculator', 'Solubility Table', 'Virtual 3D Atom Showcase']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      if (label === 'Molar Mass Calculator') await page.getByRole('button', { name: 'Calculate Mass', exact: true }).click();
      if (label === 'Solubility Table') await page.getByRole('button', { name: 'Ag⁺ and Cl⁻: Insoluble', exact: true }).click();
      await audit(page, `${theme} ${label}`);
    }
    await page.getByRole('tab', { name: 'Worksheet Generator', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Generate Worksheet', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Show Answer Key', exact: true }).click();
    await audit(page, `${theme} worksheet`);
  });
}
