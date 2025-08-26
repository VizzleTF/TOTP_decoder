import { useState } from 'react'
import { DecodingResult, AppError } from '../types/core'
import { QRDecoder } from '../core/QRDecoder'

export function useQRDecoder() {
  const [result, setResult] = useState<DecodingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const decoder = new QRDecoder()

  const decode = async (file: File) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const result = await decoder.decode(file)
      setResult(result)
      
      // Автоскролл к результатам
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section')
        if (resultsSection) {
          resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 100)
    } catch (err) {
      setError(err as AppError)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, decode }
}