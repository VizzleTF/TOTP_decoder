from http.server import BaseHTTPRequestHandler
import json
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
import logging
import traceback

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TOTPDecoderMigration:
    """Класс для декодирования TOTP QR-кодов и миграционных URL"""
    
    def __init__(self):
        pass
    
    def load_image_from_bytes(self, image_bytes: bytes) -> Optional[cv2.Mat]:
        """Загружает изображение из байтов"""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return image
        except Exception as e:
            logger.error(f"Ошибка загрузки изображения: {e}")
            return None
    
    def decode_qr_code(self, image: cv2.Mat) -> Optional[str]:
        """Декодирует QR-код из изображения"""
        try:
            detector = cv2.QRCodeDetector()
            data, vertices_array, binary_qrcode = detector.detectAndDecode(image)
            
            if data:
                return data
            
            # Попробуем с разными предобработками
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            data, _, _ = detector.detectAndDecode(gray)
            if data:
                return data
            
            # Попробуем с бинаризацией
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            data, _, _ = detector.detectAndDecode(binary)
            if data:
                return data
                
            return None
        except Exception as e:
            logger.error(f"Ошибка декодирования QR-кода: {e}")
            return None
    
    def parse_otpauth_url(self, url: str) -> Dict[str, str]:
        """Парсит otpauth:// URL"""
        try:
            if not url.startswith('otpauth://'):
                return {}
            
            parsed = urllib.parse.urlparse(url)
            params = urllib.parse.parse_qs(parsed.query)
            
            # Извлекаем параметры
            secret = params.get('secret', [''])[0]
            issuer = params.get('issuer', [''])[0]
            algorithm = params.get('algorithm', ['SHA1'])[0]
            digits = int(params.get('digits', ['6'])[0])
            period = int(params.get('period', ['30'])[0])
            
            # Извлекаем label из пути
            label = parsed.path.lstrip('/')
            if ':' in label:
                issuer_from_label, account = label.split(':', 1)
                if not issuer:
                    issuer = issuer_from_label
            else:
                account = label
            
            return {
                'secret': secret,
                'issuer': issuer,
                'account': account,
                'algorithm': algorithm,
                'digits': str(digits),
                'period': str(period),
                'type': 'totp'
            }
        except Exception as e:
            logger.error(f"Ошибка парсинга otpauth URL: {e}")
            return {}
    
    def parse_migration_url(self, url: str) -> List[Dict[str, str]]:
        """Парсит Google Authenticator migration URL"""
        try:
            if not url.startswith('otpauth-migration://'):
                return []
            
            parsed = urllib.parse.urlparse(url)
            params = urllib.parse.parse_qs(parsed.query)
            data_param = params.get('data', [''])[0]
            
            if not data_param:
                return []
            
            # Декодируем base64
            try:
                decoded_data = base64.b64decode(data_param)
            except Exception as e:
                logger.error(f"Ошибка декодирования base64: {e}")
                return []
            
            # Парсим protobuf
            try:
                migration_payload = OtpMigration_pb2.MigrationPayload()
                migration_payload.ParseFromString(decoded_data)
                
                accounts = []
                for otp_param in migration_payload.otp_parameters:
                    account = {
                        'secret': base64.b32encode(otp_param.secret).decode('utf-8'),
                        'account': otp_param.name,
                        'issuer': otp_param.issuer,
                        'algorithm': self._get_algorithm_name(otp_param.algorithm),
                        'digits': str(otp_param.digits),
                        'type': self._get_type_name(otp_param.type)
                    }
                    accounts.append(account)
                
                return accounts
            except Exception as e:
                logger.error(f"Ошибка парсинга protobuf: {e}")
                return []
        except Exception as e:
            logger.error(f"Ошибка парсинга migration URL: {e}")
            return []
    
    def _get_algorithm_name(self, algorithm_enum: int) -> str:
        """Преобразует enum алгоритма в строку"""
        algorithms = {0: 'SHA1', 1: 'SHA1', 2: 'SHA256', 3: 'SHA512'}
        return algorithms.get(algorithm_enum, 'SHA1')
    
    def _get_type_name(self, type_enum: int) -> str:
        """Преобразует enum типа в строку"""
        types = {0: 'hotp', 1: 'totp', 2: 'totp'}
        return types.get(type_enum, 'totp')
    
    def generate_totp_code(self, secret: str, algorithm: str = 'SHA1', digits: int = 6, period: int = 30) -> str:
        """Генерирует текущий TOTP код"""
        try:
            totp = pyotp.TOTP(secret, algorithm=algorithm, digits=digits, interval=period)
            return totp.now()
        except Exception as e:
            logger.error(f"Ошибка генерации TOTP: {e}")
            return "ERROR"
    
    def process_image_bytes(self, image_bytes: bytes) -> Tuple[str, List[Dict[str, str]]]:
        """Обрабатывает изображение из байтов"""
        try:
            # Загружаем изображение
            image = self.load_image_from_bytes(image_bytes)
            if image is None:
                return "Не удалось загрузить изображение", []
            
            # Декодируем QR-код
            qr_data = self.decode_qr_code(image)
            if not qr_data:
                return "QR-код не найден или не может быть декодирован", []
            
            # Определяем тип URL и парсим
            if qr_data.startswith('otpauth-migration://'):
                accounts = self.parse_migration_url(qr_data)
                if not accounts:
                    return "Не удалось распарсить migration URL", []
                return "success", accounts
            elif qr_data.startswith('otpauth://'):
                account = self.parse_otpauth_url(qr_data)
                if not account:
                    return "Не удалось распарсить otpauth URL", []
                return "success", [account]
            else:
                return f"Неподдерживаемый тип QR-кода: {qr_data[:50]}...", []
        except Exception as e:
            logger.error(f"Ошибка обработки изображения: {e}")
            return f"Ошибка обработки: {str(e)}", []

