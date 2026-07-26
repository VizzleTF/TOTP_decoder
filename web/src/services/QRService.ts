export class QRService {
  /** jsQR is ~47 KB gzip — loaded only once a file is actually decoded */
  static async decode(imageData: ImageData): Promise<string | null> {
    try {
      const { default: jsQR } = await import('jsqr')
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