import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { PageLoader } from '@/shared/ui'
import { findTemplate } from './registry'
import type { TemplateProps } from './types'
import s from './TemplateView.module.css'

/** renderer_key bo'yicha andozani chizadi. Saytda hali yo'q dizayn (eski deploy) — tushunarli xabar. */
export function TemplateView({ rendererKey, ...props }: TemplateProps & { rendererKey: string }) {
  const { t } = useTranslation()
  const entry = findTemplate(rendererKey)
  if (!entry) {
    return (
      <div className={s.fallback} role="alert">
        {t('invitation.unknownTemplate', { lng: props.locale })}
      </div>
    )
  }
  const Component = entry.component
  return (
    <Suspense fallback={<PageLoader label={t('common.loading')} />}>
      <Component {...props} />
    </Suspense>
  )
}
