import { useEffect } from 'react'
import { ClipboardService } from '../services/ClipboardService'

/** Page-wide paste: images go to onFile, plain text to onText. */
export function usePasteListener(
  onFile: (file: File) => void,
  onText: (text: string) => void
) {
  useEffect(
    () => ClipboardService.setupPasteListener(onFile, onText),
    [onFile, onText]
  )
}
