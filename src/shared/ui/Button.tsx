import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'
import s from './Button.module.css'
import { Spinner } from './Spinner'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'link'
  /** yuborilmoqda: tugma bloklanadi, matn o'rnida aylana chiqadi */
  loading?: boolean
  fullWidth?: boolean
  trailingIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  trailingIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(s.button, s[variant], fullWidth && s.full, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      <span className={cn(s.label, loading && s.hidden)}>{children}</span>
      {trailingIcon && !loading ? <span className={s.icon}>{trailingIcon}</span> : null}
    </button>
  )
}
