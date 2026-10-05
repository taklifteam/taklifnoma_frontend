import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { errorText } from '@/shared/i18n'
import { Alert, Button, PasswordField, TextField } from '@/shared/ui'
import { useLogin } from '../api'
import { loginSchema, type LoginValues } from '../schema'
import s from './AuthForm.module.css'
import { ArrowIcon } from './ArrowIcon'
import { applyServerError } from './serverError'

export function LoginForm() {
  const { t } = useTranslation()
  const login = useLogin()
  const [bannerCode, setBannerCode] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: '', password: '' },
  })

  // Muvaffaqiyatli kirishda yo'naltirishni GuestOnly qiladi.
  const onSubmit = handleSubmit((values) => {
    setBannerCode(null)
    login.mutate(values, {
      onError: (error) => setBannerCode(applyServerError(error, setError)),
    })
  })

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      <div className={s.heading}>
        <h1 className={s.title}>{t('auth.login.title')}</h1>
        <p className={s.subtitle}>{t('auth.login.subtitle')}</p>
      </div>

      {bannerCode ? <Alert>{errorText(t, bannerCode)}</Alert> : null}

      <TextField
        label={t('auth.login.login')}
        placeholder={t('auth.login.loginPlaceholder')}
        autoComplete="username"
        error={errors.login?.message && errorText(t, errors.login.message, 'login')}
        {...register('login')}
      />
      <PasswordField
        label={t('auth.login.password')}
        autoComplete="current-password"
        showLabel={t('auth.showPassword')}
        hideLabel={t('auth.hidePassword')}
        error={errors.password?.message && errorText(t, errors.password.message, 'password')}
        {...register('password')}
      />

      <Button type="submit" fullWidth loading={login.isPending} trailingIcon={<ArrowIcon />}>
        {t('auth.login.submit')}
      </Button>

      <p className={s.switch}>
        {t('auth.login.noAccount')}
        <Link to="/royxat" className={s.switchLink}>
          {t('auth.login.toRegister')}
        </Link>
      </p>
    </form>
  )
}
