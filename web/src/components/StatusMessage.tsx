import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { AppError } from '../types/core'
import { Card } from './ui/Card'

interface LoadingProps {
  loading: boolean
}

export const Loading: React.FC<LoadingProps> = ({ loading }) => {
  if (!loading) return null

  return (
    <Card className="text-center mb-8 scale-in" variant="glass">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full blur-lg opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 p-4 rounded-full shadow-large">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        Decoding QR Code
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Analyzing your image with advanced algorithms...
      </p>
      
      <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </Card>
  )
}

interface ErrorProps {
  error: AppError | null
}

export const Error: React.FC<ErrorProps> = ({ error }) => {
  if (!error) return null

  return (
    <Card variant="error" className="mb-8 scale-in">
      <div className="flex items-start space-x-4">
        <div className="bg-gradient-to-br from-error-500 to-error-600 p-3 rounded-xl shadow-soft flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-error-800 mb-2">
            Decoding Failed
          </h3>
          <p className="text-error-700 leading-relaxed">
            {error.message}
          </p>
          <div className="mt-4 p-3 bg-error-50 rounded-lg border border-error-200">
            <p className="text-sm text-error-600">
              💡 <strong>Tip:</strong> Make sure your image contains a clear QR code and try again.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}