import { useState, useEffect, useCallback } from 'react'
import { clipboardService } from '../services/clipboardService'

export const useClipboard = (onPaste?: (file: File) => void) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  // Копирование в буфер обмена
  const copyToClipboard = useCallback(async (text: string, index: string) => {
    const success = await clipboardService.copyToClipboard(text)
    if (success) {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }, [])

  // Обработка вставки из буфера обмена
  useEffect(() => {
    if (!onPaste) return

    const cleanup = clipboardService.setupPasteListener(onPaste)
    return cleanup
  }, [onPaste])

  return {
    copiedIndex,
    copyToClipboard
  }
}