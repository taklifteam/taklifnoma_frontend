// O'zbekiston raqami: +998 dan keyin 9 ta raqam. Bazada "998901234567" ko'rinishida saqlanadi.

export const UZ_PHONE_LENGTH = 9

/**
 * Faqat raqamlarni qoldiradi va 9 tadan oshirmaydi. Brauzer avtoto'ldirgan yoki nusxalangan
 * "+998 90 123 45 67" ko'rinishidagi to'liq raqamdan 998 olib tashlanadi.
 */
export function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.length > UZ_PHONE_LENGTH && digits.startsWith('998')) digits = digits.slice(3)
  return digits.slice(0, UZ_PHONE_LENGTH)
}

/** "901234567" → "90 123 45 67" (yozish jarayonida ham ishlaydi). */
export function formatPhone(value: string): string {
  const d = phoneDigits(value)
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ')
}

export function isCompletePhone(value: string): boolean {
  return phoneDigits(value).length === UZ_PHONE_LENGTH
}

/** API'ga yuboriladigan ko'rinish: "998901234567". */
export function toApiPhone(value: string): string {
  return '998' + phoneDigits(value)
}
