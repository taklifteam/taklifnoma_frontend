import type { TemplateProps } from '@/templates'
import { TemplateView } from '@/templates'
import s from './Wizard.module.css'

/** Taklifnoma telefon ekranidagidek: ichida aylanadi, tugmalar ishlamaydi. */
export function PhonePreview({ rendererKey, ...props }: Omit<TemplateProps, 'mode'> & { rendererKey: string }) {
  return (
    <div className={s.phone}>
      <div className={s.phoneScreen}>
        <TemplateView rendererKey={rendererKey} {...props} mode="preview" />
      </div>
    </div>
  )
}

/** Andoza kartochkasidagi kichraytirilgan jonli namuna (bosilmaydi, fokus olmaydi). */
export function TemplateThumb({ rendererKey, ...props }: Omit<TemplateProps, 'mode'> & { rendererKey: string }) {
  return (
    <div className={s.thumb} inert aria-hidden="true">
      <div className={s.thumbInner}>
        <TemplateView rendererKey={rendererKey} {...props} mode="preview" />
      </div>
    </div>
  )
}
