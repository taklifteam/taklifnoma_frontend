import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'
import { LanguageSwitcher, Logo, Rings, SochqiScene } from '@/shared/ui'
import s from './AuthLayout.module.css'

/** Kirish va ro'yxatdan o'tish: orqada sochqi sahnasi, markazda uzukli karta ichida forma. */
export function AuthLayout() {
  const { t } = useTranslation()
  return (
    <div className={s.page}>
      <a className="skipLink" href="#main-content">{t('common.skipToContent')}</a>
      <SochqiScene className={s.scene} />
      <header className={s.header}>
        <Logo />
        <LanguageSwitcher />
      </header>
      <main id="main-content" tabIndex={-1} className={s.main}>
        <div className={s.card}>
          <Rings className={s.rings} />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
