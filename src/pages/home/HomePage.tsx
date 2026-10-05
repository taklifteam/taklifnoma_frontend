import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth'
import { Button, Rings } from '@/shared/ui'
import s from './HomePage.module.css'

/** Kabinet bosh sahifasi. Taklifnomalar ro'yxati keyingi bosqichda — hozircha bo'sh holat. */
export function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className={s.page}>
      <title>{`${t('cabinet.emptyTitle')} · Taklifnoma`}</title>
      <h1 className={s.greeting}>{t('cabinet.greeting', { name: user?.full_name ?? '' })}</h1>
      <section className={s.empty}>
        <Rings className={s.rings} />
        <div className={s.emptyText}>
          <h2 className={s.emptyTitle}>{t('cabinet.emptyTitle')}</h2>
          <p className={s.muted}>{t('cabinet.emptyText')}</p>
          <div className={s.cta}>
            <Button disabled>{t('cabinet.create')}</Button>
            <span className={s.soon}>{t('cabinet.soon')}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
