import { TOTP } from 'totp-generator'
import { DEFAULT_ALGORITHM, DEFAULT_DIGITS, DEFAULT_PERIOD } from '../utils/constants'

export class TOTPService {
  static generate(
    secret: string,
    algorithm: string = DEFAULT_ALGORITHM,
    digits: number = DEFAULT_DIGITS,
    period: number = DEFAULT_PERIOD
  ): string {
    try {
      const { otp } = TOTP.generate(secret, {
        algorithm: algorithm as any,
        digits,
        period
      })
      return otp
    } catch {
      return '000000'
    }
  }

  static createOtpauthUrl(
    issuer: string,
    account: string,
    secret: string,
    algorithm: string = DEFAULT_ALGORITHM,
    digits: number = DEFAULT_DIGITS,
    period: number = DEFAULT_PERIOD
  ): string {
    const label = issuer ? `${issuer}:${account}` : account
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm,
      digits: digits.toString(),
      period: period.toString()
    })

    return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`
  }
}