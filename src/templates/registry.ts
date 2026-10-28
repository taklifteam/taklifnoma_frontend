import { lazy, type LazyExoticComponent } from 'react'
import type { TemplateComponent } from './types'

type TemplateEntry = {
  component: LazyExoticComponent<TemplateComponent>
  /** formadagi maydonlar tartibi — sahifada qanday ketma-ketlikda ko'rinsa, shunday */
  fieldOrder: readonly string[]
}

// renderer_key (template_versions.renderer_key) → dizayn. Har bir andoza alohida bo'lak bo'lib yuklanadi.
// E'lon qilingan versiyaning ko'rinishi o'zgarmasligi kerak: dizayn o'zgarsa — yangi kalit (@2).
const templates: Record<string, TemplateEntry> = {
  'sochqi-konvert@1': {
    component: lazy(() => import('./sochqi-konvert/SochqiKonvert').then((m) => ({ default: m.SochqiKonvert }))),
    fieldOrder: ['hosts', 'groom', 'bride', 'greeting_text', 'quote', 'quote_ref', 'closing_text'],
  },
}

export function findTemplate(rendererKey: string): TemplateEntry | undefined {
  return Object.hasOwn(templates, rendererKey) ? templates[rendererKey] : undefined
}

/** Forma maydonlarini andoza ko'rsatadigan tartibda beradi; tartibda yo'qlari — oxirida, kelgan tartibda. */
export function orderFields<T extends { key: string }>(rendererKey: string, fields: readonly T[]): T[] {
  const order = findTemplate(rendererKey)?.fieldOrder ?? []
  const rank = (key: string) => {
    const i = order.indexOf(key)
    return i === -1 ? order.length : i
  }
  return [...fields].sort((a, b) => rank(a.key) - rank(b.key))
}
