import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const file = path => new URL(`../${path}`, import.meta.url);

test('transparent brand exports have correct dimensions and clear outer padding', async () => {
  for (const [path, size] of [['public/elemnexa-mark.png', 512], ['public/icon-192.png', 192], ['app/icon.png', 96]]) {
    const { data, info } = await sharp(await readFile(file(path))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, size);
    assert.equal(info.height, size);
    let visible = 0;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const alpha = data[(y * size + x) * 4 + 3];
      if (x === 0 || y === 0 || x === size - 1 || y === size - 1) assert.equal(alpha, 0);
      if (alpha > 128) visible++;
    }
    assert.ok(visible > size * size * .2 && visible < size * size * .7, `${path}: mark must be visible with transparent negative space`);
  }
});

test('maskable artwork stays inside the safe circle; Apple and social exports are opaque', async () => {
  const { data, info } = await sharp(await readFile(file('public/icon-maskable.png'))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 512);
  assert.equal(info.height, 512);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const offset = (y * 512 + x) * 4;
    assert.equal(data[offset + 3], 255);
    if (Math.hypot(x - 255.5, y - 255.5) > 512 * .4) assert.deepEqual([...data.subarray(offset, offset + 3)], [247, 249, 248]);
  }
  for (const [path, width, height] of [['app/apple-icon.png', 180, 180], ['public/elemnexa-social.png', 1200, 630]]) {
    const image = sharp(await readFile(file(path)));
    const metadata = await image.metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
    assert.equal((await image.stats()).isOpaque, true);
  }
});

test('favicon contains decodable 16, 32 and 48 pixel frames', async () => {
  const ico = await readFile(file('app/favicon.ico'));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    const metadata = await sharp(ico.subarray(offset, offset + length)).metadata();
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    assert.equal(metadata.hasAlpha, true);
  }
});
