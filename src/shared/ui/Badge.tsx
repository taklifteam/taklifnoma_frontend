import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import s from './Badge.module.css'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

/** Holat yoki tur belgisi: "Faol", "Bloklangan", "Xodim" ... */
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={cn(s.badge, s[tone])}>{children}</span>
}
