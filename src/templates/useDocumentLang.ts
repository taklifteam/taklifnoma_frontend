import { useEffect } from 'react'
import { i18n } from '@/shared/i18n'

/** Sahifa ochiq turganda <html lang> — taklifnoma tili (ekran o'quvchi va shrift uchun); yopilganda sayt tili. */
export function useDocumentLang(lang: string | undefined) {
  useEffect(() => {
    if (!lang) return
    document.documentElement.lang = lang
    return () => {
      document.documentElement.lang = i18n.language
    }
  }, [lang])
}
