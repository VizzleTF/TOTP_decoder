import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SUPPORTED_IMAGE_TYPES } from '@/utils/constants'

interface FileUploaderProps {
  onUpload: (file: File) => void
  loading: boolean
}

export function FileUploader({ onUpload, loading }: FileUploaderProps) {
  const { t } = useTranslation()

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onUpload(files[0])
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_IMAGE_TYPES,
    multiple: false,
    disabled: loading
  })

  const Icon = loading ? Loader2 : Upload

  return (
    <div
      {...getRootProps()}
      style={{ animationDelay: '60ms' }}
      className={cn(
        'reveal mb-12 cursor-pointer rounded-xl border-[1.5px] border-dashed border-line-strong bg-surface-1 px-6 py-12 text-center transition-colors duration-150 hover:border-ink-subtle',
        isDragActive &&
          'border-accent bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface-1))] hover:border-accent',
        loading && 'pointer-events-none border-line opacity-60'
      )}
    >
      <input {...getInputProps()} />

      <Icon
        className={cn(
          'mx-auto mb-5 size-5 text-ink-subtle transition-colors duration-150',
          loading && 'animate-spin',
          isDragActive && 'text-accent'
        )}
      />

      <p className="mb-5 font-medium text-ink">
        {loading
          ? t('uploader.processing')
          : isDragActive
            ? t('uploader.dragActive')
            : t('uploader.title')}
      </p>

      {/* No handler: the click bubbles to the dropzone root, which opens the picker */}
      <Button variant="outline" size="sm" disabled={loading} className="mb-5">
        {t('uploader.browse')}
      </Button>

      <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">
        {t('uploader.supportedFormats')}
        <span className="mx-2 text-line-strong">/</span>
        {t('uploader.tip')} <kbd className="normal-case">Ctrl+V</kbd>
      </p>
    </div>
  )
}
