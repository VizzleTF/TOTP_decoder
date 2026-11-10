import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ClipboardService } from '../services/ClipboardService'

const COPIED_RESET_MS = 2000
// One toast slot: repeated copies replace the toast instead of stacking
const TOAST_ID = 'clipboard'

/** Copies text, reports the outcome in a toast and marks the copied element for 2 seconds. */
export function useCopy() {
  const { t } = useTranslation()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const resetTimer = useRef<number | undefined>(undefined)

  const copy = useCallback(async (text: string, id: string) => {
    if (!(await ClipboardService.copy(text))) {
      toast.error(t('clipboard.failed'), { id: TOAST_ID })
      return
    }
    toast.success(t('clipboard.copied'), { id: TOAST_ID })
    setCopiedId(id)
    // A pending reset from the previous copy would clear this mark early
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopiedId(null), COPIED_RESET_MS)
  }, [t])

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  return { copiedId, copy }
}
