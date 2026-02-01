import { useState, useEffect, useCallback } from "react";
import { TOTPAccount, TimerState } from "../types/core";
import { getTimeLeft } from "../utils/time";
import { TOTPService } from "../services/TOTPService";

export function useTimer(
  accounts: TOTPAccount[],
  onUpdateCodes?: (updatedAccounts: TOTPAccount[]) => void,
) {
  const [timers, setTimers] = useState<TimerState>({});

  const updateCodes = useCallback(() => {
    if (!onUpdateCodes || !accounts.length) return;

    const updatedAccounts = accounts.map((account) => ({
      ...account,
      currentCode: TOTPService.generate(
        account.secret,
        account.algorithm || "SHA-1",
        account.digits || 6,
        account.period || 30,
      ),
    }));

    onUpdateCodes(updatedAccounts);
  }, [accounts, onUpdateCodes]);

  useEffect(() => {
    if (!accounts.length) return;

    // Initialize timers
    const initialTimers: TimerState = {};
    accounts.forEach((account, index) => {
      initialTimers[index] = getTimeLeft(account.period || 30);
    });
    setTimers(initialTimers);

    // Update every second
    const interval = setInterval(() => {
      const newTimers: TimerState = {};
      let shouldUpdate = false;

      accounts.forEach((account, index) => {
        const timeLeft = getTimeLeft(account.period || 30);
        newTimers[index] = timeLeft;

        if (timeLeft === (account.period || 30)) {
          shouldUpdate = true;
        }
      });

      setTimers(newTimers);

      // Update codes when timer resets
      if (shouldUpdate) {
        updateCodes();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [accounts, updateCodes]);

  return timers;
}
