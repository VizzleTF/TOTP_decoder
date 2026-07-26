import { DecodingResult, AppError } from '../types/core'
import { ImageService } from '../services/ImageService'
import { QRService } from '../services/QRService'
import { TOTPService } from '../services/TOTPService'
import { StandardParser } from '../parsers/StandardParser'
import { MigrationParser } from '../parsers/MigrationParser'

export class QRDecoder {
  async decode(file: File): Promise<DecodingResult> {
    try {
      const imageData = await ImageService.loadFromFile(file)
      const qrData = await QRService.decode(imageData)

      if (!qrData) {
        throw new Error('No QR code found in image')
      }

      return this.parseQRData(qrData)
    } catch (error) {
      throw this.createError(error)
    }
  }

  async decodeText(text: string): Promise<DecodingResult> {
    try {
      const trimmed = text.trim()

      if (QRService.isStandardTOTP(trimmed) || QRService.isMigration(trimmed)) {
        return await this.parseQRData(trimmed)
      }

      // Raw Base32 secret (spaces/dashes tolerated)
      const secret = trimmed.replace(/[\s-]/g, '').toUpperCase()
      if (/^[A-Z2-7]+=*$/.test(secret) && secret.length >= 16) {
        const account = StandardParser.parse(
          TOTPService.createOtpauthUrl('', '', secret)
        )
        return {
          type: 'standard',
          accounts: [account]
        }
      }

      throw new Error('Unsupported QR code format')
    } catch (error) {
      throw this.createError(error)
    }
  }

  private async parseQRData(data: string): Promise<DecodingResult> {
    if (QRService.isStandardTOTP(data)) {
      const account = StandardParser.parse(data)
      return {
        type: 'standard',
        accounts: [account]
      }
    }

    if (QRService.isMigration(data)) {
      const accounts = await MigrationParser.parse(data)
      return {
        type: 'migration',
        accounts
      }
    }

    throw new Error('Unsupported QR code format')
  }

  private createError(error: unknown): AppError {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { message: `Failed to decode QR: ${message}` }
  }
}