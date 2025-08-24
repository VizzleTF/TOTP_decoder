import React from 'react'
import { AlertCircle } from 'lucide-react'
import { AppError } from '../types/core'
import { Card } from './ui/Card'

interface LoadingProps {
  loading: boolean
}

export const Loading: React.FC<LoadingProps> = ({ loading }) => {
  if (!loading) return null

  return (
    <Card className="text-center animate-fade-in">
      <div className="flex justify-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
      <p className="text-gray-300">Processing QR code...</p>
    </Card>
  )
}

interface ErrorProps {
  error: AppError | null
}

export const Error: React.FC<ErrorProps> = ({ error }) => {
  if (!error) return null

  return (
    <Card variant="error" className="animate-slide-up">
      <div className="flex items-center mb-2">
        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
        <h3 className="font-medium text-red-300">Error</h3>
      </div>
      <p className="text-red-200">{error.message}</p>
    </Card>
  )
}