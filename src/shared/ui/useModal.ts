import { useEffect, useRef } from 'react'

// A confirmation dialog can open above a detail dialog. Unlock only after both close.
let openModals = 0
let previousOverflow = ''

/**
 * Native <dialog>ni React holati bilan bog'laydi: open → showModal(), aks holda close().
 * showModal() fokusni oyna ichida ushlaydi, close() esa uni oldingi elementga qaytaradi.
 */
export function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return
    if (!dialog.open) dialog.showModal()
    if (openModals === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openModals++
    return () => {
      if (dialog.open) dialog.close()
      openModals--
      if (openModals === 0) document.body.style.overflow = previousOverflow
    }
  }, [open])

  return ref
}
