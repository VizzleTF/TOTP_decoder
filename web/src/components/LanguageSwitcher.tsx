import React from 'react'
import clsx from 'clsx'
import { useI18n } from '../hooks/useI18n'

const LANGUAGES = ['en', 'ru'] as const

export const LanguageSwitcher: React.FC = () => {
  const { t, changeLanguage, currentLanguage } = useI18n()

  return (
    <div
      className="flex items-center font-mono text-xs"
      role="group"
      aria-label={t('language.switch')}
    >
      {LANGUAGES.map((code, i) => (
        <React.Fragment key={code}>
          {i > 0 && <span className="mx-1 text-line-strong">/</span>}
          <button
            type="button"
            onClick={() => changeLanguage(code)}
            className={clsx(
              'px-1 py-1 uppercase tracking-[0.08em] transition-colors duration-150',
              currentLanguage === code
                ? 'text-ink'
                : 'text-ink-subtle hover:text-ink-muted'
            )}
          >
            {code}
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}
