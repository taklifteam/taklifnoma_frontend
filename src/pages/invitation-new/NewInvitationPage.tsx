import { useTranslation } from 'react-i18next'
import { InvitationWizard, useCategories, useTemplates } from '@/features/invitations'
import { EmptyState, LoadError, PageLoader } from '@/shared/ui'

export function NewInvitationPage() {
  const { t } = useTranslation()
  const templates = useTemplates()
  const categories = useCategories()

  return (
    <>
      <title>{`${t('wizard.createTitle')} · Taklifnoma`}</title>
      {templates.isPending || categories.isPending ? (
        <PageLoader label={t('common.loading')} />
      ) : templates.error || categories.error ? (
        <LoadError onRetry={() => void Promise.all([templates.refetch(), categories.refetch()])} />
      ) : templates.data.length === 0 ? (
        <EmptyState title={t('wizard.noTemplates')} />
      ) : (
        <InvitationWizard mode="create" templates={templates.data} categories={categories.data} />
      )}
    </>
  )
}
