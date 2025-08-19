from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pyzbar import pyzbar
from PIL import Image
import io
import pyotp
import base64
import urllib.parse
from typing import List, Dict, Optional, Tuple
import hashlib
import OtpMigration_pb2
import logging
import traceback

# Настройка логирования
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="TOTP Decoder API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QRDecoder:
    """Класс для декодирования TOTP QR-кодов и миграционных URL"""
    
    def __init__(self):
        pass
    
    def load_image_from_bytes(self, image_bytes: bytes) -> Optional[Image.Image]:
        """Загружает изображение из байтов"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            return image
        except Exception as e:
            logger.error(f"Ошибка загрузки изображения: {e}")
            return None
    
    def decode_qr_code(self, image: Image.Image) -> Optional[str]:
        """Декодирует QR-код из изображения"""
        try:
            # Декодируем QR-коды с помощью pyzbar
            decoded_objects = pyzbar.decode(image)
            
            if not decoded_objects:
                logger.debug("QR-код не найден")
                return None
            
            # Возвращаем данные первого найденного QR-кода
            data = decoded_objects[0].data.decode('utf-8')
            logger.debug(f"Декодированные данные QR-кода: {data[:50]}...")
            
            return data if data else None
                
        except Exception as e:
            logger.error(f"Ошибка декодирования QR-кода: {e}")
            return None
    
    def parse_otpauth_url(self, url: str) -> Dict[str, str]:
        """Парсит обычный otpauth URL"""
        try:
            parsed = urllib.parse.urlparse(url)
            params = urllib.parse.parse_qs(parsed.query)
            
            # Извлекаем параметры
            secret = params.get('secret', [''])[0]
            issuer = params.get('issuer', [''])[0]
            digits = int(params.get('digits', ['6'])[0])
            period = int(params.get('period', ['30'])[0])
            algorithm = params.get('algorithm', ['SHA1'])[0]
            
            # Извлекаем имя аккаунта из пути
            account_name = parsed.path.lstrip('/')
            if ':' in account_name:
                issuer_from_path, account_name = account_name.split(':', 1)
                if not issuer:
                    issuer = issuer_from_path
            
            # Генерируем текущий TOTP код
            current_code = self.generate_totp_code(secret, algorithm, digits, period)
            
            # Генерируем otpauth URL (возвращаем оригинальный URL)
            otpauth_url = url
            
            return {
                'name': account_name,
                'issuer': issuer,
                'secret': secret,
                'algorithm': algorithm,
                'digits': str(digits),
                'period': str(period),
                'current_code': current_code,
                'otpauth_url': otpauth_url
            }
        except Exception as e:
            logger.error(f"Ошибка парсинга otpauth URL: {e}")
            return {}
    
    def parse_migration_url(self, url: str) -> List[Dict[str, str]]:
        """Парсит Google Authenticator migration URL"""
        try:
            print(f"[DEBUG] ВЫЗВАН parse_migration_url с URL: {url[:100]}...", flush=True)
            logger.info(f"[DEBUG] Parsing migration URL: {url[:50]}...")
            
            if not url.startswith('otpauth-migration://'):
                print(f"[DEBUG] URL не начинается с otpauth-migration://", flush=True)
                logger.info("[DEBUG] URL не начинается с otpauth-migration://")
                return []
            
            # Извлекаем data параметр
            parsed = urllib.parse.urlparse(url)
            params = urllib.parse.parse_qs(parsed.query)
            data_param = params.get('data', [''])[0]
            
            if not data_param:
                print(f"[DEBUG] Нет data параметра в URL", flush=True)
                logger.info("[DEBUG] Нет data параметра в URL")
                return []
            
            print(f"[DEBUG] Data параметр: {data_param[:50]}...", flush=True)
            logger.info(f"[DEBUG] Data параметр: {data_param[:50]}...")
            
            # Декодируем base64
            try:
                decoded_data = base64.b64decode(data_param)
                print(f"[DEBUG] Декодированные данные: {len(decoded_data)} байт", flush=True)
                logger.info(f"[DEBUG] Декодированные данные: {len(decoded_data)} байт")
            except Exception as e:
                print(f"[DEBUG] Ошибка декодирования base64: {e}", flush=True)
                logger.error(f"Ошибка декодирования base64: {e}")
                return []
            
            # Парсим protobuf
            try:
                migration_payload = OtpMigration_pb2.MigrationPayload()
                migration_payload.ParseFromString(decoded_data)
                print(f"[DEBUG] Protobuf распарсен, найдено {len(migration_payload.otp_parameters)} OTP параметров", flush=True)
                logger.info(f"[DEBUG] Protobuf распарсен, найдено {len(migration_payload.otp_parameters)} OTP параметров")
            except Exception as e:
                print(f"[DEBUG] Ошибка парсинга protobuf: {e}", flush=True)
                logger.error(f"Ошибка парсинга protobuf: {e}")
                return []
            
            accounts = []
            for i, otp_param in enumerate(migration_payload.otp_parameters):
                try:
                    print(f"[DEBUG] OTP параметр {i}: name='{otp_param.name}', issuer='{otp_param.issuer}'", flush=True)
                    print(f"[DEBUG] OTP параметр {i}: raw digits={otp_param.digits}, algorithm={otp_param.algorithm}, type={otp_param.type}", flush=True)
                    
                    # Устанавливаем digits по умолчанию 6, если не задано, равно 0 или равно 1 (некорректное значение)
                    digits = otp_param.digits if otp_param.digits > 1 else 6
                    print(f"[DEBUG] OTP параметр {i}: обработанные digits={digits}", flush=True)
                    
                    logger.info(f"[DEBUG] OTP параметр {i}: name='{otp_param.name}', issuer='{otp_param.issuer}'")
                    logger.info(f"[DEBUG] OTP параметр {i}: raw digits={otp_param.digits}, algorithm={otp_param.algorithm}, type={otp_param.type}")
                    logger.info(f"[DEBUG] OTP параметр {i}: обработанные digits={digits}")
                    
                    secret_b32 = base64.b32encode(otp_param.secret).decode('ascii')
                    algorithm = self._get_algorithm_name(otp_param.algorithm)
                    period = 30  # По умолчанию 30 секунд для TOTP
                    
                    # Генерируем текущий TOTP код
                    current_code = self.generate_totp_code(secret_b32, algorithm, digits, period)
                    
                    # Генерируем otpauth URL для импорта в другие приложения
                    account_name = otp_param.name or 'Unknown'
                    otpauth_url = f"otpauth://totp/{urllib.parse.quote(account_name)}?secret={secret_b32}"
                    if otp_param.issuer:
                        otpauth_url += f"&issuer={urllib.parse.quote(otp_param.issuer)}"
                    if algorithm != 'SHA1':
                        otpauth_url += f"&algorithm={algorithm}"
                    if digits != 6:
                        otpauth_url += f"&digits={digits}"
                    if period != 30:
                        otpauth_url += f"&period={period}"
                    
                    account = {
                        'name': otp_param.name,
                        'issuer': otp_param.issuer,
                        'secret': secret_b32,
                        'algorithm': algorithm,
                        'digits': str(digits),
                        'period': str(period),
                        'current_code': current_code,
                        'otpauth_url': otpauth_url
                    }
                    
                    print(f"[DEBUG] Финальный аккаунт {i}: {account}", flush=True)
                    logger.info(f"[DEBUG] Финальный аккаунт {i}: {account}")
                    
                    accounts.append(account)
                except Exception as e:
                    print(f"[DEBUG] Ошибка обработки OTP параметра {i}: {e}", flush=True)
                    print(f"[DEBUG] Traceback: {traceback.format_exc()}", flush=True)
                    logger.error(f"Ошибка обработки OTP параметра {i}: {e}")
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    continue
            
            return accounts
        except Exception as e:
            print(f"[DEBUG] Общая ошибка в parse_migration_url: {e}", flush=True)
            print(f"[DEBUG] Traceback: {traceback.format_exc()}", flush=True)
            logger.error(f"Ошибка парсинга migration URL: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return []
    
    def _get_algorithm_name(self, algorithm_enum: int) -> str:
        """Преобразует enum алгоритма в строку"""
        return {0: 'SHA1', 1: 'SHA1', 2: 'SHA256', 3: 'SHA512'}.get(algorithm_enum, 'SHA1')
    
    def _get_type_name(self, type_enum: int) -> str:
        """Преобразует enum типа в строку"""
        return {0: 'HOTP', 1: 'TOTP'}.get(type_enum, 'TOTP')
    
    def generate_totp_code(self, secret: str, algorithm: str = 'SHA1', digits: int = 6, period: int = 30) -> str:
        """Генерирует текущий TOTP код"""
        try:
            # Создаем TOTP объект
            totp = pyotp.TOTP(
                secret,
                digits=digits,
                digest=getattr(hashlib, algorithm.lower()),
                interval=period
            )
            return totp.now()
        except Exception as e:
            logger.error(f"Ошибка генерации TOTP кода: {e}")
            return "000000"
    
    def process_image_bytes(self, image_bytes: bytes) -> Tuple[str, List[Dict[str, str]]]:
        """Обрабатывает изображение из байтов"""
        try:
            print(f"[DEBUG] НАЧАЛО process_image_bytes, размер изображения: {len(image_bytes)} байт", flush=True)
            
            # Загружаем изображение
            image = self.load_image_from_bytes(image_bytes)
            if image is None:
                print(f"[DEBUG] Не удалось загрузить изображение", flush=True)
                return "Не удалось загрузить изображение", []
            
            # Декодируем QR-код
            qr_data = self.decode_qr_code(image)
            if not qr_data:
                print(f"[DEBUG] QR-код не найден", flush=True)
                return "QR-код не найден или не может быть декодирован", []
            
            print(f"[DEBUG] Найден QR-код: {qr_data[:100]}...", flush=True)
            
            # Определяем тип URL и парсим
            if qr_data.startswith('otpauth-migration://'):
                print(f"[DEBUG] Это migration URL, вызываем parse_migration_url", flush=True)
                accounts = self.parse_migration_url(qr_data)
                if not accounts:
                    print(f"[DEBUG] parse_migration_url вернул пустой список", flush=True)
                    return "Не удалось распарсить migration URL", []
                print(f"[DEBUG] parse_migration_url вернул {len(accounts)} аккаунтов", flush=True)
                return "success", accounts
            elif qr_data.startswith('otpauth://'):
                account = self.parse_otpauth_url(qr_data)
                if not account:
                    return "Не удалось распарсить otpauth URL", []
                return "success", [account]
            else:
                return "Неподдерживаемый формат QR-кода", []
        except Exception as e:
            logger.error(f"Ошибка обработки изображения: {e}")
            return f"Ошибка обработки: {str(e)}", []

@app.get("/")
async def root():
    return {"message": "TOTP Decoder API"}

@app.get("/health")
async def health():
    return {"status": "ok", "message": "TOTP Decoder API is running"}

@app.post("/decode")
async def decode_qr(file: UploadFile = File(...)):
    """Декодирует QR-код из загруженного изображения"""
    try:
        print(f"[DEBUG] ПОЛУЧЕН POST запрос /decode, файл: {file.filename}", flush=True)
        
        # Читаем содержимое файла
        contents = await file.read()
        print(f"[DEBUG] Прочитано {len(contents)} байт из файла", flush=True)
        
        # Создаем экземпляр декодера и обрабатываем изображение
        decoder = QRDecoder()
        print(f"[DEBUG] Создан декодер, вызываем process_image_bytes", flush=True)
        status, accounts = decoder.process_image_bytes(contents)
        
        if status == "success":
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "accounts": accounts
                }
            )
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": status
                }
            )
    except Exception as e:
        logger.error(f"Ошибка в decode_qr: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Внутренняя ошибка сервера: {str(e)}"
            }
        )

# Handler для Vercel
handler = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)