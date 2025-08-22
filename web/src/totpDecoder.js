import jsQR from 'jsqr';
import { TOTP } from 'totp-generator';
import { MigrationPayload } from './otpMigration.js';

class TOTPDecoder {
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
   * @param {File} file - Image file containing QR code
   * @returns {Promise<{qrType: string, accounts: Array}>}
   */
  async processFile(file) {
    try {
      const imageData = await this.loadImageFromFile(file);
      const qrData = this.decodeQRCode(imageData);
      
      if (!qrData) {
        throw new Error('No QR code found in image');
      }

      return this.parseQRData(qrData);
    } catch (error) {
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  /**
   * Load image from file and convert to ImageData
   * @param {File} file - Image file
   * @returns {Promise<ImageData>}
   */
  async loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

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
   * @param {ImageData} imageData - Image data
   * @returns {string|null} QR code data or null if not found
   */
  decodeQRCode(imageData) {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      return code ? code.data : null;
    } catch (error) {
      return null;
    }
  }



  /**
   * Parse QR code data and determine type
   * @param {string} qrData - Raw QR code data
   * @returns {{qrType: string, accounts: Array}}
   */
  parseQRData(qrData) {
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
   * @param {string} url - otpauth URL
   * @returns {Object} Account information
   */
  parseOtpauthUrl(url) {
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
      throw new Error(`Failed to parse otpauth URL: ${error.message}`);
    }
  }

  /**
   * Parse Google Authenticator migration URL
   * @param {string} url - Migration URL
   * @returns {Array} Array of account information
   */
  parseMigrationUrl(url) {
    try {
      const urlObj = new URL(url);
      const data = urlObj.searchParams.get('data');
      
      if (!data) {
        throw new Error('No data parameter in migration URL');
      }

      // Decode base64 data
      const binaryData = this.base64ToUint8Array(data);
      
      // Parse protobuf data
      const payload = MigrationPayload.decode(binaryData);
      
      const accounts = [];
      
      for (const otpParam of payload.otpParameters) {
        if (otpParam.type === 2) { // TOTP type
          const secret = this.uint8ArrayToBase32(otpParam.secret);
          const algorithm = this.algorithmMap[otpParam.algorithm] || 'SHA1';
          const digits = this.digitsMap[otpParam.digits] || 6;
          const period = 30; // Default period for TOTP
          
          const currentCode = this.generateTOTPCode(secret, algorithm, digits, period);
          
          // Generate otpauth URL
          const otpauthUrl = this.generateOtpauthUrl(
            otpParam.issuer || '',
            otpParam.name || '',
            secret,
            algorithm,
            digits,
            period
          );
          
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
      throw new Error(`Failed to parse migration URL: ${error.message}`);
    }
  }

  /**
   * Generate TOTP code
   * @param {string} secret - Base32 encoded secret
   * @param {string} algorithm - Hash algorithm
   * @param {number} digits - Number of digits
   * @param {number} period - Time period in seconds
   * @returns {string} TOTP code
   */
  generateTOTPCode(secret, algorithm = 'SHA-1', digits = 6, period = 30) {
    try {
      const { otp } = TOTP.generate(secret, {
        algorithm: algorithm,
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
   * @param {string} issuer - Service issuer
   * @param {string} account - Account name
   * @param {string} secret - Base32 secret
   * @param {string} algorithm - Hash algorithm
   * @param {number} digits - Number of digits
   * @param {number} period - Time period
   * @returns {string} otpauth URL
   */
  generateOtpauthUrl(issuer, account, secret, algorithm, digits, period) {
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
   * @param {string} base64 - Base64 string
   * @returns {Uint8Array} Byte array
   */
  base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Convert Uint8Array to base32 string
   * @param {Uint8Array} bytes - Byte array
   * @returns {string} Base32 string
   */
  uint8ArrayToBase32(bytes) {
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