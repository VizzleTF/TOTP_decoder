import { TOTP } from 'totp-generator'
import { DEFAULT_ALGORITHM, DEFAULT_DIGITS, DEFAULT_PERIOD } from '../utils/constants'

type TOTPAlgorithm = NonNullable<NonNullable<Parameters<typeof TOTP.generate>[1]>['algorithm']>

/** "SHA1" and "SHA-1" both name the same hash; each consumer wants one spelling. */
const hashNumber = (algorithm: string) => algorithm.toUpperCase().replace(/^SHA-?/, '')

export class TOTPService {
    /** Throws when the secret is not valid Base32, so the caller reports it instead of showing a fake code. */
    static generate(
        secret: string,
        algorithm: string = DEFAULT_ALGORITHM,
        digits: number = DEFAULT_DIGITS,
        period: number = DEFAULT_PERIOD
    ): string {
        // Some services group the secret with spaces or dashes
        const { otp } = TOTP.generate(secret.replace(/[\s-]/g, ''), {
            algorithm: `SHA-${hashNumber(algorithm)}` as TOTPAlgorithm,
            digits,
            period
        })
        return otp
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
            ...(issuer && { issuer }),
            // The Key URI format spells it without a dash
            algorithm: `SHA${hashNumber(algorithm)}`,
            digits: digits.toString(),
            period: period.toString()
        })

        return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`
    }
}
