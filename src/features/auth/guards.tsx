import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation, type Location } from 'react-router'
import { PageLoader } from '@/shared/ui'
import { useAuth } from './useAuth'

/** Faqat tizimga kirganlar uchun. Kirmagan bo'lsa — /login, qaytish manzili eslab qolinadi. */
export function RequireAuth() {
  const { t } = useTranslation()
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') return <PageLoader label={t('common.loading')} />
  if (auth.status === 'guest') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

/** Kirish va ro'yxatdan o'tish sahifalari: kirgan foydalanuvchi qaytgan joyiga yoki bosh sahifaga ketadi. */
export function GuestOnly() {
  const { t } = useTranslation()
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') return <PageLoader label={t('common.loading')} />
  if (auth.status === 'authenticated') {
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={from ? from.pathname + from.search : '/'} replace />
  }
  return <Outlet />
}
