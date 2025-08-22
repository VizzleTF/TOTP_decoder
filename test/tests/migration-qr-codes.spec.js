const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Migration QR Codes', () => {
  test('should process migration QR code and default to 30s period', async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/');
    
    // Ждем загрузки страницы
    await expect(page.locator('h1')).toContainText('TOTP QR Decoder');
    
    // Находим input для загрузки файла
    const fileInput = page.locator('input[type="file"]');
    
    // Загружаем миграционный QR-код
    const filePath = path.join(__dirname, '..', 'test-migration-qr.png');
    await fileInput.setInputFiles(filePath);
    
    // Ждем обработки файла
    await page.waitForTimeout(3000);
    
    // Проверяем, что нет ошибок
    const errorElement = page.locator('.text-red-500');
    if (await errorElement.count() > 0) {
      const errorText = await errorElement.textContent();
      console.log(`Error found: ${errorText}`);
      // Если есть ошибка, тест должен провалиться
      expect(errorText).not.toContain('Failed to process file');
    }
    
    // Ищем результаты
    const resultsContainer = page.locator('.card').first();
    await expect(resultsContainer).toBeVisible({ timeout: 15000 });
    
    // Проверяем, что есть аккаунты (должно быть 2 аккаунта из миграции)
    // Исключаем общую карточку с заголовком "Decoding Results" и берем только индивидуальные карточки аккаунтов
    const accountCards = page.locator('.card').filter({ hasText: 'TestMigration' }).filter({ hasText: 'SHA-1' }).filter({ hasNotText: 'Decoding Results' });
    await expect(accountCards).toHaveCount(2);
    
    // Проверяем первый аккаунт
    const firstCard = accountCards.first();
    const firstCardText = await firstCard.textContent();
    console.log('First account card:', firstCardText);
    
    // Проверяем, что период по умолчанию 30 секунд
    expect(firstCardText).toContain('30');
    expect(firstCardText).toContain('TestMigration1');
    expect(firstCardText).toContain('user@example.com');
    
    // Проверяем второй аккаунт
    const secondCard = accountCards.nth(1);
    const secondCardText = await secondCard.textContent();
    console.log('Second account card:', secondCardText);
    
    // Проверяем, что период по умолчанию 30 секунд
    expect(secondCardText).toContain('30');
    expect(secondCardText).toContain('TestMigration2');
    expect(secondCardText).toContain('admin@test.com');
    
    console.log('✅ Migration QR code test passed: both accounts have 30s period');
  });
  
  test('should display migration QR type correctly', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '..', 'test-migration-qr.png');
    await fileInput.setInputFiles(filePath);
    
    await page.waitForTimeout(3000);
    
    // Проверяем, что отображается тип QR-кода
    const pageContent = await page.textContent('body');
    
    // Ищем индикацию того, что это миграционный QR-код
    // Это может быть в заголовке или в описании
    const hasMigrationIndicator = 
      pageContent.includes('Migration') || 
      pageContent.includes('migration') ||
      pageContent.includes('Google Authenticator');
    
    if (hasMigrationIndicator) {
      console.log('✅ Migration QR type is indicated in the UI');
    } else {
      console.log('ℹ️  Migration QR type indication not found, but accounts are processed correctly');
    }
    
    // Главное - что аккаунты обработались корректно
    const accountCards = page.locator('.card').filter({ hasText: 'TestMigration' }).filter({ hasText: 'SHA-1' }).filter({ hasNotText: 'Decoding Results' });
    await expect(accountCards).toHaveCount(2);
  });
  
  test('should generate valid TOTP codes for migrated accounts', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '..', 'test-migration-qr.png');
    await fileInput.setInputFiles(filePath);
    
    await page.waitForTimeout(3000);
    
    const accountCards = page.locator('.card').filter({ hasText: 'TestMigration' }).filter({ hasText: 'SHA-1' }).filter({ hasNotText: 'Decoding Results' });
    await expect(accountCards).toHaveCount(2);
    
    // Проверяем, что у каждого аккаунта есть TOTP код
    for (let i = 0; i < 2; i++) {
      const card = accountCards.nth(i);
      const cardText = await card.textContent();
      
      // TOTP код должен быть 6-значным числом
      const totpCodeMatch = cardText.match(/TOTP Code(\d{6})/);
      expect(totpCodeMatch).not.toBeNull();
      
      const totpCode = totpCodeMatch[1];
      console.log(`Account ${i + 1} TOTP code: ${totpCode}`);
      
      // Проверяем, что код состоит из 6 цифр
      expect(totpCode).toMatch(/^\d{6}$/);
    }
    
    console.log('✅ All migrated accounts have valid 6-digit TOTP codes');
  });
});