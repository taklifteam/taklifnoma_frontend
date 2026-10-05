import { z } from 'zod'
import { isCompletePhone } from '@/shared/lib/phone'

// Xabar o'rnida xato kodi turadi (errors.* tarjima kaliti) — backend qaytaradigan kodlar bilan bir xil.

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'required'),
  password: z.string().min(1, 'required'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  full_name: z.string().trim().min(1, 'required').max(120, 'too_long'),
  phone: z.string().refine(isCompletePhone, 'invalid'),
  password: z.string().min(8, 'too_short').max(128, 'too_long'),
})
export type RegisterValues = z.infer<typeof registerSchema>
