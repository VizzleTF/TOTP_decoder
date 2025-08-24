import { useState, useEffect } from 'react'
import { TOTPAccount, TimerState } from '../types/core'
import { getTimeLeft } from '../utils/time'
import { TOTPService } from '../services/TOTPService'

export function useTimer(accounts: TOTPAccount[]) {
  const [timers, setTimers] = useState<TimerState>({})

  useEffect(() => {
    if (!accounts.length) return

    // Initialize timers
    const initialTimers: TimerState = {}
    accounts.forEach((account, index) => {
      initialTimers[index] = getTimeLeft(account.period)
    })
    setTimers(initialTimers)

    // Update every second
    const interval = setInterval(() => {
      const newTimers: TimerState = {}
      let shouldUpdate = false

      accounts.forEach((account, index) => {
        const timeLeft = getTimeLeft(account.period)
        newTimers[index] = timeLeft
        
        if (timeLeft === account.period) {
          shouldUpdate = true
        }
      })

      setTimers(newTimers)

      // Update codes when timer resets
      if (shouldUpdate) {
        accounts.forEach(account => {
          account.currentCode = TOTPService.generate(
            account.secret,
            account.algorithm,
            account.digits,
            account.period
          )
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [accounts])

  return timers
}