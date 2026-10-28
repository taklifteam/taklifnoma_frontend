import type { ReactNode } from 'react'
import s from './PageHeader.module.css'

/** Har bir admin sahifasining boshi: sarlavha, qisqa izoh va o'ng tomonda amallar ("Qo'shish" ...). */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className={s.header}>
      <div className={s.text}>
        <h1 className={s.title}>{title}</h1>
        {description ? <p className={s.description}>{description}</p> : null}
      </div>
      {actions ? <div className={s.actions}>{actions}</div> : null}
    </header>
  )
}
