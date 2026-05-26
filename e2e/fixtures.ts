import { expect, type Page } from '@playwright/test';

export async function gotoLogin(page: Page): Promise<void> {
  await page.goto('/#/login');
  await expect(page.getByTestId('login-page')).toBeVisible();
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await gotoLogin(page);
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('app-layout')).toBeVisible();
  await expect(page).toHaveURL(/#\/home$/);
  await expect(page.getByTestId('home-page')).toBeVisible();
}

export async function openMenuByPath(page: Page, path: string): Promise<void> {
  await page.getByTestId('menu-item').locator(`[data-menu-path="${path}"]`).first().click();
}
