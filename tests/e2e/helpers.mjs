import { expect } from '@playwright/test';

export async function gotoHome(page) {
  const response = await page.goto('/');
  // SSR uses the desktop snapshot. On mobile, the automatic card-view update
  // confirms hydration before tests send input to the server-rendered controls.
  if (page.viewportSize().width < 768) {
    await expect(page.getByRole('button', { name: 'Element cards view' })).toHaveAttribute('aria-pressed', 'true');
  }
  return response;
}
