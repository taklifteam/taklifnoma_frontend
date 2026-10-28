import { createContext } from 'react'

export type ToastApi = {
  /** amal bajarildi: "Foydalanuvchi bloklandi" */
  success: (message: string) => void
  /** amal bajarilmadi — tayyor (tarjima qilingan) matn */
  error: (message: string) => void
}

export const ToastContext = createContext<ToastApi | null>(null)
