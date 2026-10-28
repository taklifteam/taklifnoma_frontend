import { useTranslation } from 'react-i18next'
import { Alert } from './Alert'
import { Button } from './Button'
import s from './LoadError.module.css'

/** Ma'lumot yuklanmadi (tarmoq, server): xabar va "Qayta urinish". */
export function LoadError({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div className={s.box}>
      <Alert>{message ?? t('errors.network')}</Alert>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  )
}
