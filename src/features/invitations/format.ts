import type { TFunction } from 'i18next'
import type { BadgeTone } from '@/shared/ui'
import { eventDateParts } from '@/templates/lib/eventDate'

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'published':
      return 'success'
    case 'expired':
      return 'warning'
    case 'blocked':
      return 'danger'
    default:
      return 'neutral'
  }
}

/** "12-dekabr 2026, 18:00" — tadbir vaqt zonasida, interfeys tilida. */
export function formatEventAt(t: TFunction, iso: string, timeZone: string): string {
  const d = eventDateParts(iso, timeZone)
  const months = t('invitation.months', { returnObjects: true }) as string[]
  const date = `${t('invitation.dayLine', { day: d.day, month: months[d.month - 1] })} ${d.year}`
  return t('cabinet.eventAt', { date, time: d.time })
}

/** Tahrirlash mumkinmi: bloklangan va muddati o'tgan — yo'q. */
export function isEditable(status: string): boolean {
  return status === 'draft' || status === 'published'
}
