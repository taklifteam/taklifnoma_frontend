// Taklifnoma formasining holati va tekshiruvi. Xato kalitlari backend'nikidek ("content.groom", "event_at"),
// shuning uchun serverdan kelgan validatsiya xatolari ham xuddi shu joyga tushadi.

import type { ModelsUpdateInvitationRequest, ModelsInvitationResponse, ModelsTemplateField } from '@/shared/api'
import { eventDateParts } from '@/templates/lib/eventDate'

export type InvitationDraft = {
  templateCode: string
  categoryCode: string
  title: string
  content: Record<string, string>
  /** YYYY-MM-DD, Toshkent vaqti */
  date: string
  /** HH:mm */
  time: string
  venueName: string
  venueAddress: string
  mapUrl: string
}

/** maydon → xato kodi (required, too_long, past ...) */
export type DraftErrors = Record<string, string>

export const STEPS = ['template', 'texts', 'when', 'review'] as const
export type Step = (typeof STEPS)[number]

// Taklifnomalar hozircha faqat O'zbekistonda: yozgi vaqt yo'q, mintaqa doim +05:00.
const TASHKENT = 'Asia/Tashkent'
const OFFSET = '+05:00'

export function emptyDraft(): InvitationDraft {
  return {
    templateCode: '',
    categoryCode: '',
    title: '',
    content: {},
    date: '',
    time: '18:00',
    venueName: '',
    venueAddress: '',
    mapUrl: '',
  }
}

export function draftFromInvitation(inv: ModelsInvitationResponse): InvitationDraft {
  const d = eventDateParts(inv.event_at, inv.timezone || TASHKENT)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    templateCode: inv.template_code,
    categoryCode: inv.category_code,
    title: inv.title,
    content: { ...inv.content },
    date: `${d.year}-${pad(d.month)}-${pad(d.day)}`,
    time: d.time,
    venueName: inv.venue_name,
    venueAddress: inv.venue_address,
    mapUrl: inv.map_url ?? '',
  }
}

/** "2026-12-12T18:00:00+05:00"; sana yoki vaqt bo'sh bo'lsa — bo'sh qator. */
export function eventAtOf(draft: Pick<InvitationDraft, 'date' | 'time'>, originalEventAt?: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !/^\d{2}:\d{2}$/.test(draft.time)) return ''
  const next = `${draft.date}T${draft.time}:00${OFFSET}`
  // Sana/vaqt maydonlari daqiqagacha: tahrirlanmagan server soniyalarini saqlaymiz.
  if (originalEventAt && Math.floor(Date.parse(next) / 60_000) === Math.floor(Date.parse(originalEventAt) / 60_000)) return originalEventAt
  return next
}

/** Sarlavha bo'sh bo'lsa: "Jasur & Madina". */
export function autoTitle(content: Record<string, string>): string {
  return [content.groom?.trim(), content.bride?.trim()].filter(Boolean).join(' & ')
}

export function stepOf(field: string): Step {
  if (field === 'template_code' || field === 'category_code') return 'template'
  if (field === 'title' || field === 'content' || field.startsWith('content.')) return 'texts'
  return 'when'
}

/** Xatosi bor eng birinchi qadam (foydalanuvchi shu yerga qaytariladi). */
export function firstStepWithError(errors: DraftErrors): Step | undefined {
  const steps = new Set(Object.keys(errors).map(stepOf))
  return STEPS.find((step) => steps.has(step))
}

const MAX_YEARS_AHEAD = 3

/** Backend tekshiradigan qoidalar + bo'sh joy va manzil (formada majburiy). */
export function validateDraft(
  draft: InvitationDraft,
  fields: readonly ModelsTemplateField[],
  now = Date.now(),
  /** E’lon qilingan taklifnoma: o‘zgarmagan sana o‘tgan bo‘lishi mumkin. */
  publishedEventAt?: string,
): DraftErrors {
  const errors: DraftErrors = {}
  if (!draft.templateCode) errors.template_code = 'required'

  for (const f of fields) {
    const value = (draft.content[f.key] ?? '').trim()
    if (f.required && !value) errors[`content.${f.key}`] = 'required'
    else if (f.max_length > 0 && [...value].length > f.max_length) errors[`content.${f.key}`] = 'too_long'
  }
  if ([...draft.title.trim()].length > 200) errors.title = 'too_long'

  const eventAt = eventAtOf(draft, publishedEventAt)
  if (!eventAt) errors.event_at = 'required'
  else {
    const at = Date.parse(eventAt)
    const limit = new Date(now)
    limit.setFullYear(limit.getFullYear() + MAX_YEARS_AHEAD)
    const unchangedPublishedDate = publishedEventAt !== undefined && at === Date.parse(publishedEventAt)
    if (!(at > now) && !unchangedPublishedDate) errors.event_at = 'past'
    else if (at > limit.getTime()) errors.event_at = 'too_far'
  }

  const venueName = draft.venueName.trim()
  const venueAddress = draft.venueAddress.trim()
  if (!venueName) errors.venue_name = 'required'
  else if ([...venueName].length > 200) errors.venue_name = 'too_long'
  if (!venueAddress) errors.venue_address = 'required'
  else if ([...venueAddress].length > 500) errors.venue_address = 'too_long'

  const mapUrl = draft.mapUrl.trim()
  if (mapUrl && !isHttpsUrl(mapUrl)) errors.map_url = 'invalid'
  return errors
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname !== '' && value.length <= 1000
  } catch {
    return false
  }
}

/** API so'roviga: matnlar tozalanadi, bo'sh matn yuborilmaydi, sarlavha bo'sh bo'lsa — ismlardan. */
export function toFields(draft: InvitationDraft, fields: readonly ModelsTemplateField[], originalEventAt?: string): ModelsUpdateInvitationRequest {
  const content: Record<string, string> = {}
  for (const f of fields) {
    const value = (draft.content[f.key] ?? '').trim()
    if (value) content[f.key] = value
  }
  const mapUrl = draft.mapUrl.trim()
  return {
    title: draft.title.trim() || autoTitle(content),
    event_at: eventAtOf(draft, originalEventAt),
    venue_name: draft.venueName.trim(),
    venue_address: draft.venueAddress.trim(),
    map_url: mapUrl || null,
    content,
  }
}
