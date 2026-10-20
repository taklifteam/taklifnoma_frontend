import { cn } from '../lib/cn'
import s from './Logo.module.css'

/** Ichida tilla yurak muhri bo'lgan konvert + "Taklifnoma". Konvert rangi — currentColor. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn(s.logo, className)}>
      <svg aria-hidden="true" width="34" height="26" viewBox="0 0 34 26" className={s.mark}>
        <rect x="1.5" y="1.5" width="31" height="23" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M2.5 3 L17 14.5 L31.5 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path
          d="M17 21.5 C 12.4 18.6, 10.6 16.5, 10.6 14.3 A 3.1 3.1 0 0 1 17 12.9 A 3.1 3.1 0 0 1 23.4 14.3 C 23.4 16.5, 21.6 18.6, 17 21.5 Z"
          fill="var(--gold)"
          stroke="var(--surface)"
          strokeWidth="1.2"
        />
      </svg>
      <span className={s.word}>Taklifnoma</span>
    </span>
  )
}
