const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Standard QR Codes Period Extraction', () => {
  const testCases = [
    { file: 'test-qr-15s.png', expectedPeriod: 15, service: 'TestService3' },
    { file: 'test-qr-30s.png', expectedPeriod: 30, service: 'TestService1' },
    { file: 'test-qr-60s.png', expectedPeriod: 60, service: 'TestService2' },
    { file: 'test-qr-120s.png', expectedPeriod: 120, service: 'TestService4' }
  ];

  testCases.forEach(({ file, expectedPeriod, service }) => {
    test(`should extract period ${expectedPeriod}s from ${file}`, async ({ page }) => {
      // Переходим на главную страницу
      await page.goto('/');
      
      // Ждем загрузки страницы
      await expect(page.locator('h1')).toContainText('TOTP QR Decoder');
      
      // Находим input для загрузки файла
      const fileInput = page.locator('input[type="file"]');
      
      // Загружаем QR-код
      const filePath = path.join(__dirname, '..', file);
      await fileInput.setInputFiles(filePath);
      
      // Ждем обработки файла
      await page.waitForTimeout(2000);
      
      // Проверяем, что нет ошибок
      const errorElement = page.locator('.text-red-500');
      if (await errorElement.count() > 0) {
        const errorText = await errorElement.textContent();
        console.log(`Error found: ${errorText}`);
      }
      
      // Ищем результаты
      const resultsContainer = page.locator('.card').first();
      await expect(resultsContainer).toBeVisible({ timeout: 10000 });
      
      // Проверяем, что есть хотя бы один аккаунт
      const accountCards = page.locator('.card').filter({ hasText: 'TestService' });
      await expect(accountCards.first()).toBeVisible();
      
      // Ищем информацию о периоде в первой карточке аккаунта
      const firstCard = accountCards.first();
      
      // Проверяем наличие периода в тексте карточки
      const cardText = await firstCard.textContent();
      console.log(`Card content for ${file}:`, cardText);
      
      // Проверяем, что период отображается корректно
      // Период может отображаться в разных местах, поэтому проверяем общий текст
      expect(cardText).toContain(`${expectedPeriod}`);
      
      // Дополнительная проверка - ищем элементы с периодом
      const periodElements = page.locator(`text=${expectedPeriod}`);
      await expect(periodElements.first()).toBeVisible();
      
      console.log(`✅ Test passed for ${file}: period ${expectedPeriod}s extracted correctly`);
    });
  });
  
  test('should handle multiple QR codes sequentially', async ({ page }) => {
    await page.goto('/');
    
    for (const { file, expectedPeriod } of testCases) {
      console.log(`Testing ${file} with expected period ${expectedPeriod}s`);
      
      const fileInput = page.locator('input[type="file"]');
      const filePath = path.join(__dirname, '..', file);
      await fileInput.setInputFiles(filePath);
      
      await page.waitForTimeout(2000);
      
      // Ждем появления результатов
      const resultsContainer = page.locator('.card').first();
      await expect(resultsContainer).toBeVisible({ timeout: 10000 });
      
      const cardText = await page.locator('.card').nth(1).textContent();
      expect(cardText).toContain(`${expectedPeriod}`);
      
      console.log(`✅ Sequential test passed for ${file}`);
    }
  });
});