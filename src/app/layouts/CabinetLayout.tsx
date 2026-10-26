import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'
import { useAuth, useLogout } from '@/features/auth'
import { Button, LanguageSwitcher, Logo } from '@/shared/ui'
import s from './CabinetLayout.module.css'

/** Mijoz kabineti: tepada logo, til, foydalanuvchi va chiqish. */
export function CabinetLayout() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const logout = useLogout()

  return (
    <div className={s.page}>
      <a className="skipLink" href="#main-content">{t('common.skipToContent')}</a>
      <header className={s.header}>
        <div className={s.bar}>
          <Link to="/" className={s.home}>
            <Logo />
          </Link>
          <div className={s.actions}>
            <LanguageSwitcher />
            {user ? <span className={s.user}>{user.full_name}</span> : null}
            <Button variant="secondary" loading={logout.isPending} onClick={() => logout.mutate()}>
              {t('cabinet.logout')}
            </Button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className={s.main}>
        <Outlet />
      </main>
    </div>
  )
}
