import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translations
import en from './locales/en.json'
import ru from './locales/ru.json'

const resources = {
  en: { translation: en },
  ru: { translation: ru }
}

/**
 * Language comes from the URL path only — /ru/ serves the Russian build.
 * No LanguageDetector: localStorage or navigator overriding the path would
 * desync the rendered copy from the static <html lang> and hreflang tags.
 */
const lng = window.location.pathname.startsWith('/ru') ? 'ru' : 'en'

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false
    }
  })

export default i18n
