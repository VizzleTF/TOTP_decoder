import { TOTPAccount } from '../types/core'
import { TOTPService } from '../services/TOTPService'
import { DEFAULT_DIGITS, DEFAULT_PERIOD } from '../utils/constants'

export class StandardParser {
  static parse(url: string): TOTPAccount {
    const urlObj = new URL(url)
    // Decode before splitting: the label's colon is often sent as %3A
    const label = decodeURIComponent(urlObj.pathname.substring(1))
    const separator = label.indexOf(':')
    let issuer = separator === -1 ? '' : label.slice(0, separator)
    const account = label.slice(separator + 1).trim()

    const secret = urlObj.searchParams.get('secret')
    const issuerParam = urlObj.searchParams.get('issuer')
    const algorithm = urlObj.searchParams.get('algorithm') || 'SHA-1'
    const digits = parseInt(urlObj.searchParams.get('digits') || DEFAULT_DIGITS.toString())
    const period = parseInt(urlObj.searchParams.get('period') || DEFAULT_PERIOD.toString())

    if (issuerParam) {
      issuer = issuerParam
    }

    if (!secret) {
      throw new Error('Secret not found in URL')
    }

    const currentCode = TOTPService.generate(secret, algorithm, digits, period)

    return {
      issuer,
      account,
      secret,
      algorithm,
      digits,
      period,
      currentCode,
      otpauthUrl: url
    }
  }
}