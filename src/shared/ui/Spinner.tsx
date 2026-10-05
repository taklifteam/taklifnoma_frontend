import { cn } from '../lib/cn'
import s from './Spinner.module.css'

/** Aylanuvchi indikator. label berilsa, ekran o'quvchiga aytiladi. */
export function Spinner({ label, className }: { label?: string; className?: string }) {
  return (
    <span className={cn('spinner', s.spinner, className)} role={label ? 'status' : undefined} aria-label={label}>
      <span className={s.ring} aria-hidden="true" />
    </span>
  )
}
