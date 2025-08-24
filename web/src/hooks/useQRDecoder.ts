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
    } catch (err) {
      setError(err as AppError)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, decode }
}