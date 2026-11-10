import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AppError } from '@/types/core'

interface DecodeErrorProps {
  error: AppError | null
}

export function DecodeError({ error }: DecodeErrorProps) {
  const { t } = useTranslation()

  if (!error) return null

  return (
    <Alert className="reveal mb-12">
      <AlertTriangle />
      <AlertTitle>{t('status.failed')}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}
