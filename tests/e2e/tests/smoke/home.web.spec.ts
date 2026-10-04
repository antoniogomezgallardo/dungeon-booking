import { expect, test } from '@playwright/test';

test.describe('Home page', { tag: '@smoke' }, () => {
  test('loads and shows the API as reachable', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('app-title')).toHaveText('Dungeon Booking');
    await expect(page.getByTestId('api-status')).toHaveAttribute('data-status', 'ok');
  });
});
