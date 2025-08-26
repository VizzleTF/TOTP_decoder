import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image, Zap } from 'lucide-react'
import clsx from 'clsx'
import { Card } from './ui/Card'
import { SUPPORTED_IMAGE_TYPES } from '../utils/constants'

interface FileUploaderProps {
  onUpload: (file: File) => void
  loading: boolean
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, loading }) => {
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
    <div className="mb-12 scale-in">
      <Card
        className={clsx(
          'transition-all duration-300 cursor-pointer group',
          {
            'border-primary-300 bg-gradient-to-br from-primary-50 to-primary-100/50 shadow-glow': isDragActive,
            'hover:border-primary-200 hover:shadow-medium hover:-translate-y-1': !loading && !isDragActive,
            'opacity-60 cursor-not-allowed': loading
          }
        )}
        variant={isDragActive ? 'glass' : 'default'}
      >
        <div
          {...getRootProps()}
          className="text-center py-12"
        >
          <input {...getInputProps()} />
          
          <div className="relative mb-6">
            <div className={clsx(
              'mx-auto w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
              {
                'bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow': isDragActive,
                'bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-primary-100 group-hover:to-primary-200': !isDragActive && !loading,
                'bg-slate-100': loading
              }
            )}>
              {loading ? (
                <div className="w-8 h-8 border-3 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className={clsx(
                  'w-8 h-8 transition-all duration-300',
                  {
                    'text-white': isDragActive,
                    'text-slate-500 group-hover:text-primary-600': !isDragActive
                  }
                )} />
              )}
            </div>
            
            {isDragActive && (
              <div className="absolute -inset-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl opacity-20 blur-xl animate-pulse"></div>
            )}
          </div>



          <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg leading-relaxed">
            {loading ? (
              'Decoding your QR code with precision...'
            ) : isDragActive ? (
              'Release to decode your QR code instantly'
            ) : (
              'Drag & drop your QR code image or click to browse'
            )}
          </p>

          <div className="flex items-center justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center">
              <Image className="w-4 h-4 mr-2" />
              PNG, JPG, WebP
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Instant Processing
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-400 dark:text-slate-500">
            💡 Pro tip: You can also paste images with <kbd className="px-2 py-1 bg-slate-100 rounded font-mono">Ctrl+V</kbd>
          </div>
        </div>
      </Card>
    </div>
  )
}