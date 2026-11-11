import { test, expect } from '@playwright/test';

test('enriched details show scientific qualifications and readable history on mobile', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: /Search elements/ });
  await search.fill('Oganesson');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  await page.getByRole('button', { name: /Atomic number 118\b.*Oganesson/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Oganesson', exact: true });
  const tabs = dialog.getByRole('tablist', { name: 'Element details' });
  const panel = dialog.getByRole('tabpanel');
  for (const [tab, expected] of [
    ['Structure', 'No established common chemical ions'],
    ['Physical & Energy', 'Bulk melting point has not been measured'],
    ['Context & Mnemonic', 'nuclear physicist Yuri Oganessian'],
  ]) {
    await tabs.getByRole('tab', { name: tab, exact: true }).click();
    await expect(panel).toContainText(expected);
    await expect(panel).not.toContainText('Not compiled');
    expect(await panel.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  }
  await expect(panel).toContainText('2002');
  await expect(panel.getByRole('link', { name: /Periodica discovery reference/ })).toHaveAttribute('href', /07fb9e3138475b093a76a189c30aefcc10e8d8e0/);
});

test('element detail tabs fit and reference notes scroll with the content', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: /Search elements/ });
  await search.fill('Oganesson');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  await page.getByRole('button', { name: /Atomic number 118\b.*Oganesson/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Oganesson', exact: true });
  const tabs = dialog.getByRole('tablist', { name: 'Element details' });
  const tabMeasurements = await tabs.getByRole('tab').evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    const container = node.parentElement.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(node);
    const text = range.getBoundingClientRect();
    return {
      height: rect.height,
      border: getComputedStyle(node).borderTopWidth,
      fits: rect.left >= container.left && rect.right <= container.right && text.left >= rect.left && text.right <= rect.right && text.bottom <= rect.bottom,
    };
  }));
  expect(tabMeasurements).toHaveLength(4);
  for (const tab of tabMeasurements) {
    expect(tab.height).toBeGreaterThanOrEqual(44);
    expect(tab.border).toBe('1px');
    expect(tab.fits).toBe(true);
  }
  const panel = dialog.getByRole('tabpanel');
  const sources = dialog.getByRole('region', { name: 'Sources & notes' });
  expect(await sources.evaluate(node => node.closest('[role="tabpanel"]') !== null)).toBe(true);
  const initialY = await sources.evaluate(node => node.getBoundingClientRect().top);
  await panel.evaluate(node => { node.scrollTop = node.scrollHeight; });
  expect(await sources.evaluate(node => node.getBoundingClientRect().top)).toBeLessThan(initialY - 40);
  await sources.getByRole('heading', { name: 'Sources & notes' }).scrollIntoViewIfNeeded();
  await expect(sources.getByRole('heading', { name: 'Sources & notes' })).toBeInViewport();
  const sourceLinks = sources.getByRole('link');
  expect(await sourceLinks.count()).toBeGreaterThan(0);
  for (const link of await sourceLinks.all()) {
    await expect(link).toHaveAttribute('href', /^https:\/\//);
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await tabs.getByRole('tab', { name: 'Context & Mnemonic', exact: true }).click();
  expect(await panel.evaluate(node => node.scrollTop)).toBe(0);
  expect(await panel.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  await tabs.getByRole('tab', { name: 'Context & Mnemonic', exact: true }).focus();
  await page.keyboard.press('Home');
  await expect(tabs.getByRole('tab', { name: 'Overview', exact: true })).toBeFocused();
  await page.keyboard.press('End');
  await expect(tabs.getByRole('tab', { name: 'Context & Mnemonic', exact: true })).toBeFocused();
});
