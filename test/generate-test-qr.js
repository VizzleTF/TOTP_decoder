const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Функция для генерации otpauth URL с разными периодами
function generateOtpauthUrl(issuer, account, secret, period = 30) {
  const label = issuer ? `${issuer}:${account}` : account;
  const params = new URLSearchParams({
    secret: secret,
    issuer: issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: period.toString()
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

// Тестовые данные с разными периодами
const testAccounts = [
  {
    issuer: 'TestService1',
    account: 'user@example.com',
    secret: 'JBSWY3DPEHPK3PXP',
    period: 30
  },
  {
    issuer: 'TestService2', 
    account: 'user@test.com',
    secret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ',
    period: 60
  },
  {
    issuer: 'TestService3',
    account: 'admin@company.com', 
    secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
    period: 15
  },
  {
    issuer: 'TestService4',
    account: 'dev@startup.io',
    secret: 'MFRGG2LTMFZGK4TFOQ',
    period: 120
  }
];

async function generateQRCodes() {
  console.log('Генерация тестовых QR-кодов с разными периодами TOTP...');
  
  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    const otpauthUrl = generateOtpauthUrl(account.issuer, account.account, account.secret, account.period);
    
    console.log(`\n${i + 1}. ${account.issuer} (период: ${account.period}с)`);
    console.log(`   URL: ${otpauthUrl}`);
    
    try {
      const qrCodePath = path.join(__dirname, `test-qr-${account.period}s.png`);
      await QRCode.toFile(qrCodePath, otpauthUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log(`   QR-код сохранен: ${qrCodePath}`);
    } catch (error) {
      console.error(`   Ошибка генерации QR-кода: ${error.message}`);
    }
  }
  
  console.log('\n✅ Генерация завершена!');
  console.log('\nИнструкция по тестированию:');
  console.log('1. Откройте приложение TOTP Decoder в браузере');
  console.log('2. Перетащите сгенерированные PNG файлы в область загрузки');
  console.log('3. Проверьте, что период корректно отображается для каждого аккаунта');
  console.log('\nОжидаемые результаты:');
  testAccounts.forEach((account, i) => {
    console.log(`- ${account.issuer}: период ${account.period} секунд`);
  });
}

// Проверка наличия qrcode модуля
try {
  require.resolve('qrcode');
  generateQRCodes().catch(console.error);
} catch (error) {
  console.log('❌ Модуль qrcode не найден.');
  console.log('Установите его командой: npm install qrcode');
  console.log('\nАльтернативно, вы можете использовать онлайн генератор QR-кодов:');
  console.log('\nТестовые otpauth URL для ручной генерации:');
  
  testAccounts.forEach((account, i) => {
    const otpauthUrl = generateOtpauthUrl(account.issuer, account.account, account.secret, account.period);
    console.log(`\n${i + 1}. ${account.issuer} (период: ${account.period}с):`);
    console.log(`${otpauthUrl}`);
  });
}