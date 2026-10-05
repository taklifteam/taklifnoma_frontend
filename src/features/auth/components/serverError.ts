import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { isApiError } from '@/shared/api'

/**
 * Server xatosini taqsimlaydi: maydonga tegishlilari (validation, phone_taken ...) forma
 * maydoni ostiga yoziladi; qaytgan kod — forma ustidagi umumiy xabar uchun (null — kerak emas).
 * fieldCodes: qaysi xato kodi qaysi maydonga tegishli, masalan { phone_taken: 'phone' }.
 */
export function applyServerError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldCodes: Partial<Record<string, Path<T>>> = {},
): string | null {
  if (!isApiError(error)) return 'unknown'
  if (error.code === 'validation') {
    for (const [field, code] of Object.entries(error.fields)) {
      setError(field as Path<T>, { message: code })
    }
    return null
  }
  const field = fieldCodes[error.code]
  if (field) {
    setError(field, { message: error.code })
    return null
  }
  return error.code
}
