/**
 * Matndagi {kalit} o'rinbosarlarini kontentdagi qiymat bilan almashtiradi:
 * "{groom} va {bride}" → "Jasur va Madina". Kontentda yo'q kalit — bo'sh qator.
 */
export function fillPlaceholders(text: string, content: Record<string, string>): string {
  return text.replace(/\{([a-z0-9_]+)\}/g, (_, key: string) => (Object.hasOwn(content, key) ? content[key]! : ''))
}

/** Kontentdagi maydon, bo'shliqlarsiz; bo'sh bo'lsa — undefined (blok umuman chizilmaydi). */
export function field(content: Record<string, string>, key: string): string | undefined {
  const value = Object.hasOwn(content, key) ? content[key]!.trim() : ''
  return value || undefined
}
