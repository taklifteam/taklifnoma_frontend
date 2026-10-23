import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { errorText } from '@/shared/i18n'
import { toApiPhone } from '@/shared/lib/phone'
import { Alert, Button, PasswordField, PhoneField, TextField } from '@/shared/ui'
import { useRegister } from '../api'
import { registerSchema, type RegisterValues } from '../schema'
import s from './AuthForm.module.css'
import { ArrowIcon } from './ArrowIcon'
import { applyServerError } from './serverError'

export function RegisterForm() {
  const { t } = useTranslation()
  const registration = useRegister()
  const [bannerCode, setBannerCode] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', phone: '', password: '' },
  })

  // Ro'yxatdan o'tgach foydalanuvchi darhol tizimda bo'ladi — yo'naltirishni GuestOnly qiladi.
  const onSubmit = handleSubmit((values) => {
    setBannerCode(null)
    registration.mutate(
      { full_name: values.full_name, phone: toApiPhone(values.phone), password: values.password },
      { onError: (error) => setBannerCode(applyServerError(error, setError, { phone_taken: 'phone' })) },
    )
  })

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      <div className={s.heading}>
        <h1 className={s.title}>{t('auth.register.title')}</h1>
        <p className={s.subtitle}>{t('auth.register.subtitle')}</p>
      </div>

      {bannerCode ? <Alert>{errorText(t, bannerCode)}</Alert> : null}

      <TextField
        label={t('auth.register.fullName')}
        placeholder={t('auth.register.fullNamePlaceholder')}
        autoComplete="name"
        error={errors.full_name?.message && errorText(t, errors.full_name.message, 'full_name')}
        {...register('full_name')}
      />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneField
            label={t('auth.register.phone')}
            error={errors.phone?.message && errorText(t, errors.phone.message, 'phone')}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        )}
      />
      <PasswordField
        label={t('auth.register.password')}
        autoComplete="new-password"
        hint={t('auth.register.passwordHint')}
        showLabel={t('auth.showPassword')}
        hideLabel={t('auth.hidePassword')}
        error={errors.password?.message && errorText(t, errors.password.message, 'password')}
        {...register('password')}
      />

      <Button type="submit" fullWidth loading={registration.isPending} trailingIcon={<ArrowIcon />}>
        {t('auth.register.submit')}
      </Button>

      <p className={s.switch}>
        {t('auth.register.haveAccount')}
        <Link to="/login" className={s.switchLink}>
          {t('auth.register.toLogin')}
        </Link>
      </p>
    </form>
  )
}
