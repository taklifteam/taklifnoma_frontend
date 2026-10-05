import i18n, { type TFunction } from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru.json'
import uzCyrl from './locales/uz-Cyrl.json'
import uzLatn from './locales/uz-Latn.json'

export const LOCALES = ['uz-Latn', 'uz-Cyrl', 'ru'] as const
export type Locale = (typeof LOCALES)[number]

const STORAGE_KEY = 'taklifnoma.locale'

function savedLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale
  } catch {
    // localStorage yopiq — standart til
  }
  return 'uz-Latn'
}

void i18n.use(initReactI18next).init({
  resources: {
    'uz-Latn': { translation: uzLatn },
    'uz-Cyrl': { translation: uzCyrl },
    ru: { translation: ru },
  },
  lng: savedLocale(),
  fallbackLng: 'uz-Latn',
  interpolation: { escapeValue: false }, // React o'zi ekranlaydi
})

document.documentElement.lang = i18n.language
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    // saqlanmasa, keyingi safar standart til ochiladi
  }
})

export function setLocale(locale: Locale): void {
  void i18n.changeLanguage(locale)
}

/**
 * Backend yoki forma xato kodini matnga aylantiradi. Avval maydonga xos matn
 * (errors.password.too_short), bo'lmasa umumiysi (errors.too_short).
 */
export function errorText(t: TFunction, code: string, field?: string): string {
  const keys = field ? [`errors.${field}.${code}`, `errors.${code}`] : [`errors.${code}`]
  return t([...keys, 'errors.unknown'])
}

export { i18n }
