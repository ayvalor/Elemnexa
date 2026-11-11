import { test as base, expect } from '@playwright/test';
import { elementsData } from '../../data/elements.js';

const test = base.extend({
  appErrors: [async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(errors);
    expect(errors).toEqual([]);
  }, { auto: true }],
});

async function openApp(page) {
  await page.goto('/');
  // The responsive view is applied after hydration. Wait for that client
  // update before filling a server-rendered input on mobile WebKit.
  if (page.viewportSize().width < 768) {
    await expect(page.getByRole('button', { name: 'Element cards view' })).toHaveAttribute('aria-pressed', 'true');
  }
  const search = page.getByRole('searchbox', { name: /Search elements/ });
  await search.fill('Hydrogen');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  await search.clear();
  await expect(page.getByRole('status')).toHaveText('118 of 118 elements');
  await page.evaluate(() => document.fonts.ready);
}

async function openAtom(page) {
  await openApp(page);
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  await page.getByRole('button', { name: 'Virtual 3D Atom Showcase', exact: true }).click();
  const canvas = page.locator('.atom-canvas');
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toBeVisible();
  return canvas;
}

async function pixelCoverage(canvas) {
  return canvas.evaluate(node => {
    const pixels = node.getContext('2d').getImageData(0, 0, node.width, node.height).data;
    let drawn = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 32) drawn++;
    return drawn / (node.width * node.height);
  });
}

// This checks each actual text run, not only the page width; clipped labels can
// otherwise pass a no-page-overflow test because their container scrolls.
async function textFits(locator) {
  return locator.evaluate(node => {
    const bounds = node.getBoundingClientRect();
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let text;
    while ((text = walker.nextNode())) {
      // Screen-reader-only descriptions are intentionally clipped, not visible labels.
      if (!text.textContent.trim() || text.parentElement.closest('.sr-only')) continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      for (const rect of range.getClientRects()) {
        if (rect.width && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1 || rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1)) return false;
      }
    }
    return node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 1;
  });
}

test('all four chemistry labels fit inside individually bordered controls', async ({ page }) => {
  await openApp(page);
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  const nav = page.locator('.suite-tool-tabs');
  await expect(nav).toBeVisible();
  expect(await nav.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  const bounds = await nav.boundingBox();
  for (const label of ['Equation Balancer', 'Molar Mass Calculator', 'Solubility Table', 'Virtual 3D Atom Showcase']) {
    const button = nav.getByRole('button', { name: label, exact: true });
    await expect(button).toBeVisible();
    expect(await textFits(button), label).toBe(true);
    const box = await button.boundingBox();
    expect(box.x, label).toBeGreaterThanOrEqual(bounds.x - 1);
    expect(box.x + box.width, label).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
    const border = await button.evaluate(node => {
      const style = getComputedStyle(node);
      return { width: parseFloat(style.borderTopWidth), color: style.borderTopColor, style: style.borderTopStyle };
    });
    expect(border.width).toBeGreaterThanOrEqual(.5);
    expect(border.width).toBeLessThanOrEqual(1.5);
    expect(border.style).toBe('solid');
    expect(border.color).not.toBe('rgba(0, 0, 0, 0)');
  }
});

test('element tiles retain readable, unclipped identities and hero cards open details', async ({ page }) => {
  await openApp(page);
  for (const number of [1, 23, 104, 118]) {
    const card = page.locator(`#panel-table button[data-element-number="${number}"]:visible`);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCount(1);
    expect(await textFits(card), `Element ${number}`).toBe(true);
    const box = await card.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    const symbol = card.locator('.element-symbol, .element-preview-symbol');
    expect(await symbol.evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(20);
  }
  const feature = page.getByRole('button', { name: /Explore.*Carbon/ });
  await feature.click();
  await expect(page.getByRole('dialog', { name: 'Carbon', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(feature).toBeFocused();
});

test('atom canvas is sharp, rendered, and responds to zoom and keyboard rotation', async ({ page }) => {
  const canvas = await openAtom(page);
  await expect.poll(() => pixelCoverage(canvas)).toBeGreaterThan(.005);
  const dimensions = await canvas.evaluate(node => ({ backing: node.width, css: node.getBoundingClientRect().width, ratio: Math.min(devicePixelRatio, 3) }));
  expect(dimensions.backing).toBeGreaterThanOrEqual(Math.floor(dimensions.css * dimensions.ratio) - 1);
  const before = await canvas.evaluate(node => node.toDataURL());
  await canvas.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => canvas.evaluate(node => node.toDataURL())).not.toBe(before);
  await page.keyboard.press('Home');
  await expect.poll(() => canvas.evaluate(node => node.toDataURL())).toBe(before);
  await page.getByRole('button', { name: 'Zoom in atom', exact: true }).click();
  await expect(page.getByLabel('Atom zoom', { exact: true })).toHaveText('110%');
  await page.getByRole('button', { name: 'Reset atom view', exact: true }).click();
  await expect(page.getByLabel('Atom zoom', { exact: true })).toHaveText('100%');
  await page.getByRole('button', { name: 'Shell diagram', exact: true }).click();
  await expect(canvas).toHaveAccessibleName(/Flat shell diagram/);
  await expect(page.getByRole('button', { name: 'Shell diagram', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('heavy atom counts agree across model, shell labels, and analysis; playback is real', async ({ page }) => {
  const canvas = await openAtom(page);
  const oganesson = elementsData.find(element => element.number === 118);
  await page.getByRole('combobox', { name: 'Select predefined atom' }).selectOption('118');
  await expect(canvas).toHaveAccessibleName(new RegExp(`118 protons, ${oganesson.neutrons} neutrons and 118 electrons`));
  await expect(page.getByRole('region', { name: 'Atom analysis' })).toContainText(`Oganesson-${oganesson.massNumber}`);
  const shells = page.locator('.atom-shells strong');
  await expect(shells).toHaveCount(7);
  const counts = await shells.allTextContents();
  expect(counts.map(value => parseInt(value, 10))).toEqual(oganesson.shellConfig.split(',').map(Number));
  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(() => pixelCoverage(canvas)).toBeGreaterThan(.005);
  await page.getByRole('button', { name: 'Play atom animation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause atom animation', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await canvas.scrollIntoViewIfNeeded();
  const moving = await canvas.evaluate(node => node.toDataURL());
  await expect.poll(() => canvas.evaluate(node => node.toDataURL())).not.toBe(moving);
  await page.getByRole('button', { name: 'Pause atom animation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play atom animation', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await canvas.scrollIntoViewIfNeeded();
  // Allow the final scheduled redraw to finish, then compare two frames.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const paused = await canvas.evaluate(node => node.toDataURL());
  await page.waitForTimeout(150);
  expect(await canvas.evaluate(node => node.toDataURL())).toBe(paused);
  await page.getByText('What does this model show?', { exact: true }).click();
  await expect(page.getByText(/Electrons occupy probability distributions/)).toBeVisible();
});
