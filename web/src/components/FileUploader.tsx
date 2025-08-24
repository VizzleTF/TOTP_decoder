import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
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
    <Card className="mb-8">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          'hover:border-blue-400 hover:bg-blue-900/20',
          {
            'border-blue-400 bg-blue-900/20': isDragActive,
            'border-gray-600': !isDragActive,
            'pointer-events-none opacity-50': loading
          }
        )}
      >
        <input {...getInputProps()} />
        <Upload className={clsx(
          'w-12 h-12 mx-auto mb-4 transition-colors',
          isDragActive ? 'text-blue-500' : 'text-gray-400'
        )} />
        <p className="text-lg font-medium text-gray-200 mb-2">
          {isDragActive ? 'Drop here' : 'Drag image or click to select'}
        </p>
        <p className="text-sm text-gray-400 mb-2">
          Supports PNG, JPG, GIF, BMP, WebP
        </p>
        <p className="text-xs text-gray-500">
          Or paste from clipboard (Ctrl+V)
        </p>
      </div>
    </Card>
  )
}