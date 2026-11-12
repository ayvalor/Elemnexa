import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers.mjs';

test('Elemnexa identity, keyboard search, view switch, discovery, and navigation', async ({ page }) => {
  await gotoHome(page);
  await expect(page).toHaveTitle('Elemnexa — Explore elements. Understand chemistry.');
  await expect(page.locator('.brand-title')).toHaveText('Elemnexa');
  const origin = process.env.SITE_URL || 'https://elemnexa.vercel.app';
  const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
  expect(new URL(canonical).href).toBe(new URL(origin).href);
  const search = page.getByRole('searchbox', { name: /Search elements/ });
  await search.fill('Carbon');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(search).toBeFocused();
  await page.locator('h1').click();
  await page.keyboard.press('/');
  await expect(search).toBeFocused();
  await page.getByRole('button', { name: 'Element cards view' }).click();
  await expect(page.locator('.element-preview:visible')).toHaveCount(118);
  await search.fill('Ne');
  await page.getByRole('button', { name: 'Periodic table view' }).click();
  await expect(page.locator('.element-preview:visible')).toHaveCount(0);
  await expect(page.locator('.element-card:visible')).toHaveCount(118);
  await expect(search).toHaveValue('Ne');
  await page.getByRole('button', { name: 'Surprise me' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Surprise me' })).toBeFocused();
  await page.getByRole('button', { name: 'Open the lab', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Chemistry Suite', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('textbox', { name: 'Chemical equation' })).toBeVisible();
});

test('brand assets, manifest, robots, and friendly missing page are served', async ({ page, request }) => {
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  const data = await manifest.json();
  expect(data.name).toBe('Elemnexa');
  for (const icon of data.icons) expect((await request.get(icon.src)).ok()).toBe(true);
  expect(data.icons).toContainEqual({ src: '/elemnexa-mark.png', sizes: '512x512', type: 'image/png', purpose: 'any' });
  const origin = new URL(process.env.SITE_URL || 'https://elemnexa.vercel.app').origin;
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain(`<loc>${origin}</loc>`);
  expect((await request.get('/elemnexa-social.png')).ok()).toBe(true);
  await gotoHome(page);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${origin}/elemnexa-social.png`);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', `${origin}/elemnexa-social.png`);
  for (const link of await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').all()) {
    expect((await request.get(await link.getAttribute('href'))).ok()).toBe(true);
  }
  const logo = page.locator('img.brand-mark');
  await logo.scrollIntoViewIfNeeded();
  await expect(logo).toHaveAttribute('alt', '');
  await expect(logo).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => logo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(await logo.evaluate(image => image.currentSrc)).toContain('elemnexa-mark.png');
  await page.goto('/undiscovered-page');
  await expect(page.getByRole('heading', { name: 'An undiscovered corner.' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore the elements' }).click();
  await expect(page.locator('.brand-title')).toHaveText('Elemnexa');
});
