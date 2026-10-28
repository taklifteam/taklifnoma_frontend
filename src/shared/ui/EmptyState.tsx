import type { ReactNode } from 'react'
import s from './EmptyState.module.css'

/** Ko'rsatadigan narsa yo'q: bo'sh ro'yxat, qidiruv natijasiz, ruxsat yo'q. */
export function EmptyState({
  title,
  text,
  icon,
  action,
}: {
  title: string
  text?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className={s.empty}>
      {icon ? <span className={s.icon}>{icon}</span> : null}
      <p className={s.title}>{title}</p>
      {text ? <p className={s.text}>{text}</p> : null}
      {action}
    </div>
  )
}
