import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'
import s from './Button.module.css'
import { Spinner } from './Spinner'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'link'
  /** sm — ixcham (44px): jadval, filtr va oynalar uchun */
  size?: 'md' | 'sm'
  /** yuborilmoqda: tugma bloklanadi, matn o'rnida aylana chiqadi */
  loading?: boolean
  fullWidth?: boolean
  trailingIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
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
      className={cn(s.button, s[variant], size === 'sm' && s.sm, fullWidth && s.full, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      <span className={cn(s.label, loading && s.hidden)}>{children}</span>
      {trailingIcon ? <span aria-hidden="true" className={cn(s.icon, loading && s.hidden)}>{trailingIcon}</span> : null}
    </button>
  )
}
