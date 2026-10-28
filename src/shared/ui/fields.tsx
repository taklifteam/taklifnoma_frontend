// Forma maydonlari: yorliq + input + izoh yoki xato. Xato bo'lsa, input aria-invalid
// va aria-describedby orqali xato matniga bog'lanadi (ekran o'quvchi uni o'qiydi).

import { useId, useState, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/cn'
import { formatPhone } from '../lib/phone'
import s from './fields.module.css'

type FieldBaseProps = {
  label: string
  hint?: string
  /** tayyor (tarjima qilingan) xato matni */
  error?: string
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'size'> & {
  ref?: Ref<HTMLInputElement>
}

function Field({ id, label, hint, error, children }: FieldBaseProps & { id: string; children: ReactNode }) {
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={s.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={s.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function a11y(id: string, { error, hint }: Pick<FieldBaseProps, 'error' | 'hint'>) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const
}

export function TextField({ label, hint, error, className, ...input }: FieldBaseProps & InputProps) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input id={id} className={cn(s.input, error && s.invalid, className)} {...a11y(id, { error, hint })} {...input} />
    </Field>
  )
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  ref?: Ref<HTMLTextAreaElement>
}

/** Ko'p qatorli matn (taklif matni, yakuniy so'z). Balandligi matnga qarab o'sadi. */
export function TextAreaField({ label, hint, error, className, rows = 4, ...textarea }: FieldBaseProps & TextAreaProps) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        className={cn(s.input, s.textarea, error && s.invalid, className)}
        {...a11y(id, { error, hint })}
        {...textarea}
      />
    </Field>
  )
}

type PasswordFieldProps = FieldBaseProps &
  Omit<InputProps, 'type'> & {
    showLabel: string
    hideLabel: string
  }

export function PasswordField({ label, hint, error, showLabel, hideLabel, className, ...input }: PasswordFieldProps) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className={s.withAction}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn(s.input, s.inputWithAction, error && s.invalid, className)}
          {...a11y(id, { error, hint })}
          {...input}
        />
        <button
          type="button"
          className={s.action}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          aria-controls={id}
          disabled={input.disabled}
          onClick={() => setVisible((v) => !v)}
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {visible ? <path d="M3 3l18 18" /> : null}
          </svg>
        </button>
      </div>
    </Field>
  )
}

type PhoneFieldProps = FieldBaseProps &
  Omit<InputProps, 'type' | 'value' | 'onChange' | 'defaultValue'> & {
    /** "90 123 45 67" ko'rinishidagi qiymat */
    value: string
    onChange: (value: string) => void
  }

/** O'zbekiston raqami: +998 qotirilgan, qolgani yozish jarayonida "90 123 45 67" bo'lib formatlanadi. */
export function PhoneField({ label, hint, error, value, onChange, className, ...input }: PhoneFieldProps) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className={cn(s.phone, error && s.invalid)}>
        <span className={s.prefix}>+998</span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="90 123 45 67"
          className={cn(s.phoneInput, className)}
          value={value}
          onChange={(e) => onChange(formatPhone(e.target.value))}
          {...a11y(id, { error, hint })}
          {...input}
        />
      </div>
    </Field>
  )
}
