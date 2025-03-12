import { createI18n } from 'vue-i18n'
import en from './en'
import es from './es'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: navigator.language.split('-')[0],
  fallbackLocale: 'en',
  messages: { // translations
    en: en,
    es: es,
  },
})

export default i18n