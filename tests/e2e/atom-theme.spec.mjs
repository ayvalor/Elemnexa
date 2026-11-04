import { test, expect } from '@playwright/test';

async function openAtom(page) {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: /Search elements/ });
  await search.fill('Hydrogen');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  await page.getByRole('tab', { name: 'Chemistry Suite', exact: true }).click();
  await page.getByRole('button', { name: 'Virtual 3D Atom Showcase', exact: true }).click();
  await page.locator('.atom-canvas').scrollIntoViewIfNeeded();
}

async function paintedFrame(canvas) {
  return canvas.evaluate(node => {
    const pixels = node.getContext('2d').getImageData(0, 0, node.width, node.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 32) ? node.toDataURL() : null;
  });
}

test('paused atom stage and particles follow light, dark, and light theme switches', async ({ page }) => {
  await openAtom(page);
  const stage = page.locator('.atom-stage');
  const canvas = page.locator('.atom-canvas');
  await expect.poll(() => paintedFrame(canvas)).not.toBeNull();
  const lightFrame = await paintedFrame(canvas);
  const lightBackground = await stage.evaluate(node => getComputedStyle(node).backgroundImage);
  expect(lightBackground).toContain('rgb(255, 255, 255)');

  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(() => paintedFrame(canvas)).not.toBe(lightFrame);
  await expect(stage).toHaveCSS('color', 'rgb(241, 245, 249)');
  expect(await stage.evaluate(node => getComputedStyle(node).backgroundImage)).not.toBe(lightBackground);
  await expect(page.getByRole('button', { name: 'Play atom animation', exact: true })).toHaveAttribute('aria-pressed', 'false');

  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(() => paintedFrame(canvas)).toBe(lightFrame);
  expect(await stage.evaluate(node => getComputedStyle(node).backgroundImage)).toBe(lightBackground);
});

test('mass number, atomic number, charge, and long element names fit the atom header', async ({ page }) => {
  await openAtom(page);
  await page.getByRole('combobox', { name: 'Select predefined atom' }).selectOption('118');
  await expect(page.locator('.atom-mass-number')).toHaveText('294');
  await expect(page.locator('.atom-atomic-number')).toHaveText('118');
  await expect(page.locator('.atom-nuclide')).toHaveAccessibleName('Oganesson-294, atomic number 118, neutral');
  await page.getByRole('button', { name: 'Decrease electrons', exact: true }).click();
  await expect(page.locator('.atom-charge')).toHaveText('+');

  for (const element of ['118', '104', '59']) {
    await page.getByRole('combobox', { name: 'Select predefined atom' }).selectOption(element);
    await page.getByRole('button', { name: 'Decrease electrons', exact: true }).click();
    const header = page.locator('.atom-stage-heading');
    await header.scrollIntoViewIfNeeded();
    expect(await header.evaluate(node => {
      const box = node.getBoundingClientRect();
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let text;
      while ((text = walker.nextNode())) {
        if (!text.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(text);
        for (const rect of range.getClientRects()) {
          if (rect.width && (rect.left < box.left - 1 || rect.right > box.right + 1 || rect.top < box.top - 1 || rect.bottom > box.bottom + 1)) return false;
        }
      }
      return node.scrollWidth <= node.clientWidth + 1;
    }), `Element ${element} must not clip its isotope notation or labels`).toBe(true);
  }
  for (const row of await page.locator('.atom-particle-row').all()) {
    expect(await row.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    for (const button of await row.getByRole('button').all()) {
      const box = await button.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});
