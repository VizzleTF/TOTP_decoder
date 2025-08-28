import React from 'react'
import { QrCode, Sparkles } from 'lucide-react'
import { Trans } from 'react-i18next'
import { useI18n } from '../hooks/useI18n'
import { LanguageSwitcher } from './LanguageSwitcher'

export const Header: React.FC = () => (
  <div className="mb-20 fade-in">
    <div className="flex justify-end mb-8">
      <LanguageSwitcher />
    </div>
    
    <HeaderContent />
  </div>
)

const HeaderContent: React.FC = () => {
  const { t } = useI18n()
  
  return (
    <div className="text-center">
    <div className="flex items-center justify-center mb-8 floating-animation">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-40"></div>
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-5 rounded-3xl shadow-large">
          <QrCode className="w-10 h-10 text-white" />
        </div>
      </div>
      <Sparkles className="w-6 h-6 text-blue-500 dark:text-blue-400 ml-4 animate-pulse" />
    </div>
    
    <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text-primary leading-tight">
      {t('app.title')}
    </h1>
    
    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
      <Trans
        i18nKey="app.description"
        components={{
          security: <span className="font-semibold text-blue-600 dark:text-blue-400" />,
          privacy: <span className="font-semibold text-purple-600 dark:text-purple-400" />
        }}
        values={{
          security: t('app.security'),
          privacy: t('app.privacy')
        }}
      />
    </p>
    
    <div className="flex items-center justify-center mt-8 space-x-8 text-sm text-slate-500 dark:text-slate-400">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
        {t('header.clientSide')}
      </div>
      <div className="flex items-center">
        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
        {t('header.noDataSent')}
      </div>
    </div>
    </div>
  )
}