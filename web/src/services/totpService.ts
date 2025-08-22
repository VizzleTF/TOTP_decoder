import { TOTPAccount, TimerState } from '../types'
import TOTPDecoder from '../totpDecoder'

export class TOTPService {
  private decoder: TOTPDecoder

  constructor() {
    this.decoder = new TOTPDecoder()
  }

  /**
   * Вычисляет оставшееся время до следующего обновления TOTP кода
   */
  calculateTimeLeft(period = 30): number {
    const now = Math.floor(Date.now() / 1000)
    return period - (now % period)
  }

  /**
   * Инициализирует таймеры для всех аккаунтов
   */
  initializeTimers(accounts: TOTPAccount[]): TimerState {
    const timers: TimerState = {}
    accounts.forEach((account, index) => {
      const period = account.period || 30
      timers[index] = this.calculateTimeLeft(period)
    })
    return timers
  }

  /**
   * Обновляет таймеры для всех аккаунтов
   */
  updateTimers(accounts: TOTPAccount[]): { timers: TimerState; shouldUpdateCodes: boolean } {
    const timers: TimerState = {}
    let shouldUpdateCodes = false

    accounts.forEach((account, index) => {
      const period = account.period || 30
      const timeLeft = this.calculateTimeLeft(period)
      timers[index] = timeLeft

      // Проверяем, нужно ли обновить коды для этого аккаунта
      if (timeLeft === period) {
        shouldUpdateCodes = true
      }
    })

    return { timers, shouldUpdateCodes }
  }

  /**
   * Обновляет TOTP коды для всех аккаунтов
   */
  updateTOTPCodes(accounts: TOTPAccount[]): TOTPAccount[] {
    return accounts.map(account => ({
      ...account,
      current_code: this.decoder.generateTOTPCode(
        account.secret,
        account.algorithm,
        account.digits,
        account.period
      )
    }))
  }

  /**
   * Обрабатывает файл и возвращает результат декодирования
   */
  async processFile(file: File) {
    return await this.decoder.processFile(file)
  }
}

export const totpService = new TOTPService()