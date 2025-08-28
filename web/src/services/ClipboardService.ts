import { TFunction } from 'react-i18next'

export class ClipboardService {
    static async copy(text: string, t?: TFunction): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(text)
            if (t) {
                // Could show toast notification here
                console.log(t('clipboard.copied'))
            }
            return true
        } catch {
            if (t) {
                console.error(t('clipboard.failed'))
            }
            return false
        }
    }

    static async handlePaste(event: ClipboardEvent): Promise<File | null> {
        const items = event.clipboardData?.items
        if (!items) return null

        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                return item.getAsFile()
            }
        }

        return null
    }

    static setupPasteListener(callback: (file: File) => void): () => void {
        const handler = async (e: ClipboardEvent) => {
            const file = await this.handlePaste(e)
            if (file) callback(file)
        }

        document.addEventListener('paste', handler)
        return () => document.removeEventListener('paste', handler)
    }
}