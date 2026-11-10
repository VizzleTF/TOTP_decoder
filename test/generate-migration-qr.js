const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');

// Base32 encoding/decoding functions
function base32ToBytes(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output = [];

  for (const char of base32) {
    // Keep only the bits not yet written, so value never overflows 32 bits
    value = ((value & ((1 << bits) - 1)) << 5) | alphabet.indexOf(char);
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return new Uint8Array(output);
}

// Google Authenticator Migration Protocol Buffer Schema
const migrationProtoSchema = {
  "nested": {
    "MigrationPayload": {
      "fields": {
        "otpParameters": {
          "rule": "repeated",
          "type": "OtpParameters",
          "id": 1
        },
        "version": {
          "type": "int32",
          "id": 2
        },
        "batchSize": {
          "type": "int32",
          "id": 3
        },
        "batchIndex": {
          "type": "int32",
          "id": 4
        },
        "batchId": {
          "type": "int32",
          "id": 5
        }
      }
    },
    "OtpParameters": {
      "fields": {
        "secret": {
          "type": "bytes",
          "id": 1
        },
        "name": {
          "type": "string",
          "id": 2
        },
        "issuer": {
          "type": "string",
          "id": 3
        },
        "algorithm": {
          "type": "Algorithm",
          "id": 4
        },
        "digits": {
          "type": "DigitCount",
          "id": 5
        },
        "type": {
          "type": "OtpType",
          "id": 6
        },
        "counter": {
          "type": "int64",
          "id": 7
        }
      }
    },
    "Algorithm": {
      "values": {
        "ALGORITHM_TYPE_UNSPECIFIED": 0,
        "SHA1": 1,
        "SHA256": 2,
        "SHA512": 3,
        "MD5": 4
      }
    },
    "DigitCount": {
      "values": {
        "DIGIT_COUNT_UNSPECIFIED": 0,
        "SIX": 1,
        "EIGHT": 2
      }
    },
    "OtpType": {
      "values": {
        "OTP_TYPE_UNSPECIFIED": 0,
        "HOTP": 1,
        "TOTP": 2
      }
    }
  }
};

// Создание правильного protobuf сообщения для тестирования
function createTestMigrationData() {
  console.log('⚠️  ВАЖНОЕ ПРИМЕЧАНИЕ:');
  console.log('Протокол миграции Google Authenticator НЕ включает поле period в protobuf схеме.');
  console.log('Поэтому все мигрированные аккаунты будут иметь период по умолчанию 30 секунд.');
  console.log('Это ограничение самого протокола, а не нашего приложения.\n');

  // Создаем protobuf root и загружаем схему
  const root = protobuf.Root.fromJSON(migrationProtoSchema);
  const MigrationPayload = root.lookupType('MigrationPayload');

  // Тестовые данные для миграции
  const testAccounts = [
    {
      secret: base32ToBytes('JBSWY3DPEHPK3PXP'),
      name: 'user@example.com',
      issuer: 'TestMigration1',
      algorithm: 1, // SHA1
      digits: 1,    // SIX (6 digits)
      type: 2       // TOTP
    },
    {
      secret: base32ToBytes('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'),
      name: 'admin@test.com', 
      issuer: 'TestMigration2',
      algorithm: 1, // SHA1
      digits: 1,    // SIX (6 digits)  
      type: 2       // TOTP
    }
  ];

  // Создаем payload
  const payload = {
    otpParameters: testAccounts,
    version: 1,
    batchSize: testAccounts.length,
    batchIndex: 0,
    batchId: 0
  };

  // Кодируем в protobuf
  const message = MigrationPayload.create(payload);
  const buffer = MigrationPayload.encode(message).finish();
  
  // Конвертируем в base64
  const base64Data = Buffer.from(buffer).toString('base64');
  
  return base64Data;
}

async function generateMigrationQR() {
  console.log('Генерация тестового миграционного QR-кода...\n');
  
  const migrationData = createTestMigrationData();
  const migrationUrl = `otpauth-migration://offline?data=${migrationData}`;
  
  console.log('Миграционный URL:');
  console.log(migrationUrl);
  console.log();
  
  try {
    const qrCodePath = path.join(__dirname, 'test-migration-qr.png');
    await QRCode.toFile(qrCodePath, migrationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log(`✅ Миграционный QR-код сохранен: ${qrCodePath}`);
  } catch (error) {
    console.error(`❌ Ошибка генерации QR-кода: ${error.message}`);
  }
  
  console.log('\n📋 Инструкция по тестированию:');
  console.log('1. Откройте приложение TOTP Decoder');
  console.log('2. Загрузите test-migration-qr.png');
  console.log('3. Обратите внимание, что все аккаунты будут иметь период 30с');
  console.log('4. Сравните с обычными QR-кодами (test-qr-*.png), где период извлекается корректно');
  
  console.log('\n🔍 Ожидаемое поведение:');
  console.log('- Миграционный QR: все аккаунты с периодом 30с (ограничение протокола)');
  console.log('- Обычные QR: период извлекается из URL (15с, 30с, 60с, 120с)');
}

generateMigrationQR().catch(console.error);