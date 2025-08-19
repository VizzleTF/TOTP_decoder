from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import pyotp
import base64
import urllib.parse
import tempfile
import os
from typing import List, Dict, Optional, Tuple
import hashlib
import OtpMigration_pb2

app = FastAPI(title="TOTP QR Decoder API", version="1.0.0")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TOTPDecoderMigration:
    """TOTP QR Code Decoder with migration support"""
    
    def __init__(self):
        self.qr_detector = cv2.QRCodeDetector()
    
    def load_image_from_bytes(self, image_bytes: bytes) -> Optional[cv2.Mat]:
        """Загружает изображение из байтов"""
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Не удалось загрузить изображение")
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
            data, points, _ = self.qr_detector.detectAndDecode(img)
            if data:
                return data
        
        return None
    
    def parse_otpauth_url(self, url: str) -> Dict[str, str]:
        """Парсит стандартный otpauth:// URL"""
        parsed = urllib.parse.urlparse(url)
        
        if parsed.scheme != 'otpauth' or parsed.netloc != 'totp':
            raise ValueError("Неверный формат otpauth URL")
        
        # Извлекаем параметры из query string
        params = urllib.parse.parse_qs(parsed.query)
        
        # Извлекаем label (issuer:account)
        label = urllib.parse.unquote(parsed.path.lstrip('/'))
        
        # Разделяем issuer и account
        if ':' in label:
            issuer, account = label.split(':', 1)
        else:
            issuer = params.get('issuer', [''])[0]
            account = label
        
        return {
            'issuer': issuer,
            'account': account,
            'secret': params.get('secret', [''])[0],
            'algorithm': params.get('algorithm', ['SHA1'])[0],
            'digits': int(params.get('digits', ['6'])[0]),
            'period': int(params.get('period', ['30'])[0])
        }
    
    def parse_migration_url(self, url: str) -> List[Dict[str, str]]:
        """Парсит Google Authenticator migration URL"""
        parsed = urllib.parse.urlparse(url)
        
        if not (parsed.scheme == 'otpauth-migration' and parsed.netloc == 'offline'):
            raise ValueError("Неверный формат migration URL")
        
        # Извлекаем data параметр
        params = urllib.parse.parse_qs(parsed.query)
        data_param = params.get('data', [''])[0]
        
        if not data_param:
            raise ValueError("Отсутствует data параметр в migration URL")
        
        try:
            # Декодируем base64
            decoded_data = base64.b64decode(data_param)
            
            # Парсим protobuf
            migration_payload = OtpMigration_pb2.MigrationPayload()
            migration_payload.ParseFromString(decoded_data)
            
            accounts = []
            for otp_param in migration_payload.otp_parameters:
                # Конвертируем алгоритм
                algorithm_map = {
                    1: 'SHA1',
                    2: 'SHA256',
                    3: 'SHA512',
                    4: 'MD5'
                }
                
                # Конвертируем тип (должен быть TOTP)
                if otp_param.type != 2:  # 2 = TOTP
                    continue
                
                accounts.append({
                    'issuer': otp_param.issuer,
                    'account': otp_param.name,
                    'secret': base64.b32encode(otp_param.secret).decode('utf-8'),
                    'algorithm': algorithm_map.get(otp_param.algorithm, 'SHA1'),
                    'digits': otp_param.digits if otp_param.digits else 6,
                    'period': 30  # Google Authenticator всегда использует 30 секунд
                })
            
            return accounts
            
        except Exception as e:
            raise ValueError(f"Ошибка при парсинге migration данных: {e}")
    
    def generate_totp_code(self, secret: str, algorithm: str = 'SHA1', digits: int = 6, period: int = 30) -> str:
        """Генерирует текущий TOTP код"""
        try:
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
            return "ERROR"
    
    def process_image_bytes(self, image_bytes: bytes) -> Tuple[str, List[Dict[str, str]]]:
        """Обрабатывает изображение из байтов и извлекает TOTP информацию"""
        # Загружаем изображение
        image = self.load_image_from_bytes(image_bytes)
        
        # Декодируем QR-код
        qr_data = self.decode_qr_code(image)
        if not qr_data:
            raise ValueError("QR-код не найден в изображении")
        
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
    
    def process_image(self, image_path: str) -> Tuple[str, List[Dict[str, str]]]:
        """Обрабатывает изображение из файла"""
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
        return self.process_image_bytes(image_bytes)

# Инициализация декодера
decoder = TOTPDecoderMigration()

@app.get("/api/health")
async def health_check():
    """Проверка состояния API"""
    return {"status": "healthy"}

@app.post("/api/decode")
async def decode_qr_code(file: UploadFile = File(...)):
    """Декодирование QR кода из загруженного изображения"""
    try:
        # Проверка типа файла
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Файл должен быть изображением")
        
        # Проверка размера файла (максимум 10MB)
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Размер файла не должен превышать 10MB")
        
        # Обработка изображения напрямую из байтов
        qr_type, accounts = decoder.process_image_bytes(contents)
        
        # Генерация TOTP кодов и OTP Auth URLs для каждого аккаунта
        for account in accounts:
            try:
                # Генерация текущего TOTP кода
                current_code = decoder.generate_totp_code(
                    account['secret'],
                    account.get('algorithm', 'SHA1'),
                    account.get('digits', 6),
                    account.get('period', 30)
                )
                account['current_code'] = current_code
            except Exception as e:
                account['current_code'] = "ERROR"
            
            try:
                # Генерация OTP Auth URL
                label = f"{account.get('issuer', '')}:{account.get('account', '')}".strip(':')
                params = {
                    'secret': account['secret'],
                    'issuer': account.get('issuer', ''),
                    'algorithm': account.get('algorithm', 'SHA1'),
                    'digits': str(account.get('digits', 6)),
                    'period': str(account.get('period', 30))
                }
                
                # Удаляем пустые параметры
                params = {k: v for k, v in params.items() if v}
                
                query_string = urllib.parse.urlencode(params)
                otpauth_url = f"otpauth://totp/{urllib.parse.quote(label)}?{query_string}"
                account['otpauth_url'] = otpauth_url
            except Exception as e:
                account['otpauth_url'] = "ERROR"
        
        return JSONResponse(content={
            "success": True,
            "qr_type": qr_type,
            "accounts": accounts
        })
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обработки: {str(e)}")

# Для Vercel
handler = app