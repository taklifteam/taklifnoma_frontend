import type { ComponentType } from 'react'
import type { Locale } from '@/shared/i18n'

/** Andoza komponentiga beriladigan ma'lumot: mehmon sahifasi, kabinetdagi preview va andoza namunasi uchun bir xil. */
export type TemplateProps = {
  /** andoza matnlari (content_schema maydonlari); bo'sh maydon bo'lmasligi ham mumkin */
  content: Record<string, string>
  title: string
  /** RFC 3339: "2026-11-14T18:00:00+05:00" */
  eventAt: string
  /** tadbirning vaqt zonasi: sana va vaqt shu zonada ko'rsatiladi, brauzernikida emas */
  timezone: string
  venue: { name: string; address: string; mapUrl: string | null }
  /** taklifnomaning tili — saytning tanlangan tilidan qat'i nazar */
  locale: Locale
  /** guest — mehmon sahifasi; preview — kabinet va namuna: konvert yopiq turmaydi, tugmalar ishlamaydi */
  mode: 'guest' | 'preview'
  /** .ics fayli UID'i uchun (namunada yo'q) */
  slug?: string
}

export type TemplateComponent = ComponentType<TemplateProps>
