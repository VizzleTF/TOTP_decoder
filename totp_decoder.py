#!/usr/bin/env python3
"""
TOTP QR Code Decoder with Google Authenticator Migration Support

This script can decode both:
1. Standard TOTP QR codes (otpauth://totp/...)
2. Google Authenticator migration QR codes (otpauth-migration://offline?data=...)

Usage:
    python3 totp_decoder_migration.py <image_path>

Requirements:
    - opencv-python
    - pyotp
    - protobuf
"""

import sys
import os
import cv2
import pyotp
import base64
import urllib.parse
from typing import List, Dict, Optional, Tuple
import OtpMigration_pb2

class TOTPDecoderMigration:
    """TOTP QR Code Decoder with migration support"""
    
    def __init__(self):
        self.qr_detector = cv2.QRCodeDetector()
    
    def load_image(self, image_path: str) -> Optional[cv2.Mat]:
        """Загружает изображение из файла"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Файл не найден: {image_path}")
        
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Не удалось загрузить изображение: {image_path}")
        
        return image
    
    def decode_qr_code(self, image: cv2.Mat) -> Optional[str]:
        """Декодирует QR-код из изображения с помощью OpenCV"""
        # Преобразуем в оттенки серого для лучшего распознавания
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Применяем адаптивную бинаризацию
        binary = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Пробуем декодировать с разными изображениями
        for img in [gray, binary, image]:
            data, vertices_array, _ = self.qr_detector.detectAndDecode(img)
            if data:
                return data
        
        return None
    
    def parse_otpauth_url(self, url: str) -> Dict[str, str]:
        """Парсит стандартный otpauth:// URL"""
        if not url.startswith('otpauth://totp/'):
            raise ValueError(f"Неверный формат URL. Ожидается otpauth://totp/, получен: {url[:50]}...")
        
        # Парсим URL
        parsed = urllib.parse.urlparse(url)
        params = urllib.parse.parse_qs(parsed.query)
        
        # Извлекаем параметры
        secret = params.get('secret', [''])[0]
        issuer = params.get('issuer', [''])[0]
        algorithm = params.get('algorithm', ['SHA1'])[0]
        digits = int(params.get('digits', ['6'])[0])
        period = int(params.get('period', ['30'])[0])
        
        # Извлекаем имя аккаунта из пути
        path_parts = parsed.path.strip('/').split(':', 1)
        if len(path_parts) == 2:
            account_name = urllib.parse.unquote(path_parts[1])
        else:
            account_name = urllib.parse.unquote(path_parts[0])
        
        return {
            'secret': secret,
            'issuer': issuer,
            'account': account_name,
            'algorithm': algorithm,
            'digits': str(digits),
            'period': str(period)
        }
    
    def parse_migration_url(self, url: str) -> List[Dict[str, str]]:
        """Парсит Google Authenticator migration URL"""
        if not url.startswith('otpauth-migration://offline?data='):
            raise ValueError(f"Неверный формат migration URL. Ожидается otpauth-migration://offline?data=, получен: {url[:50]}...")
        
        # Извлекаем data параметр
        parsed = urllib.parse.urlparse(url)
        params = urllib.parse.parse_qs(parsed.query)
        data = params.get('data', [''])[0]
        
        if not data:
            raise ValueError("Отсутствует data параметр в migration URL")
        
        try:
            # URL decode
            decoded_data = urllib.parse.unquote(data)
            # Base64 decode
            protobuf_data = base64.b64decode(decoded_data)
            
            # Парсим protobuf
            migration_payload = OtpMigration_pb2.MigrationPayload()
            migration_payload.ParseFromString(protobuf_data)
            
            accounts = []
            for otp_param in migration_payload.otp_parameters:
                # Конвертируем алгоритм
                algorithm_map = {
                    OtpMigration_pb2.Algorithm.SHA1: 'SHA1',
                    OtpMigration_pb2.Algorithm.SHA256: 'SHA256',
                    OtpMigration_pb2.Algorithm.SHA512: 'SHA512',
                    OtpMigration_pb2.Algorithm.MD5: 'MD5'
                }
                algorithm = algorithm_map.get(otp_param.algorithm, 'SHA1')
                
                # Конвертируем количество цифр
                digits_map = {
                    OtpMigration_pb2.DigitCount.SIX: '6',
                    OtpMigration_pb2.DigitCount.EIGHT: '8'
                }
                digits = digits_map.get(otp_param.digits, '6')
                
                # Конвертируем секрет в base32
                secret_base32 = base64.b32encode(otp_param.secret).decode('ascii')
                
                # Парсим имя (может содержать issuer)
                name_parts = otp_param.name.split(':', 1) if ':' in otp_param.name else [otp_param.name]
                if len(name_parts) == 2:
                    issuer_from_name, account = name_parts
                    issuer = otp_param.issuer or issuer_from_name
                else:
                    account = name_parts[0]
                    issuer = otp_param.issuer
                
                accounts.append({
                    'secret': secret_base32,
                    'issuer': issuer,
                    'account': account,
                    'algorithm': algorithm,
                    'digits': digits,
                    'period': '30'  # TOTP обычно использует 30 секунд
                })
            
            return accounts
            
        except Exception as e:
            raise ValueError(f"Ошибка при декодировании migration данных: {e}")
    
    def generate_totp_code(self, secret: str, algorithm: str = 'SHA1', digits: int = 6, period: int = 30) -> str:
        """Генерирует текущий TOTP код"""
        try:
            import hashlib
            
            # Маппинг алгоритмов
            algorithm_map = {
                'SHA1': hashlib.sha1,
                'SHA256': hashlib.sha256,
                'SHA512': hashlib.sha512,
                'MD5': hashlib.md5
            }
            
            digest_func = algorithm_map.get(algorithm.upper(), hashlib.sha1)
            
            totp = pyotp.TOTP(
                secret,
                digest=digest_func,
                digits=digits,
                interval=period
            )
            return totp.now()
        except Exception as e:
            raise ValueError(f"Ошибка при генерации TOTP кода: {e}")
    
    def process_image(self, image_path: str) -> Tuple[str, List[Dict[str, str]]]:
        """Обрабатывает изображение и извлекает TOTP информацию"""
        # Загружаем изображение
        image = self.load_image(image_path)
        
        # Декодируем QR-код
        qr_data = self.decode_qr_code(image)
        if not qr_data:
            raise ValueError("QR-код не найден в изображении")
        
        print(f"Найден QR-код: {qr_data[:100]}{'...' if len(qr_data) > 100 else ''}")
        
        # Определяем тип QR-кода и парсим
        if qr_data.startswith('otpauth://totp/'):
            # Стандартный TOTP QR-код
            account_info = self.parse_otpauth_url(qr_data)
            return 'standard', [account_info]
        elif qr_data.startswith('otpauth-migration://offline?data='):
            # Google Authenticator migration QR-код
            accounts = self.parse_migration_url(qr_data)
            return 'migration', accounts
        else:
            raise ValueError(f"Неподдерживаемый формат QR-кода: {qr_data[:50]}...")

