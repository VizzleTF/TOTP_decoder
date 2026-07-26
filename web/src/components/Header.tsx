import React from 'react'
import { Trans } from 'react-i18next'
import { useI18n } from '../hooks/useI18n'
import { LanguageSwitcher } from './LanguageSwitcher'

export const Header: React.FC = () => (
  <header className="mb-16 md:mb-20">
    <nav className="mb-20 flex items-center justify-between md:mb-28">
      <a href="/" className="font-mono text-sm tracking-tight text-ink">
        totp<span className="text-ink-subtle">/</span>decoder
      </a>
      <LanguageSwitcher />
    </nav>
    <HeaderContent />
  </header>
)

const HeaderContent: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="reveal">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">
        {t('header.clientSide')}
        <span className="mx-2 text-line-strong">/</span>
        {t('header.noDataSent')}
      </p>

      <h1 className="mb-6 text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink md:text-6xl">
        {t('app.title')}
      </h1>

      <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
        <Trans
          i18nKey="app.description"
          components={{
            security: <span className="font-medium text-ink" />,
            privacy: <span className="font-medium text-ink" />
          }}
          values={{
            security: t('app.security'),
            privacy: t('app.privacy')
          }}
        />
      </p>
    </div>
  )
}
