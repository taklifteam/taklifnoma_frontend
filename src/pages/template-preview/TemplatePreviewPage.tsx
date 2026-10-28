import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useTemplates } from '@/features/invitations'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { asLocale } from '@/shared/i18n'
import { LoadError, PageLoader } from '@/shared/ui'
import { TemplateView } from '@/templates'
import { SAMPLE_TIMEZONE, sampleEventAt } from '@/templates/lib/eventDate'
import s from './TemplatePreviewPage.module.css'

/** Andoza namunasi: /preview/sochqi-konvert — default_content bilan, namuna sana va joy. */
export function TemplatePreviewPage() {
  const { templateCode = '' } = useParams()
  const { t, i18n } = useTranslation()
  const { data, isPending, error, refetch } = useTemplates()
  const [eventAt] = useState(() => sampleEventAt())

  if (isPending) return <PageLoader label={t('common.loading')} />
  const template = data?.find((tpl) => tpl.code === templateCode)
  if (error) return <main><LoadError onRetry={() => void refetch()} /></main>
  if (!template) return <NotFoundPage />

  const locale = asLocale(i18n.language)
  const name = template.name[locale] || template.name['uz-Latn'] || template.code
  return (
    <main>
      <title>{`${name} · Taklifnoma`}</title>
      <p className={s.badge}>{t('invitation.sampleBadge')}</p>
      <TemplateView
        rendererKey={template.renderer_key}
        content={template.default_content}
        title=""
        eventAt={eventAt}
        timezone={SAMPLE_TIMEZONE}
        venue={{ name: t('invitation.sampleVenueName'), address: t('invitation.sampleVenueAddress'), mapUrl: null }}
        locale={locale}
        mode="preview"
      />
    </main>
  )
}
