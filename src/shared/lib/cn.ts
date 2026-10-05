/** CSS klasslarini birlashtiradi, bo'sh qiymatlarni tashlab yuboradi. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
