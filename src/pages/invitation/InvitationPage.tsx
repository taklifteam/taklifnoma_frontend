import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { usePublicInvitation } from '@/features/invitations'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { isApiError } from '@/shared/api'
import { asLocale } from '@/shared/i18n'
import { PageLoader } from '@/shared/ui'
import { TemplateView, useDocumentLang } from '@/templates'
import s from './InvitationPage.module.css'

// Havola formati — backend'dagi invitations.slug CHECK bilan bir xil.
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Mehmon sahifasi: taklifnomani yuborilgan havola (/k7mx2qvd) orqali ochadi. Kirish talab qilinmaydi. */
export function InvitationPage() {
  const { slug = '' } = useParams()
  if (!SLUG_RE.test(slug)) return <InvitationNotFound />
  return <Invitation slug={slug} />
}

function Invitation({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { data, error, isPending, refetch, isRefetching } = usePublicInvitation(slug)
  const locale = data ? asLocale(data.locale) : undefined
  useDocumentLang(locale)

  if (isPending) return <PageLoader label={t('common.loading')} />
  if (error) {
    if (isApiError(error) && error.status === 404) return <InvitationNotFound />
    return (
      <main className={s.error}>
        <p role="alert">{t('invitation.loadError')}</p>
        <button type="button" className={s.retry} onClick={() => void refetch()} disabled={isRefetching}>
          {t('invitation.retry')}
        </button>
      </main>
    )
  }

  const names = [data.content.groom, data.content.bride].filter(Boolean).join(' & ')
  return (
    <main>
      <title>{t('invitation.pageTitle', { names: data.title || names, lng: locale })}</title>
      <TemplateView
        rendererKey={data.renderer_key}
        content={data.content}
        title={data.title}
        eventAt={data.event_at}
        timezone={data.timezone}
        venue={{ name: data.venue_name, address: data.venue_address, mapUrl: data.map_url ?? null }}
        locale={locale!}
        mode="guest"
        slug={data.slug}
      />
    </main>
  )
}

function InvitationNotFound() {
  const { t } = useTranslation()
  return <NotFoundPage title={t('invitation.notFoundTitle')} text={t('invitation.notFoundText')} />
}