def print_totp_info(qr_type: str, accounts: List[Dict[str, str]], decoder: TOTPDecoderMigration):
    """Выводит информацию о TOTP аккаунтах"""
    print(f"\n{'='*60}")
    if qr_type == 'migration':
        print(f"GOOGLE AUTHENTICATOR MIGRATION QR-КОД")
        print(f"Найдено аккаунтов: {len(accounts)}")
    else:
        print(f"СТАНДАРТНЫЙ TOTP QR-КОД")
    print(f"{'='*60}")
    
    for i, account in enumerate(accounts, 1):
        if len(accounts) > 1:
            print(f"\n--- АККАУНТ {i} ---")
        
        print(f"Эмитент: {account['issuer'] or 'Не указан'}")
        print(f"Аккаунт: {account['account']}")
        print(f"Алгоритм: {account['algorithm']}")
        print(f"Цифр: {account['digits']}")
        print(f"Период: {account['period']} сек")
        
        # Генерируем текущий TOTP код
        try:
            current_code = decoder.generate_totp_code(
                account['secret'],
                account['algorithm'],
                int(account['digits']),
                int(account['period'])
            )
            print(f"\n🔑 ТЕКУЩИЙ КОД: {current_code}")
            
            # Создаем стандартный otpauth URL для импорта в другие приложения
            otpauth_url = f"otpauth://totp/{urllib.parse.quote(account['account'])}?secret={account['secret']}"
            if account['issuer']:
                otpauth_url += f"&issuer={urllib.parse.quote(account['issuer'])}"
            if account['algorithm'] != 'SHA1':
                otpauth_url += f"&algorithm={account['algorithm']}"
            if account['digits'] != '6':
                otpauth_url += f"&digits={account['digits']}"
            if account['period'] != '30':
                otpauth_url += f"&period={account['period']}"
            
            print(f"\n📱 URL для импорта:")
            print(f"{otpauth_url}")
            
        except Exception as e:
            print(f"\n❌ Ошибка при генерации кода: {e}")
        
        if i < len(accounts):
            print(f"\n{'-'*40}")

def main():
    """Главная функция"""
    if len(sys.argv) != 2:
        print("Использование: python3 totp_decoder_migration.py <путь_к_изображению>")
        print("\nПоддерживаемые форматы QR-кодов:")
        print("  • Стандартные TOTP QR-коды (otpauth://totp/...)")
        print("  • Google Authenticator migration QR-коды (otpauth-migration://...)")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        decoder = TOTPDecoderMigration()
        print(f"Обрабатываем изображение: {image_path}")
        
        qr_type, accounts = decoder.process_image(image_path)
        print_totp_info(qr_type, accounts, decoder)
        
    except ImportError as e:
        print(f"Ошибка импорта: {e}")
        print("\nУстановите необходимые библиотеки:")
        print("pip3 install opencv-python pyotp protobuf")
        sys.exit(1)
    except FileNotFoundError as e:
        print(f"Ошибка: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Ошибка: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()