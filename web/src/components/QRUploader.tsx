import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import clsx from 'clsx'

interface QRUploaderProps {
  onFileUpload: (file: File) => void
  loading: boolean
}

export const QRUploader: React.FC<QRUploaderProps> = ({ onFileUpload, loading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0])
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  })

  return (
    <div className="card mb-8">
      <div
        {...getRootProps()}
        className={clsx(
          'dropzone cursor-pointer',
          isDragActive && 'active',
          loading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <Upload className={clsx(
            'w-12 h-12 mb-4 transition-colors',
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          )} />
          <p className="text-lg font-medium text-gray-200 mb-2">
            {isDragActive ? 'Drop the file here' : 'Drag image here'}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            or click to select a file
          </p>
          <p className="text-xs text-gray-500">
            Supported: PNG, JPG, JPEG, GIF, BMP, WebP
          </p>
          <p className="text-xs text-gray-500 mt-1">
            You can also paste image from clipboard (Ctrl+V)
          </p>
        </div>
      </div>
    </div>
  )
}