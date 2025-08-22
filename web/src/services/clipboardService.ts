export class ClipboardService {
  /**
   * Копирует текст в буфер обмена
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err)
      return false
    }
  }

  /**
   * Обрабатывает событие вставки из буфера обмена
   */
  async handlePasteEvent(event: ClipboardEvent): Promise<File | null> {
    const items = event.clipboardData?.items
    if (!items) return null

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          return file
        }
      }
    }

    return null
  }

  /**
   * Устанавливает обработчик события вставки
   */
  setupPasteListener(onPaste: (file: File) => void): () => void {
    const handlePaste = async (e: ClipboardEvent) => {
      const file = await this.handlePasteEvent(e)
      if (file) {
        onPaste(file)
      }
    }

    document.addEventListener('paste', handlePaste)
    
    // Возвращаем функцию для удаления обработчика
    return () => document.removeEventListener('paste', handlePaste)
  }
}

export const clipboardService = new ClipboardService()