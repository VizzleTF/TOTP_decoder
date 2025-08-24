import { DecodingResult, AppError } from '../types/core'
import { ImageService } from '../services/ImageService'
import { QRService } from '../services/QRService'
import { StandardParser } from '../parsers/StandardParser'
import { MigrationParser } from '../parsers/MigrationParser'

export class QRDecoder {
  async decode(file: File): Promise<DecodingResult> {
    try {
      const imageData = await ImageService.loadFromFile(file)
      const qrData = QRService.decode(imageData)

      if (!qrData) {
        throw new Error('No QR code found in image')
      }

      return this.parseQRData(qrData)
    } catch (error) {
      throw this.createError(error)
    }
  }

  private parseQRData(data: string): DecodingResult {
    if (QRService.isStandardTOTP(data)) {
      const account = StandardParser.parse(data)
      return {
        type: 'standard',
        accounts: [account]
      }
    }

    if (QRService.isMigration(data)) {
      const accounts = MigrationParser.parse(data)
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