import { TOTPAccount } from '../types/core'
import { TOTPService } from '../services/TOTPService'
import { DEFAULT_ALGORITHM, DEFAULT_DIGITS, DEFAULT_PERIOD } from '../utils/constants'

export class StandardParser {
  static parse(url: string): TOTPAccount {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.substring(1).split(':')

    let issuer = ''
    let account = ''

    if (pathParts.length === 2) {
      issuer = decodeURIComponent(pathParts[0])
      account = decodeURIComponent(pathParts[1])
    } else {
      account = decodeURIComponent(pathParts[0])
    }

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