// Export the generated artwork consistently; never redraw or recolor the mark.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { siteUrl } from '../lib/site-config.mjs';

const root = new URL('../', import.meta.url);
const file = path => fileURLToPath(new URL(path, root));
const png = { compressionLevel: 9, adaptiveFiltering: true };
const source = await readFile(file('assets/brand/elemnexa-logo-source.png'));
const artwork = await sharp(source).trim({ background: '#00000000', threshold: 10 }).png(png).toBuffer();

async function icon(size, markSize = size, opaque = false) {
  const mark = await sharp(artwork).resize(Math.round(markSize * .88), Math.round(markSize * .88), { fit: 'inside' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: opaque ? '#f7f9f8' : '#00000000' } })
    .composite([{ input: mark, gravity: 'centre' }]).png(png).toBuffer();
}

for (const [path, size, markSize, opaque] of [
  ['public/elemnexa-mark.png', 512, 512, false],
  ['public/icon-192.png', 192, 192, false],
  ['public/icon-maskable.png', 512, 360, true],
  ['app/icon.png', 96, 96, false],
  ['app/apple-icon.png', 180, 164, true],
]) await writeFile(file(path), await icon(size, markSize, opaque));

// ICO supports PNG frames; include small native sizes for older browser chrome.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(size => icon(size)));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (let i = 0; i < sizes.length; i++) {
  const entry = 6 + i * 16;
  header[entry] = header[entry + 1] = sizes[i];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frames[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frames[i].length;
}
await writeFile(file('app/favicon.ico'), Buffer.concat([header, ...frames]));

// Render the social card offline with the same locally bundled display font.
const font = await readFile(file('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2'));
const mark = await readFile(file('public/elemnexa-mark.png'));
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    @font-face { font-family: Brand; src: url(data:font/woff2;base64,${font.toString('base64')}) format('woff2'); font-weight: 200 800; }
    * { box-sizing: border-box; } body { margin: 0; width: 1200px; height: 630px; background: #f7f9f8; color: #142e34; font-family: Brand, sans-serif; }
    main { height: 100%; display: flex; align-items: center; gap: 38px; padding: 80px 76px 96px; border-bottom: 8px solid #17a8a4; }
    img { width: 280px; height: 280px; flex: none; }
    .eyebrow { color: #087f83; font-size: 14px; font-weight: 750; letter-spacing: 2px; margin: 0 0 22px; }
    h1 { font-size: 88px; line-height: 1.1; font-weight: 800; letter-spacing: -5px; margin: 0 0 24px; }
    .tagline { font-size: 27px; line-height: 1.6; letter-spacing: -.6px; margin: 0; color: #3c535c; }
    footer { position: absolute; left: 92px; right: 92px; bottom: 46px; display: flex; justify-content: space-between; color: #536a73; font-size: 15px; }
    footer strong { font-weight: 700; color: #7354bc; }
  </style></head><body><main><img alt="" src="data:image/png;base64,${mark.toString('base64')}"><div><p class="eyebrow">YOUR CURIOSITY. MEET CHEMISTRY.</p><h1>Elemnexa</h1><p class="tagline">Explore elements.<br>Understand chemistry.</p></div></main><footer><span>118 elements. A world of possibility.</span><strong>${new URL(siteUrl).host}</strong></footer></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('img').evaluate(image => image.decode());
  const screenshot = await page.screenshot();
  await sharp(screenshot).png(png).toFile(file('public/elemnexa-social.png'));
} finally {
  await browser.close();
}
console.log('Exported transparent marks, favicon, app icons, and social card.');
