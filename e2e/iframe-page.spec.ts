import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

test.describe('iframe 页面承载', () => {
  test('登录后进入 iframe 菜单，页面会承载同源 iframe 并应用 same-origin 安全档', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.getByTestId('menu-item').locator('[data-menu-path="/mock-demo/mock-demo-iframe"]').first().click();

    await expect(page).toHaveURL(/#\/mock-demo\/mock-demo-iframe$/);

    const iframe = page.locator('iframe.webview-iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('data-security-profile', 'same-origin');
    await expect(iframe).toHaveAttribute('sandbox', /allow-same-origin/);
    await expect(iframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    const frame = page.frameLocator('iframe.webview-iframe');
    await expect(frame.getByTestId('mock-iframe-title')).toContainText('Mock Iframe Content');
    await expect(frame.getByTestId('mock-iframe-badge')).toContainText('iframe-ready');
  });
});
