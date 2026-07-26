import React from 'react'
import { useI18n } from '../hooks/useI18n'

export const Footer: React.FC = () => {
  const { t } = useI18n()

  return (
    <footer className="mt-24 flex items-center justify-between border-t border-line py-8 font-mono text-xs text-ink-subtle">
      <span>{t('footer.madeWith')}</span>
      <div className="flex items-center gap-5">
        <a
          href="https://www.buymeacoffee.com/vizzletf"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-150 hover:text-ink"
        >
          Coffee
        </a>
        <a
          href="https://boosty.to/vizzletf/donate"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-150 hover:text-ink"
        >
          Boosty
        </a>
        <a
          href="https://github.com/VizzleTF/TOTP_decoder"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-150 hover:text-ink"
        >
          {t('footer.viewSource')}
        </a>
      </div>
    </footer>
  )
}
