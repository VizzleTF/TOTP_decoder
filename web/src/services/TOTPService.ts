import { TOTP } from 'totp-generator'
import { DEFAULT_ALGORITHM, DEFAULT_DIGITS, DEFAULT_PERIOD } from '../utils/constants'

export class TOTPService {
    static generate(
        secret: string,
        algorithm: string = 'SHA-1',
        digits: number = DEFAULT_DIGITS,
        period: number = DEFAULT_PERIOD
    ): string {
        try {
            // Normalize algorithm name for totp-generator
            let normalizedAlgorithm = algorithm
            if (algorithm === 'SHA1') normalizedAlgorithm = 'SHA-1'
            if (algorithm === 'SHA256') normalizedAlgorithm = 'SHA-256'
            if (algorithm === 'SHA512') normalizedAlgorithm = 'SHA-512'

            const { otp } = TOTP.generate(secret, {
                algorithm: normalizedAlgorithm as any,
                digits,
                period
            })
            return otp
        } catch (error) {
            console.error('TOTP generation failed:', error, { secret, algorithm, digits, period })
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