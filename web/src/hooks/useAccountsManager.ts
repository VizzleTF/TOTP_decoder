import { useState, useEffect, useCallback } from 'react'
import { DecodingResult, TimerState } from '../types'
import { totpService } from '../services/totpService'

export const useAccountsManager = () => {
  const [result, setResult] = useState<DecodingResult | null>(null)
  const [accountTimers, setAccountTimers] = useState<TimerState>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // Обработка файла
  const processFile = useCallback(async (file: File) => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await totpService.processFile(file)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Автообновление TOTP кодов и таймеров
  useEffect(() => {
    if (!result || !result.accounts || result.accounts.length === 0) return

    // Инициализация таймеров
    const initialTimers = totpService.initializeTimers(result.accounts)
    setAccountTimers(initialTimers)

    // Обновление кодов и таймеров каждую секунду
    const interval = setInterval(() => {
      const { timers, shouldUpdateCodes } = totpService.updateTimers(result.accounts)
      setAccountTimers(timers)

      // Обновляем коды если необходимо
      if (shouldUpdateCodes) {
        setResult(prev => {
          if (!prev || !prev.accounts) return prev

          const updatedAccounts = totpService.updateTOTPCodes(prev.accounts)
          return {
            ...prev,
            accounts: updatedAccounts
          }
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [result?.qrType])

  return {
    result,
    accountTimers,
    loading,
    error,
    processFile
  }
}