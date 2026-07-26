import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { AppError } from '../types/core'
import { useI18n } from '../hooks/useI18n'

interface LoadingProps {
  loading: boolean
}

export const Loading: React.FC<LoadingProps> = ({ loading }) => {
  const { t } = useI18n()

  if (!loading) return null

  return (
    <div className="reveal mb-12 flex items-center gap-3 text-ink-muted">
      <Loader2 className="h-4 w-4 animate-spin text-ink-subtle" />
      <span className="text-sm">{t('status.decoding')}</span>
    </div>
  )
}

interface ErrorProps {
  error: AppError | null
}

export const Error: React.FC<ErrorProps> = ({ error }) => {
  const { t } = useI18n()

  if (!error) return null

  return (
    <div className="reveal mb-12 rounded-xl border border-line bg-surface-1 p-5">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <div>
          <p className="mb-1 text-sm font-medium text-ink">
            {t('status.failed')}
          </p>
          <p className="text-sm leading-relaxed text-ink-muted">
            {error.message}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-subtle">
            {t('status.tip')}
          </p>
        </div>
      </div>
    </div>
  )
}
