import jsQR from 'jsqr';
import { TOTP } from 'totp-generator';
import { MigrationPayload } from './otpMigration';

interface TOTPAccount {
  issuer: string;
  account: string;
  secret: string;
  algorithm: string;
  digits: number;
  period: number;
  current_code: string;
  otpauth_url: string;
}

interface DecodingResult {
  qrType: string;
  accounts: TOTPAccount[];
}

interface AlgorithmMap {
  [key: number]: string;
}

interface DigitsMap {
  [key: number]: number;
}

class TOTPDecoder {
  private algorithmMap: AlgorithmMap;
  private digitsMap: DigitsMap;

  constructor() {
    // Algorithm mapping
    this.algorithmMap = {
      0: 'SHA-1',    // ALGORITHM_TYPE_UNSPECIFIED
      1: 'SHA-1',    // SHA1
      2: 'SHA-256',  // SHA256
      3: 'SHA-512',  // SHA512
      4: 'SHA-1'     // MD5 fallback to SHA-1
    };

    // Digits mapping
    this.digitsMap = {
      0: 6,  // DIGIT_COUNT_UNSPECIFIED
      1: 6,  // SIX
      2: 8   // EIGHT
    };
  }

  /**
   * Decode QR code from image file
   */
  async processFile(file: File): Promise<DecodingResult> {
    try {
      const imageData = await this.loadImageFromFile(file);
      const qrData = this.decodeQRCode(imageData);

      if (!qrData) {
        throw new Error('No QR code found in image');
      }

      return this.parseQRData(qrData);
    } catch (error) {
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load image from file and convert to ImageData
   */
  private async loadImageFromFile(file: File): Promise<ImageData> {
    return new Promise<ImageData>((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Decode QR code from ImageData
   */
  private decodeQRCode(imageData: ImageData): string | null {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      return code ? code.data : null;
    } catch (error) {
      return null;
    }
  }



  /**
   * Parse QR code data and determine type
   */
  private parseQRData(qrData: string): DecodingResult {
    if (qrData.startsWith('otpauth://totp/')) {
      // Standard TOTP QR code
      const account = this.parseOtpauthUrl(qrData);
      return {
        qrType: 'standard',
        accounts: [account]
      };
    } else if (qrData.startsWith('otpauth-migration://offline?data=')) {
      // Google Authenticator migration QR code
      const accounts = this.parseMigrationUrl(qrData);
      return {
        qrType: 'migration',
        accounts: accounts
      };
    } else {
      throw new Error('Unsupported QR code format');
    }
  }

  /**
   * Parse standard otpauth:// URL
   */
  private parseOtpauthUrl(url: string): TOTPAccount {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.substring(1).split(':');

      let issuer = '';
      let account = '';

      if (pathParts.length === 2) {
        issuer = decodeURIComponent(pathParts[0]);
        account = decodeURIComponent(pathParts[1]);
      } else {
        account = decodeURIComponent(pathParts[0]);
      }

      const secret = urlObj.searchParams.get('secret');
      const issuerParam = urlObj.searchParams.get('issuer');
      const algorithm = urlObj.searchParams.get('algorithm') || 'SHA1';
      const digits = parseInt(urlObj.searchParams.get('digits') || '6');
      const period = parseInt(urlObj.searchParams.get('period') || '30');

      if (issuerParam) {
        issuer = issuerParam;
      }

      if (!secret) {
        throw new Error('Secret not found in otpauth URL');
      }

      const currentCode = this.generateTOTPCode(secret, algorithm, digits, period);

      return {
        issuer: issuer,
        account: account,
        secret: secret,
        algorithm: algorithm,
        digits: digits,
        period: period,
        current_code: currentCode,
        otpauth_url: url
      };
    } catch (error) {
      throw new Error(`Failed to parse otpauth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Google Authenticator migration URL
   */
  private parseMigrationUrl(url: string): TOTPAccount[] {
    try {
      const urlObj = new URL(url);
      const data = urlObj.searchParams.get('data');

      if (!data) {
        throw new Error('No data parameter in migration URL');
      }

      // Decode base64 data
      const binaryData = this.base64ToUint8Array(data);

      // Parse protobuf data
      const payload = MigrationPayload.decode(binaryData) as any;

      const accounts: TOTPAccount[] = [];

      for (const otpParam of payload.otpParameters) {
        if (otpParam.type === 2) { // TOTP type
          const secret = this.uint8ArrayToBase32(otpParam.secret);
          const algorithm = this.algorithmMap[otpParam.algorithm] || 'SHA1';
          const digits = this.digitsMap[otpParam.digits] || 6;
          let period = 30; // Default period for TOTP
          // Note: Google Authenticator migration protocol doesn't include period information
          // in the protobuf schema, so we default to 30 seconds as per RFC 6238

          // Generate initial otpauth URL with default period
          let otpauthUrl = this.generateOtpauthUrl(
            otpParam.issuer || '',
            otpParam.name || '',
            secret,
            algorithm,
            digits,
            period
          );

          // Try to extract period from the generated otpauth URL
          // This allows for potential future enhancements where period might be available
          try {
            const parsedAccount = this.parseOtpauthUrl(otpauthUrl);
            period = parsedAccount.period || 30;
          } catch (error) {
            // If parsing fails, keep the default period of 30
            console.warn('Failed to extract period from generated otpauth URL, using default period of 30:', error);
            period = 30;
          }

          const currentCode = this.generateTOTPCode(secret, algorithm, digits, period);

          // Regenerate otpauth URL with the correct period (in case it was different)
          if (period !== 30) {
            otpauthUrl = this.generateOtpauthUrl(
              otpParam.issuer || '',
              otpParam.name || '',
              secret,
              algorithm,
              digits,
              period
            );
          }

          accounts.push({
            issuer: otpParam.issuer || '',
            account: otpParam.name || '',
            secret: secret,
            algorithm: algorithm,
            digits: digits,
            period: period,
            current_code: currentCode,
            otpauth_url: otpauthUrl
          });
        }
      }

      return accounts;
    } catch (error) {
      throw new Error(`Failed to parse migration URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate TOTP code
   */
  generateTOTPCode(secret: string, algorithm: string = 'SHA-1', digits: number = 6, period: number = 30): string {
    try {
      const { otp } = TOTP.generate(secret, {
        algorithm: algorithm as any,
        digits: digits,
        period: period
      });

      return otp;
    } catch (error) {
      return '000000';
    }
  }

  /**
   * Generate otpauth URL
   */
  private generateOtpauthUrl(issuer: string, account: string, secret: string, algorithm: string, digits: number, period: number): string {
    const label = issuer ? `${issuer}:${account}` : account;
    const params = new URLSearchParams({
      secret: secret,
      issuer: issuer,
      algorithm: algorithm,
      digits: digits.toString(),
      period: period.toString()
    });

    return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
  }

  /**
   * Convert base64 string to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Convert Uint8Array to base32 string
   */
  private uint8ArrayToBase32(bytes: Uint8Array): string {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let buffer = 0;
    let bitsLeft = 0;

    for (const byte of bytes) {
      buffer = (buffer << 8) | byte;
      bitsLeft += 8;

      while (bitsLeft >= 5) {
        result += base32Chars[(buffer >> (bitsLeft - 5)) & 31];
        bitsLeft -= 5;
      }
    }

    if (bitsLeft > 0) {
      result += base32Chars[(buffer << (5 - bitsLeft)) & 31];
    }

    return result;
  }
}

export default TOTPDecoder;