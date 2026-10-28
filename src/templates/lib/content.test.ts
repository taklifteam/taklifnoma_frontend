import { describe, expect, it } from 'vitest'
import { field, fillPlaceholders } from './content'

describe('fillPlaceholders', () => {
  it('replaces known keys and blanks unknown ones', () => {
    const content = { groom: 'Jasur', bride: 'Madina' }
    expect(fillPlaceholders('{groom} va {bride}ning to‘yi', content)).toBe('Jasur va Madinaning to‘yi')
    expect(fillPlaceholders('{groom} {hosts}', content)).toBe('Jasur ')
  })

  it('does not read inherited properties', () => {
    expect(fillPlaceholders('{constructor}', {})).toBe('')
  })
})

describe('field', () => {
  it('treats whitespace as empty', () => {
    expect(field({ quote: '   ' }, 'quote')).toBeUndefined()
    expect(field({}, 'quote')).toBeUndefined()
    expect(field({ quote: ' Oyat ' }, 'quote')).toBe('Oyat')
  })
})
