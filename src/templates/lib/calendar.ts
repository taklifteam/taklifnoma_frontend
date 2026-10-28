// "Kalendarga qo'shish": .ics faylini brauzerning o'zida yasaymiz (server kerak emas).

const DURATION = 'PT4H' // to'y odatda 4 soatcha davom etadi

type CalendarEvent = {
  uid: string
  title: string
  eventAt: string
  location: string
  description?: string
}

/** 2026-11-14T13:00:00.000Z → 20261114T130000Z */
function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** RFC 5545 matn qiymati: \ ; , va yangi qator ekranlanadi. */
function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

const encoder = new TextEncoder()

/** 75 baytdan uzun qator bo'linadi, davomi bo'sh joy bilan boshlanadi (RFC 5545, 3.1). Harf o'rtasidan bo'linmaydi. */
function fold(line: string): string {
  const out: string[] = []
  let current = ''
  let bytes = 0
  for (const ch of line) {
    const size = encoder.encode(ch).length
    if (bytes + size > 75) {
      out.push(current)
      current = ' '
      bytes = 1
    }
    current += ch
    bytes += size
  }
  out.push(current)
  return out.join('\r\n')
}

export function buildIcs(event: CalendarEvent, now = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Taklifnoma//Taklifnoma//UZ',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(new Date(event.eventAt))}`,
    `DURATION:${DURATION}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    ...(event.description ? [`DESCRIPTION:${escapeText(event.description)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

export function downloadIcs(event: CalendarEvent): void {
  const blob = new Blob([buildIcs(event)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'taklifnoma.ics'
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Xarita havolasi: mijoz bergani bo'lsa — o'sha, aks holda manzil bo'yicha Yandex qidiruvi. */
export function mapHref(mapUrl: string | null, address: string): string {
  return mapUrl || `https://yandex.uz/maps/?text=${encodeURIComponent(address)}`
}
