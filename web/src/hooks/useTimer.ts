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
      initialTimers[index] = getTimeLeft(account.period || 30)
    })
    setTimers(initialTimers)

    // Update every second
    const interval = setInterval(() => {
      const newTimers: TimerState = {}
      let shouldUpdate = false

      accounts.forEach((account, index) => {
        const timeLeft = getTimeLeft(account.period || 30)
        newTimers[index] = timeLeft
        
        if (timeLeft === (account.period || 30)) {
          shouldUpdate = true
        }
      })

      setTimers(newTimers)

      // Update codes when timer resets
      if (shouldUpdate) {
        accounts.forEach(account => {
          account.currentCode = TOTPService.generate(
            account.secret,
            account.algorithm || 'SHA1',
            account.digits || 6,
            account.period || 30
          )
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [accounts])

  return timers
}