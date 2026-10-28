import { describe, expect, it } from 'vitest'
import { buildIcs, mapHref } from './calendar'

describe('buildIcs', () => {
  const ics = buildIcs(
    {
      uid: 'k7mx2qvd@taklifnoma',
      title: 'Jasur & Madina',
      eventAt: '2026-11-14T18:00:00+05:00',
      location: 'Navro‘z to‘yxonasi, Toshkent; Amir Temur 1',
    },
    new Date('2026-10-27T10:00:00Z'),
  )

  it('stores the start in UTC with a fixed duration', () => {
    expect(ics).toContain('DTSTART:20261114T130000Z\r\n')
    expect(ics).toContain('DURATION:PT4H\r\n')
    expect(ics).toContain('DTSTAMP:20261027T100000Z\r\n')
  })

  it('escapes commas and semicolons', () => {
    expect(ics).toContain('LOCATION:Navro‘z to‘yxonasi\\, Toshkent\\; Amir Temur 1\r\n')
  })

  it('uses CRLF line endings and ends with one', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })

  it('folds lines longer than 75 bytes without splitting letters', () => {
    const long = buildIcs({ uid: 'x', title: 'Ғ'.repeat(60), eventAt: '2026-11-14T13:00:00Z', location: '' })
    const encoder = new TextEncoder()
    for (const line of long.split('\r\n')) expect(encoder.encode(line).length).toBeLessThanOrEqual(75)
    expect(long).toContain('\r\n Ғ')
    // qayta yig'ilganda asl matn chiqadi
    expect(long.replace(/\r\n /g, '')).toContain(`SUMMARY:${'Ғ'.repeat(60)}\r\n`)
  })
})

describe('mapHref', () => {
  it('prefers the given map link', () => {
    expect(mapHref('https://yandex.uz/maps/-/abc', 'x')).toBe('https://yandex.uz/maps/-/abc')
  })

  it('searches by address otherwise', () => {
    expect(mapHref(null, 'Toshkent, Amir Temur 1')).toBe('https://yandex.uz/maps/?text=Toshkent%2C%20Amir%20Temur%201')
  })
})
