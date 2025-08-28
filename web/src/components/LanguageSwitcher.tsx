import React from 'react'
import { Globe } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { Button } from './ui/Button'

export const LanguageSwitcher: React.FC = () => {
  const { t, changeLanguage, currentLanguage } = useI18n()

  const languages = [
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'ru', name: t('language.russian'), flag: '🇷🇺' }
  ]

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2"
        title={t('language.switch')}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLang.flag}</span>
      </Button>
      
      <div className="absolute right-0 top-full mt-2 w-48 glass-card-strong rounded-xl shadow-large opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                currentLanguage === lang.code
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}