import { describe, expect, it } from 'vitest'
import { countdown, eventDateParts, sampleEventAt } from './eventDate'

describe('eventDateParts', () => {
  it('uses the event time zone, not the browser one', () => {
    // 20:30 UTC — Toshkentda ertasi kuni 01:30: brauzer zonasi ishlatilsa, kun 14 chiqardi
    expect(eventDateParts('2026-11-14T20:30:00Z', 'Asia/Tashkent')).toEqual({
      year: 2026,
      month: 11,
      day: 15,
      weekday: 0,
      time: '01:30',
    })
  })

  it('reads an offset date as the same wall time in Tashkent', () => {
    expect(eventDateParts('2026-11-14T18:00:00+05:00', 'Asia/Tashkent')).toMatchObject({ day: 14, weekday: 6, time: '18:00' })
  })

  it('shows midnight as 00, not 24', () => {
    expect(eventDateParts('2026-11-14T19:00:00Z', 'Asia/Tashkent').time).toBe('00:00')
  })
})

describe('countdown', () => {
  const event = '2026-11-14T18:00:00+05:00'
  const eventMs = Date.parse(event)

  it('splits the rest into days, hours and minutes', () => {
    const now = eventMs - (2 * 1440 + 3 * 60 + 15) * 60_000 - 30_000
    expect(countdown(event, now)).toEqual({ days: 2, hours: 3, minutes: 15 })
  })

  it('is null once the event has started', () => {
    expect(countdown(event, eventMs)).toBeNull()
    expect(countdown(event, eventMs + 1)).toBeNull()
  })
})

describe('sampleEventAt', () => {
  it('is 30 days ahead at 18:00 Tashkent time', () => {
    // 22:00 UTC — Toshkentda allaqachon ertasi kun
    expect(sampleEventAt(Date.parse('2026-10-26T22:00:00Z'))).toBe('2026-11-26T18:00:00+05:00')
  })
})
