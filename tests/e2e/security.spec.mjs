import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers.mjs';

test('browser policy blocks inline handlers and production external connections while app controls work', async ({ page }) => {
  const response = await gotoHome(page);
  const policy = response.headers()['content-security-policy'];
  expect(policy).toContain("script-src-attr 'none'");
  const restrictConnections = policy.includes("connect-src 'self'");
  if (process.env.PLAYWRIGHT_TEST_PRODUCTION === '1') expect(restrictConnections).toBe(true);
  let externalRequestReachedNetwork = false;
  await page.route('https://blocked.example.invalid/**', route => {
    externalRequestReachedNetwork = true;
    return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, body: 'unexpected external request' });
  });
  const result = await page.evaluate(async restrictConnections => {
    window.__policyViolations = [];
    document.addEventListener('securitypolicyviolation', event => window.__policyViolations.push(event.effectiveDirective));
    window.__inlineHandlerRan = false;
    const button = document.createElement('button');
    button.setAttribute('onclick', 'window.__inlineHandlerRan = true');
    document.body.append(button);
    button.click();
    button.remove();
    const manifest = await fetch('/manifest.webmanifest').then(response => response.json());
    let externalBlocked = false;
    if (restrictConnections) {
      try { await fetch('https://blocked.example.invalid/check'); }
      catch { externalBlocked = true; }
    }
    return { inlineHandlerRan: window.__inlineHandlerRan, manifestName: manifest.name, externalBlocked };
  }, restrictConnections);
  expect(result.inlineHandlerRan).toBe(false);
  expect(result.manifestName).toBe('Elemnexa');
  await expect.poll(() => page.evaluate(() => window.__policyViolations)).toContain('script-src-attr');
  if (restrictConnections) {
    expect(result.externalBlocked).toBe(true);
    await expect.poll(() => page.evaluate(() => window.__policyViolations)).toContain('connect-src');
    expect(externalRequestReachedNetwork).toBe(false);
  }
  await page.getByRole('searchbox').fill('Carbon');
  await expect(page.getByRole('status')).toHaveText('1 of 118 elements');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
