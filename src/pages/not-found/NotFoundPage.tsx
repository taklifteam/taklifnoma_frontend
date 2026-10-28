import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { SochqiScene } from '@/shared/ui'
import s from './NotFoundPage.module.css'

type Props = {
  /** boshqa matn (masalan, taklifnoma topilmadi); berilmasa — "Sahifa topilmadi" */
  title?: string
  text?: string
}

export function NotFoundPage({ title, text }: Props) {
  const { t } = useTranslation()
  const heading = title ?? t('notFound.title')
  return (
    <main className={s.page}>
      <title>{`${heading} · Taklifnoma`}</title>
      <SochqiScene />
      <div className={s.content}>
        <h1 className={s.title}>{heading}</h1>
        <p className={s.text}>{text ?? t('notFound.text')}</p>
        <Link to="/" className={s.link}>
          {t('notFound.home')}
        </Link>
      </div>
    </main>
  )
}
