import { test, expect } from '@playwright/test';
import { loginAsAdmin, openMenuByPath } from './fixtures';

test.describe('菜单与标签页', () => {
  test('登录后切换到 UMD 页面会更新菜单、标签与面包屑', async ({ page }) => {
    await loginAsAdmin(page);

    await openMenuByPath(page, '/dashboard');

    await expect(page).toHaveURL(/#\/dashboard$/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('tab-item').locator('[data-tab-path="/dashboard"]')).toBeVisible();
    await expect(page.getByTestId('breadcrumb')).toContainText('UMD文件配置页面');
  });

  test('关闭其它标签会保留目标标签与首页标签', async ({ page }) => {
    await loginAsAdmin(page);
    await openMenuByPath(page, '/dashboard');

    const dashboardTab = page.getByTestId('tab-item').locator('[data-tab-path="/dashboard"]').first();
    await dashboardTab.click({ button: 'right' });

    await expect(page.getByTestId('tab-context-menu')).toBeVisible();
    await page.getByTestId('tab-context-close-other').click();

    await expect(page.getByTestId('tab-item')).toHaveCount(2);
    await expect(page.getByTestId('tab-item').locator('[data-tab-path="/home"]')).toBeVisible();
    await expect(page.getByTestId('tab-item').locator('[data-tab-path="/dashboard"]')).toBeVisible();
  });
});
