import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { InvitationWizard, isEditable, useCategories, useInvitation } from '@/features/invitations'
import { isApiError } from '@/shared/api'
import { EmptyState, LoadError, PageLoader } from '@/shared/ui'

export function EditInvitationPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const invitation = useInvitation(id)
  const categories = useCategories()

  const backLink = <Link to="/">{t('wizard.toList')}</Link>
  let body
  if (invitation.isPending || categories.isPending) body = <PageLoader label={t('common.loading')} />
  else if (isApiError(invitation.error) && invitation.error.status === 404)
    body = <EmptyState title={t('wizard.notFound')} action={backLink} />
  else if (invitation.error || categories.error)
    body = <LoadError onRetry={() => void Promise.all([invitation.refetch(), categories.refetch()])} />
  else if (!isEditable(invitation.data.status))
    body = <EmptyState title={t('wizard.lockedTitle')} text={t('wizard.lockedText')} action={backLink} />
  else body = <InvitationWizard key={invitation.data.id} mode="edit" invitation={invitation.data} categories={categories.data} />

  return (
    <>
      <title>{`${t('wizard.editTitle')} · Taklifnoma`}</title>
      {body}
    </>
  )
}