# Создаем экземпляр декодера
decoder = TOTPDecoderMigration()

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"status": "ok", "message": "TOTP Decoder API is running"}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == '/api/decode':
            try:
                logger.info("Получен POST запрос на /api/decode")
                
                # Читаем данные
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                logger.info(f"Размер полученных данных: {len(post_data)} байт")
                
                # Простая обработка multipart/form-data
                boundary = None
                content_type = self.headers.get('Content-Type', '')
                if 'boundary=' in content_type:
                    boundary = content_type.split('boundary=')[1].encode()
                
                if boundary:
                    # Ищем файл в multipart данных
                    parts = post_data.split(b'--' + boundary)
                    file_data = None
                    
                    for part in parts:
                        if b'Content-Disposition: form-data' in part and b'filename=' in part:
                            # Находим начало файла
                            header_end = part.find(b'\r\n\r\n')
                            if header_end != -1:
                                file_data = part[header_end + 4:]
                                # Убираем завершающий \r\n
                                if file_data.endswith(b'\r\n'):
                                    file_data = file_data[:-2]
                                break
                    
                    if file_data:
                        logger.info(f"Найден файл размером: {len(file_data)} байт")
                        
                        # Обрабатываем изображение
                        status, accounts = decoder.process_image_bytes(file_data)
                        
                        if status == "success":
                            # Генерируем TOTP коды и otpauth URL
                            for account in accounts:
                                if account.get('secret'):
                                    try:
                                        # Генерируем текущий TOTP код
                                        totp_code = decoder.generate_totp_code(
                                            account['secret'],
                                            account.get('algorithm', 'SHA1'),
                                            int(account.get('digits', 6)),
                                            int(account.get('period', 30))
                                        )
                                        account['current_totp'] = totp_code
                                        
                                        # Генерируем otpauth URL
                                        label = f"{account.get('issuer', '')}:{account.get('account', '')}".strip(':')
                                        params = {
                                            'secret': account['secret'],
                                            'issuer': account.get('issuer', ''),
                                            'algorithm': account.get('algorithm', 'SHA1'),
                                            'digits': account.get('digits', '6'),
                                            'period': account.get('period', '30')
                                        }
                                        
                                        # Удаляем пустые параметры
                                        params = {k: v for k, v in params.items() if v}
                                        
                                        query_string = urllib.parse.urlencode(params)
                                        otpauth_url = f"otpauth://totp/{urllib.parse.quote(label)}?{query_string}"
                                        account['otpauth_url'] = otpauth_url
                                    except Exception as e:
                                        account['otpauth_url'] = "ERROR"
                            
                            response = {
                                "success": True,
                                "message": "QR-код успешно декодирован",
                                "accounts": accounts
                            }
                        else:
                            response = {
                                "success": False,
                                "message": status,
                                "accounts": []
                            }
                    else:
                        response = {
                            "success": False,
                            "message": "Файл не найден в запросе",
                            "accounts": []
                        }
                else:
                    response = {
                        "success": False,
                        "message": "Неверный Content-Type",
                        "accounts": []
                    }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                logger.error(f"Ошибка обработки POST запроса: {e}")
                logger.error(traceback.format_exc())
                
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {
                    "success": False,
                    "message": f"Ошибка сервера: {str(e)}",
                    "accounts": []
                }
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()