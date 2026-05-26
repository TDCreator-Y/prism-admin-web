import { test, expect } from '@playwright/test';
import { gotoLogin, loginAsAdmin } from './fixtures';

test.describe('登录与首页', () => {
  test('错误凭据会提示，正确登录后进入首页并打登录后刷新标记', async ({ page }) => {
    await gotoLogin(page);

    await page.getByTestId('login-username').fill('admin');
    await page.getByTestId('login-password').fill('wrong-password');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toContainText('演示账号：admin / admin123');

    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('app-layout')).toBeVisible();
    await expect(page).toHaveURL(/#\/home$/);
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByTestId('home-hero')).toContainText('欢迎使用 Dashboard LightWeight');

    await expect
      .poll(() => page.evaluate(() => window.uiGlobalConfig?.IsAuthenticated === true))
      .toBe(true);

    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem('need_reload_after_login')))
      .toBe('true');
  });

  test('未登录访问受限首页会跳到登录页', async ({ page }) => {
    await page.goto('/#/home');
    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByTestId('login-page')).toBeVisible();
  });

  test('登录后访问首页会生成首页标签与面包屑', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByTestId('tabs-bar')).toBeVisible();
    await expect(page.getByTestId('tab-item').locator('[data-tab-path="/home"]')).toBeVisible();
    await expect(page.getByTestId('breadcrumb')).toContainText('首页');
  });
});
