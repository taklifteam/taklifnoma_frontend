import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from '@/features/auth'
import {
  formatEventAt,
  isEditable,
  statusTone,
  useDeleteInvitation,
  useMyInvitations,
  useShareActions,
} from '@/features/invitations'
import type { ModelsInvitationResponse } from '@/shared/api'
import { isApiError } from '@/shared/api'
import { errorText } from '@/shared/i18n'
import { Badge, ConfirmDialog, LoadError, PageLoader, Rings, useToast } from '@/shared/ui'
import s from './HomePage.module.css'

/** Kabinet: "Mening taklifnomalarim" — kartochkalar va amallar. */
export function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data, isPending, error, refetch } = useMyInvitations()
  const [deleting, setDeleting] = useState<ModelsInvitationResponse>()
  const remove = useDeleteInvitation()
  const toast = useToast()

  function confirmDelete() {
    if (!deleting) return
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t('cabinet.deleted'))
        setDeleting(undefined)
      },
      onError: (e) => {
        toast.error(errorText(t, isApiError(e) ? e.code : 'unknown'))
        setDeleting(undefined)
      },
    })
  }

  return (
    <div className={s.page}>
      <title>{`${t('cabinet.title')} · Taklifnoma`}</title>
      <header className={s.header}>
        <div>
          <p className={s.muted}>{t('cabinet.greeting', { name: user?.full_name ?? '' })}</p>
          <h1 className={s.title}>{t('cabinet.title')}</h1>
        </div>
        {data && data.length > 0 ? (
          <Link to="/invitations/new" className={s.createLink}>
            {t('cabinet.create')}
          </Link>
        ) : null}
      </header>

      {isPending ? <PageLoader label={t('common.loading')} /> : null}

      {error ? (
        <LoadError message={t('cabinet.loadError')} onRetry={() => void refetch()} />
      ) : null}

      {data && data.length === 0 ? (
        <section className={s.empty}>
          <Rings className={s.rings} />
          <div className={s.emptyText}>
            <h2 className={s.emptyTitle}>{t('cabinet.emptyTitle')}</h2>
            <p className={s.muted}>{t('cabinet.emptyText')}</p>
            <div className={s.cta}>
              <Link to="/invitations/new" className={s.createLink}>
                {t('cabinet.create')}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {data && data.length > 0 ? (
        <ul className={s.list}>
          {data.map((inv) => (
            <li key={inv.id}>
              <InvitationCard invitation={inv} onDelete={() => setDeleting(inv)} />
            </li>
          ))}
        </ul>
      ) : null}

      <ConfirmDialog
        open={deleting !== undefined}
        title={t('cabinet.deleteTitle')}
        description={t('cabinet.deleteText', { title: deleting?.title ?? '' })}
        confirmLabel={t('cabinet.delete')}
        tone="danger"
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(undefined)}
      />
    </div>
  )
}

function InvitationCard({ invitation: inv, onDelete }: { invitation: ModelsInvitationResponse; onDelete: () => void }) {
  const { t } = useTranslation()
  const share = useShareActions()
  const published = inv.status === 'published'
  return (
    <article className={s.card}>
      <div className={s.cardHead}>
        <h2 className={s.cardTitle}>{inv.title}</h2>
        <Badge tone={statusTone(inv.status)}>{t(`status.${inv.status}`, { defaultValue: inv.status })}</Badge>
      </div>
      <p className={s.muted}>{formatEventAt(t, inv.event_at, inv.timezone)}</p>
      <p className={s.muted}>{inv.venue_name}</p>
      {published ? (
        <a className={s.url} href={inv.url} target="_blank" rel="noopener noreferrer">
          {inv.url.replace(/^https?:\/\//, '')}
        </a>
      ) : (
        <p className={s.hint}>{t(inv.status === 'draft' ? 'cabinet.draftHint' : 'cabinet.lockedHint')}</p>
      )}
      <div className={s.actions}>
        {isEditable(inv.status) ? (
          <Link to={`/invitations/${inv.id}/edit`} className={s.action}>
            {t('cabinet.edit')}
          </Link>
        ) : null}
        {published ? (
          <>
            <button type="button" className={s.action} onClick={() => void share.copy(inv)}>
              {t('cabinet.copy')}
            </button>
            <a className={s.action} href={share.telegramUrl(inv)} target="_blank" rel="noopener noreferrer">
              {t('cabinet.telegram')}
            </a>
            <a className={s.action} href={inv.url} target="_blank" rel="noopener noreferrer">
              {t('cabinet.open')}
            </a>
          </>
        ) : null}
        <button type="button" className={`${s.action} ${s.danger}`} onClick={onDelete}>
          {t('cabinet.delete')}
        </button>
      </div>
    </article>
  )
}
