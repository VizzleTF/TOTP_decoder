const { test, expect } = require('@playwright/test');
const path = require('path');

const accounts = [
  { issuer: 'TestMigration1', account: 'user@example.com', secret: 'JBSWY3DPEHPK3PXP' },
  { issuer: 'TestMigration2', account: 'admin@test.com', secret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ' },
];

test.describe('Google Authenticator export QR code', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page
      .locator('input[type="file"]')
      .setInputFiles(path.join(__dirname, '..', 'test-migration-qr.png'));
  });

  test('lists every account with a six-digit code', async ({ page }) => {
    const codes = page.getByTitle('Copy code');
    await expect(codes).toHaveCount(accounts.length);
    for (let i = 0; i < accounts.length; i++) {
      await expect(codes.nth(i)).toHaveText(/^\d{3} \d{3}$/);
      await expect(page.getByText(accounts[i].issuer, { exact: true })).toBeVisible();
      await expect(page.getByText(accounts[i].account, { exact: true })).toBeVisible();
      await expect(page.getByTitle('Copy secret').nth(i)).toContainText(accounts[i].secret);
    }
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  // The export format has no period field, so the decoder applies the default
  test('gives every account the default 30s period and a standard algorithm name', async ({ page }) => {
    const urls = page.getByTitle('Copy URL');
    await expect(urls).toHaveCount(accounts.length);
    for (let i = 0; i < accounts.length; i++) {
      await expect(urls.nth(i)).toContainText('period=30');
      await expect(urls.nth(i)).toContainText('algorithm=SHA1&');
    }
  });

  test('labels the result as an export QR code', async ({ page }) => {
    await expect(page.locator('#root').getByText(/Export QR code/)).toBeVisible();
  });
});
