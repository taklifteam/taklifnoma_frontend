// Tadbir sanasi tadbirning vaqt zonasida. Brauzerning zonasi ishlatilmaydi: Moskvadagi mehmon ham
// to'y vaqtini Toshkent bo'yicha ko'rishi kerak. Oy va hafta kunlari nomlari i18n'dan olinadi —
// Chrome'da Intl'ning o'zbekcha nomlari yo'q ("2026 M11 14" chiqadi).

export type EventDateParts = {
  year: number
  /** 1–12 */
  month: number
  day: number
  /** 0 — yakshanba */
  weekday: number
  /** "18:00" */
  time: string
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    formatters.set(timeZone, f)
  }
  return f
}

export function eventDateParts(iso: string, timeZone: string): EventDateParts {
  const parts: Record<string, string> = {}
  for (const p of formatter(timeZone).formatToParts(new Date(iso))) parts[p.type] = p.value
  const year = Number(parts.year)
  const month = Number(parts.month)
  const day = Number(parts.day)
  return {
    year,
    month,
    day,
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
    time: `${parts.hour}:${parts.minute}`,
  }
}

export type Countdown = { days: number; hours: number; minutes: number }

/** Tadbirgacha qolgan vaqt; tadbir boshlangan bo'lsa — null. */
export function countdown(iso: string, now: number): Countdown | null {
  const ms = new Date(iso).getTime() - now
  if (!(ms > 0)) return null
  const totalMinutes = Math.floor(ms / 60_000)
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  }
}

export const SAMPLE_TIMEZONE = 'Asia/Tashkent'

/** Namuna sana: bugundan 30 kun keyin, Toshkent vaqti bilan 18:00 (O'zbekistonda yozgi vaqt yo'q: +05:00). */
export function sampleEventAt(now = Date.now()): string {
  const d = eventDateParts(new Date(now + 30 * 86_400_000).toISOString(), SAMPLE_TIMEZONE)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.year}-${pad(d.month)}-${pad(d.day)}T18:00:00+05:00`
}
