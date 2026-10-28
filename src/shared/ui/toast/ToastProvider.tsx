import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { CloseIcon } from '../icons'
import { ToastContext, type ToastApi } from './context'
import s from './Toast.module.css'

/** Xabar ekranda shuncha turadi (ms). */
export const TOAST_DURATION = 5000

type ToastItem = { id: number; tone: 'success' | 'error'; message: string }

/**
 * Pastki burchakdagi qisqa xabarlar. Hudud aria-live: ekran o'quvchi yangi xabarni o'qiydi.
 * Xatolar uchun ham ishlatiladi, lekin forma xatolari formaning o'zida (Alert) ko'rsatiladi.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((item) => item.id !== id))
  }, [])

  const toast = useMemo<ToastApi>(() => {
    const show = (tone: ToastItem['tone'], message: string) => {
      const id = ++nextId.current
      setItems((list) => [...list, { id, tone, message }])
      window.setTimeout(() => dismiss(id), TOAST_DURATION)
    }
    return {
      success: (message) => show('success', message),
      error: (message) => show('error', message),
    }
  }, [dismiss])

  return (
    <ToastContext value={toast}>
      {children}
      <div className={s.region} role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={cn(s.toast, s[item.tone])}>
            <span className={s.message}>{item.message}</span>
            <button type="button" className={s.close} aria-label={t('common.close')} onClick={() => dismiss(item.id)}>
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
