import { describe, expect, it } from 'vitest'
import { sochqiTemplate } from '@/test/fixtures'
import { emptyDraft, eventAtOf, firstStepWithError, toFields, validateDraft, type InvitationDraft } from './draft'

const now = Date.parse('2026-10-27T12:00:00Z')

function draft(patch: Partial<InvitationDraft> = {}): InvitationDraft {
  return {
    ...emptyDraft(),
    templateCode: 'sochqi-konvert',
    categoryCode: 'wedding',
    content: { groom: 'Jasur', bride: 'Madina' },
    date: '2026-12-12',
    time: '18:00',
    venueName: 'Navro‘z',
    venueAddress: 'Toshkent',
    ...patch,
  }
}

describe('eventAtOf', () => {
  it('sends Tashkent wall time with the +05:00 offset', () => {
    expect(eventAtOf({ date: '2026-12-12', time: '18:00' })).toBe('2026-12-12T18:00:00+05:00')
  })

  it('is empty until both parts are filled', () => {
    expect(eventAtOf({ date: '', time: '18:00' })).toBe('')
    expect(eventAtOf({ date: '2026-12-12', time: '' })).toBe('')
  })
})

describe('validateDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateDraft(draft(), sochqiTemplate.fields, now)).toEqual({})
  })

  it('uses the backend error keys', () => {
    const errors = validateDraft(
      draft({
        content: { groom: ' ', bride: 'М'.repeat(41) },
        date: '2026-10-01',
        venueName: '',
        mapUrl: 'http://maps.example',
      }),
      sochqiTemplate.fields,
      now,
    )
    expect(errors).toEqual({
      'content.groom': 'required',
      'content.bride': 'too_long',
      event_at: 'past',
      venue_name: 'required',
      map_url: 'invalid',
    })
  })

  it('rejects dates more than three years ahead', () => {
    expect(validateDraft(draft({ date: '2030-01-01' }), sochqiTemplate.fields, now).event_at).toBe('too_far')
  })
})

describe('toFields', () => {
  it('trims, drops empty texts and builds the title from the names', () => {
    const body = toFields(draft({ content: { groom: ' Jasur ', bride: 'Madina', hosts: '  ' }, mapUrl: ' ' }), sochqiTemplate.fields)
    expect(body).toMatchObject({
      title: 'Jasur & Madina',
      event_at: '2026-12-12T18:00:00+05:00',
      map_url: null,
      content: { groom: 'Jasur', bride: 'Madina' },
    })
  })

  it('does not send keys outside the template', () => {
    expect(toFields(draft({ content: { groom: 'J', bride: 'M', hack: 'x' } }), sochqiTemplate.fields).content).toEqual({
      groom: 'J',
      bride: 'M',
    })
  })
})

describe('firstStepWithError', () => {
  it('returns the earliest step', () => {
    expect(firstStepWithError({ venue_name: 'required', 'content.groom': 'required' })).toBe('texts')
    expect(firstStepWithError({ event_at: 'past' })).toBe('when')
    expect(firstStepWithError({})).toBeUndefined()
  })
})


describe('published event date edits', () => {
  const original = '2026-10-01T18:00:32.123+05:00'
  it('allows an unchanged past date and preserves its seconds in the request', () => {
    const value = draft({ date: '2026-10-01' })
    expect(validateDraft(value, sochqiTemplate.fields, now, original)).toEqual({})
    expect(toFields(value, sochqiTemplate.fields, original).event_at).toBe(original)
  })
  it('rejects moving a published event to another past date', () => {
    expect(validateDraft(draft({ date: '2026-10-02' }), sochqiTemplate.fields, now, original).event_at).toBe('past')
  })
  it('still rejects past dates for drafts and new invitations', () => {
    expect(validateDraft(draft({ date: '2026-10-01' }), sochqiTemplate.fields, now).event_at).toBe('past')
  })
})
