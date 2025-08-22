import React from 'react'
import { AlertCircle } from 'lucide-react'

interface LoadingMessageProps {
  loading: boolean
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({ loading }) => {
  if (!loading) return null

  return (
    <div className="card text-center animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <p className="text-gray-300">Processing QR code...</p>
    </div>
  )
}

interface ErrorMessageProps {
  error: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null

  return (
    <div className="card border-red-600 bg-red-900/20 animate-slide-up">
      <div className="flex items-center mb-2">
        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
        <h3 className="font-medium text-red-300">Error</h3>
      </div>
      <p className="text-red-200">{error}</p>
    </div>
  )
}