// Amalni tasdiqlash oynasi (bloklash, rolni o'zgartirish ...). Native <dialog> + showModal():
// fokus oyna ichida qoladi, Esc yopadi, orqa fon bosilmaydi — buni brauzer o'zi ta'minlaydi.

import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/cn'
import { Button } from './Button'
import s from './ConfirmDialog.module.css'
import shell from './Dialog.module.css'
import { useModal } from './useModal'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  /** danger — qaytarib bo'lmaydigan yoki xavfli amal (bloklash, o'chirish) */
  tone?: 'primary' | 'danger'
  /** so'rov ketayapti: tugma aylanadi, oynani yopib bo'lmaydi */
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
  /** qo'shimcha maydonlar, masalan "sabab" — forma ichida, required ishlaydi */
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  loading = false,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const ref = useModal(open)
  const titleId = useId()
  const descriptionId = useId()

  const close = () => {
    if (!loading) onClose()
  }

  return (
    <dialog
      ref={ref}
      className={cn(shell.dialog, s.narrow)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(e) => {
        // Esc: oynani React holati boshqaradi
        e.preventDefault()
        close()
      }}
      onClick={(e) => {
        // forma tashqarisi (orqa fon) bosilganda
        if (e.target === e.currentTarget) close()
      }}
    >
      <form
        className={s.body}
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
      >
        <h2 id={titleId} className={s.title}>
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className={s.description}>
            {description}
          </p>
        ) : null}
        {children}
        <div className={s.actions}>
          <Button variant="secondary" size="sm" disabled={loading} onClick={close}>
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button type="submit" variant={tone} size="sm" loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
