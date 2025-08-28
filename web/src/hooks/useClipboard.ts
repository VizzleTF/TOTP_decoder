import { useState, useEffect } from 'react'
import { ClipboardService } from '../services/ClipboardService'
import { useI18n } from './useI18n'

export function useClipboard(onPaste?: (file: File) => void) {
  const { t } = useI18n()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = async (text: string, id: string) => {
    const success = await ClipboardService.copy(text, t)
    if (success) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  useEffect(() => {
    if (!onPaste) return
    return ClipboardService.setupPasteListener(onPaste)
  }, [onPaste])

  return { copiedId, copy }
}