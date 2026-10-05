import { useTranslation } from 'react-i18next'
import { PageLoader } from '@/shared/ui'

/** Sahifa bo'lagi (lazy route) birinchi marta yuklanayotganda ko'rinadi. */
export function AppLoader() {
  const { t } = useTranslation()
  return <PageLoader label={t('common.loading')} />
}
