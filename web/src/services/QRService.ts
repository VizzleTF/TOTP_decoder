import jsQR from 'jsqr'

export class QRService {
  static decode(imageData: ImageData): string | null {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      return code?.data || null
    } catch {
      return null
    }
  }

  static isStandardTOTP(data: string): boolean {
    return data.startsWith('otpauth://totp/')
  }

  static isMigration(data: string): boolean {
    return data.startsWith('otpauth-migration://offline?data=')
  }
}