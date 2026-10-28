import { use } from 'react'
import { ToastContext, type ToastApi } from './context'

/**
 * Qisqa xabar ko'rsatish: toast.success('...'), toast.error('...'). ToastProvider ichida ishlaydi.
 * Provider bo'lmasa — xato: jimgina hech narsa qilmaslik "Bloklandi" kabi xabarlar yo'qolganini yashirardi.
 */
export function useToast(): ToastApi {
  const toast = use(ToastContext)
  if (!toast) throw new Error('useToast: ToastProvider topilmadi')
  return toast
}
