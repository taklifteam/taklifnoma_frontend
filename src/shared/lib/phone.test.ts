import { describe, expect, it } from 'vitest'
import { formatPhone, isCompletePhone, phoneDigits, toApiPhone } from './phone'

describe('phone', () => {
  it('formats while typing', () => {
    expect(formatPhone('9')).toBe('9')
    expect(formatPhone('901')).toBe('90 1')
    expect(formatPhone('90123')).toBe('90 123')
    expect(formatPhone('9012345')).toBe('90 123 45')
    expect(formatPhone('901234567')).toBe('90 123 45 67')
  })

  it('ignores separators and extra digits', () => {
    expect(phoneDigits('(90) 123-45-67 89')).toBe('901234567')
    expect(formatPhone('90-123-45-67')).toBe('90 123 45 67')
  })

  it('strips the country code from autofilled or pasted numbers', () => {
    expect(phoneDigits('+998 90 123 45 67')).toBe('901234567')
    expect(phoneDigits('998998123456')).toBe('998123456')
  })

  it('validates and converts for the API', () => {
    expect(isCompletePhone('90 123 45 6')).toBe(false)
    expect(isCompletePhone('90 123 45 67')).toBe(true)
    expect(toApiPhone('90 123 45 67')).toBe('998901234567')
  })
})
