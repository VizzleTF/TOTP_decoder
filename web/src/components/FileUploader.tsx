import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { SUPPORTED_IMAGE_TYPES } from '../utils/constants'
import { useI18n } from '../hooks/useI18n'

interface FileUploaderProps {
  onUpload: (file: File) => void
  loading: boolean
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, loading }) => {
  const { t } = useI18n()

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onUpload(files[0])
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_IMAGE_TYPES,
    multiple: false,
    disabled: loading
  })

  return (
    <div className="reveal mb-12" style={{ animationDelay: '60ms' }}>
      <div
        {...getRootProps()}
        className={clsx(
          'cursor-pointer rounded-xl border-[1.5px] border-dashed transition-colors duration-150',
          {
            'border-accent bg-accent/[0.06]': isDragActive,
            'border-line-strong bg-surface-1 hover:border-ink-subtle': !isDragActive && !loading,
            'pointer-events-none border-line opacity-60': loading
          }
        )}
      >
        <div className="px-6 py-14 text-center">
          <input {...getInputProps()} />

          {loading ? (
            <Loader2 className="mx-auto mb-5 h-5 w-5 animate-spin text-ink-subtle" />
          ) : (
            <Upload
              className={clsx('mx-auto mb-5 h-5 w-5 transition-colors duration-150', {
                'text-accent': isDragActive,
                'text-ink-subtle': !isDragActive
              })}
            />
          )}

          <p className="mb-3 font-medium text-ink">
            {loading
              ? t('uploader.processing')
              : isDragActive
                ? t('uploader.dragActive')
                : t('uploader.title')}
          </p>

          <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">
            {t('uploader.supportedFormats')}
            <span className="mx-2 text-line-strong">/</span>
            {t('uploader.tip')} <kbd className="normal-case">Ctrl+V</kbd>
          </p>
        </div>
      </div>
    </div>
  )
}
