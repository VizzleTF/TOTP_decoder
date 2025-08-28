import { useTranslation } from 'react-i18next'

export function useI18n() {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const formatNumber = (value: number, locale?: string) => {
    return new Intl.NumberFormat(locale || i18n.language).format(value)
  }

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions, locale?: string) => {
    return new Intl.DateTimeFormat(locale || i18n.language, options).format(date)
  }

  const formatRelativeTime = (value: number, unit: Intl.RelativeTimeFormatUnit, locale?: string) => {
    return new Intl.RelativeTimeFormat(locale || i18n.language, { numeric: 'auto' }).format(value, unit)
  }

  const isRTL = () => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur']
    return rtlLanguages.includes(i18n.language)
  }

  return {
    t,
    changeLanguage,
    formatNumber,
    formatDate,
    formatRelativeTime,
    isRTL,
    currentLanguage: i18n.language,
    languages: i18n.languages
  }
}