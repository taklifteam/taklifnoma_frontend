import { useTranslation } from 'react-i18next'
import { LOCALES, setLocale } from '../i18n'
import { cn } from '../lib/cn'
import s from './LanguageSwitcher.module.css'

/** O‘zb / Ўзб / Рус. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  return (
    <div role="group" aria-label={t('lang.label')} className={cn(s.switcher, className)}>
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={i18n.language === locale}
          className={s.option}
          onClick={() => setLocale(locale)}
        >
          {t(`lang.${locale}`)}
        </button>
      ))}
    </div>
  )
}
