import type { ReactNode } from 'react'
import s from './Alert.module.css'

/** Forma ustidagi xato xabari. role="alert" — paydo bo'lganda ekran o'quvchi darhol o'qiydi. */
export function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className={s.alert}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={s.icon}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5h.01" />
      </svg>
      <span>{children}</span>
    </div>
  )
}
