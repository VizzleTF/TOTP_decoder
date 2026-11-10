const { test, expect } = require('@playwright/test');
const path = require('path');

const fixtures = [
  { file: 'test-qr-15s.png', issuer: 'TestService3', account: 'admin@company.com', period: 15, secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ' },
  { file: 'test-qr-30s.png', issuer: 'TestService1', account: 'user@example.com', period: 30, secret: 'JBSWY3DPEHPK3PXP' },
  { file: 'test-qr-60s.png', issuer: 'TestService2', account: 'user@test.com', period: 60, secret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ' },
  { file: 'test-qr-120s.png', issuer: 'TestService4', account: 'dev@startup.io', period: 120, secret: 'MFRGG2LTMFZGK4TFOQ' },
];

const upload = (page, file) =>
  page.locator('input[type="file"]').setInputFiles(path.join(__dirname, '..', file));

// A synthetic event with a stubbed clipboardData works in all three engines
const paste = async (page, text) => {
  // The paste listener is registered when the app mounts, together with the file input
  await page.locator('input[type="file"]').waitFor({ state: 'attached' });
  await page.evaluate((value) => {
    const event = new Event('paste', { bubbles: true });
    Object.defineProperty(event, 'clipboardData', {
      value: { items: [], getData: () => value },
    });
    document.dispatchEvent(event);
  }, text);
};

async function expectAccount(page, { issuer, account, period, secret }) {
  await expect(page.getByTitle('Copy code')).toHaveText(/^\d{3} \d{3}$/);
  await expect(page.getByText(issuer, { exact: true })).toBeVisible();
  await expect(page.getByText(account, { exact: true })).toBeVisible();
  await expect(page.getByTitle('Copy secret')).toContainText(secret);
  await expect(page.getByTitle('Copy URL')).toContainText(`period=${period}`);
  await expect(page.getByRole('alert')).toHaveCount(0);
}

test.describe('otpauth:// QR codes', () => {
  for (const fixture of fixtures) {
    test(`${fixture.file} decodes with a ${fixture.period}s period`, async ({ page }) => {
      await page.goto('/');
      await upload(page, fixture.file);
      await expectAccount(page, fixture);
    });
  }

  test('a new upload replaces the previous result', async ({ page }) => {
    await page.goto('/');
    for (const fixture of fixtures) {
      await upload(page, fixture.file);
      await expectAccount(page, fixture);
    }
  });

  test('a pasted otpauth:// URL decodes', async ({ page }) => {
    await page.goto('/');
    await paste(page, 'otpauth://totp/Pasted:me@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Pasted&period=60');
    await expectAccount(page, { issuer: 'Pasted', account: 'me@example.com', period: 60, secret: 'JBSWY3DPEHPK3PXP' });
  });

  test('a secret that is not Base32 shows an error instead of a code', async ({ page }) => {
    await page.goto('/');
    await paste(page, 'otpauth://totp/Bad:me@example.com?secret=INVALID1890');
    await expect(page.getByRole('alert')).toContainText('not valid Base32');
    await expect(page.getByTitle('Copy code')).toHaveCount(0);
  });

  test('an image without a QR code shows an error', async ({ page }) => {
    await page.goto('/');
    await upload(page, '../web/public/logo192.png');
    await expect(page.getByRole('alert')).toContainText('No QR code found in the image');
    await expect(page.getByTitle('Copy code')).toHaveCount(0);
  });
});
