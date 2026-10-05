import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { SochqiScene } from '@/shared/ui'
import s from './NotFoundPage.module.css'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <main className={s.page}>
      <title>{`${t('notFound.title')} · Taklifnoma`}</title>
      <SochqiScene />
      <div className={s.content}>
        <h1 className={s.title}>{t('notFound.title')}</h1>
        <p className={s.text}>{t('notFound.text')}</p>
        <Link to="/" className={s.link}>
          {t('notFound.home')}
        </Link>
      </div>
    </main>
  )
}
