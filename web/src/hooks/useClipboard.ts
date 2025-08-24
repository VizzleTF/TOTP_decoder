import { useState, useEffect } from 'react'
import { ClipboardService } from '../services/ClipboardService'

export function useClipboard(onPaste?: (file: File) => void) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = async (text: string, id: string) => {
    const success = await ClipboardService.copy(text)
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