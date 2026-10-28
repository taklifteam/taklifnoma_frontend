import { useTranslation } from 'react-i18next'
import type { ModelsTemplateField } from '@/shared/api'
import { errorText } from '@/shared/i18n'
import { TextAreaField, TextField } from '@/shared/ui'
import { orderFields } from '@/templates'

// Shundan uzun matnlar ko'p qatorli maydonda kiritiladi.
const TEXTAREA_FROM = 120

type Props = {
  rendererKey: string
  fields: readonly ModelsTemplateField[]
  values: Record<string, string>
  errors: Record<string, string>
  onChange: (key: string, value: string) => void
}

/** Andoza sxemasidan yasalgan forma: maydon nomi i18n'dan (templateFields.<kalit>), bo'lmasa kalitning o'zi. */
export function ContentFields({ rendererKey, fields, values, errors, onChange }: Props) {
  const { t } = useTranslation()
  return orderFields(rendererKey, fields).map((f) => {
    const value = values[f.key] ?? ''
    const errorKey = `content.${f.key}`
    const label = t(`templateFields.${f.key}`, { defaultValue: f.key }) + (f.required ? ' *' : '')
    const counter = f.max_length > 0 ? `${[...value].length} / ${f.max_length}` : undefined
    const extra = t(`templateFieldHints.${f.key}`, { defaultValue: '' })
    const hint = [extra, counter].filter(Boolean).join(' · ') || undefined
    const props = {
      label,
      hint,
      error: errors[errorKey] ? errorText(t, errors[errorKey], errorKey) : undefined,
      value,
      required: f.required,
      onChange: (e: { target: { value: string } }) => onChange(f.key, e.target.value),
    }
    return f.max_length > TEXTAREA_FROM ? (
      <TextAreaField key={f.key} {...props} />
    ) : (
      <TextField key={f.key} {...props} />
    )
  })
}
