# Тестовые QR-коды

Файлы в `test/` — QR-коды с известными параметрами для ручной и автоматической проверки декодера. Все секреты публичные: не подключайте их к настоящим аккаунтам.

## QR-коды `otpauth://`

У всех четырёх алгоритм SHA1 и 6 знаков.

| Файл | Издатель | Аккаунт | Период, с | Секрет |
|---|---|---|---|---|
| `test-qr-15s.png` | TestService3 | admin@company.com | 15 | `GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ` |
| `test-qr-30s.png` | TestService1 | user@example.com | 30 | `JBSWY3DPEHPK3PXP` |
| `test-qr-60s.png` | TestService2 | user@test.com | 60 | `HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ` |
| `test-qr-120s.png` | TestService4 | dev@startup.io | 120 | `MFRGG2LTMFZGK4TFOQ` |

## QR-код экспорта

`test-migration-qr.png` содержит два аккаунта в формате `otpauth-migration://`. У обоих алгоритм SHA1 и 6 знаков. Период — 30 секунд: в protobuf-схеме экспорта нет поля периода, и декодер подставляет значение по умолчанию.

| Издатель | Аккаунт | Секрет |
|---|---|---|
| TestMigration1 | user@example.com | `JBSWY3DPEHPK3PXP` |
| TestMigration2 | admin@test.com | `HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ` |

## Ручная проверка

1. Из корня репозитория запустите `npm install`, затем `npm run dev`.
2. Откройте http://localhost:3000 и перетащите файл в область загрузки.
3. Сравните издателя, аккаунт и секрет в карточке с таблицей. Период виден в параметре `period=` ссылки `otpauth://` и в обратном отсчёте.

## Автоматические тесты

Тесты Playwright загружают каждый файл и сверяют карточки с таблицами выше. Сервер разработки они запускают сами.

```bash
cd test
npm install
npx playwright install   # один раз: скачивает Chromium, Firefox и WebKit
npm test
```

## Генерация файлов

Скрипты перезаписывают PNG-файлы в `test/`:

```bash
cd test
node generate-test-qr.js        # test-qr-15s.png, -30s, -60s, -120s
node generate-migration-qr.js   # test-migration-qr.png
```
