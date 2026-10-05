import { useTranslation } from 'react-i18next'
import { LoginForm } from '@/features/auth'

export function LoginPage() {
  const { t } = useTranslation()
  return (
    <>
      <title>{`${t('auth.login.title')} · Taklifnoma`}</title>
      <LoginForm />
    </>
  )
}
