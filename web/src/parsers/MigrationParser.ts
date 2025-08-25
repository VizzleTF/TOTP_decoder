import { TOTPAccount } from '../types/core'
import { TOTPService } from '../services/TOTPService'
import { MigrationPayload } from '../otpMigration'
import { base64ToUint8Array, uint8ArrayToBase32 } from '../utils/base32'
import { ALGORITHM_MAP, DIGITS_MAP, DEFAULT_PERIOD } from '../utils/constants'

export class MigrationParser {
  static parse(url: string): TOTPAccount[] {
    const urlObj = new URL(url)
    const data = urlObj.searchParams.get('data')

    if (!data) {
      throw new Error('No data parameter in migration URL')
    }

    const binaryData = base64ToUint8Array(data)
    const payload = MigrationPayload.decode(binaryData) as any

    return payload.otpParameters
      .filter((param: any) => param.type === 2) // TOTP only
      .map((param: any) => this.createAccount(param))
  }

  private static createAccount(param: any): TOTPAccount {
    const secret = uint8ArrayToBase32(param.secret)
    const algorithm = ALGORITHM_MAP[param.algorithm] || 'SHA-1'
    const digits = DIGITS_MAP[param.digits] || 6
    const period = DEFAULT_PERIOD // Migration doesn't include period
    
    const currentCode = TOTPService.generate(secret, algorithm, digits, period)
    const otpauthUrl = TOTPService.createOtpauthUrl(
      param.issuer || '',
      param.name || '',
      secret,
      algorithm,
      digits,
      period
    )

    return {
      issuer: param.issuer || '',
      account: param.name || '',
      secret,
      algorithm,
      digits,
      period,
      currentCode,
      otpauthUrl
    }
  }
}