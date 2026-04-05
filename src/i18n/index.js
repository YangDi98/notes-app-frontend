import { en, zhHans } from 'vuetify/locale'
import { createI18n } from 'vue-i18n'
import enLocale from './locales/en.json'
import zhHansLocale from './locales/zhHans.json'

export const messages = {
  en: {
    ...enLocale,
    $vuetify: {
      ...en,
    },
  },
  zhHans: {
    ...zhHansLocale,
    $vuetify: {
      ...zhHans,
    },
  },
}

const i18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: 'zhHans',
  fallbackLocale: 'en',
  messages,
})

export default i18n
