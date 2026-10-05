import { useTranslation } from 'react-i18next'
import { RegisterForm } from '@/features/auth'

export function RegisterPage() {
  const { t } = useTranslation()
  return (
    <>
      <title>{`${t('auth.register.title')} · Taklifnoma`}</title>
      <RegisterForm />
    </>
  )
}
