import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import s from './Dialog.module.css'
import { CloseIcon } from './icons'
import { useModal } from './useModal'

type DialogProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** pastki qator: "Yopish", "Saqlash" ... */
  footer?: ReactNode
}

/**
 * Ma'lumot ko'rsatadigan oyna (rolning ruxsatlari, yozuv tafsilotlari). Esc, yopish tugmasi yoki
 * orqa fonni bosish yopadi. Amalni tasdiqlash uchun — ConfirmDialog.
 */
export function Dialog({ open, title, onClose, children, footer }: DialogProps) {
  const { t } = useTranslation()
  const ref = useModal(open)
  const titleId = useId()

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Esc: oynani React holati boshqaradi
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // ichki ramka tashqarisi (orqa fon) bosilganda
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={s.frame}>
        <header className={s.header}>
          <h2 id={titleId} className={s.title}>
            {title}
          </h2>
          <button type="button" className={s.close} aria-label={t('common.close')} onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className={s.body}>{children}</div>
        {footer ? <footer className={s.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  )
}
