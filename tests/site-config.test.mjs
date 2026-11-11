import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSiteUrl } from '../lib/site-config.mjs';
test('canonical origin configuration rejects credentials, unsafe schemes and paths', () => {
  assert.equal(parseSiteUrl(undefined), null);
  assert.equal(parseSiteUrl('https://example.com/'), 'https://example.com');
  for (const value of ['javascript:alert(1)', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com?test', 'https://example.com#test', 'not a URL']) assert.throws(() => parseSiteUrl(value));
});
