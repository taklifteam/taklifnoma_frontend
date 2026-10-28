// Taklifnoma yaratish va tahrirlash ustasi: andoza → matnlar → sana va joy → ko'rib chiqish.
// Har qadamda jonli preview (serverga so'rov yubormaydi). Server validatsiya xatolari tegishli
// qadam va maydonga qaytaradi.

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker, useNavigate } from 'react-router'
import type { ModelsCategoryResponse, ModelsInvitationResponse, ModelsTemplateField, ModelsTemplateResponse } from '@/shared/api'
import { isApiError } from '@/shared/api'
import { asLocale, errorText } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
import { Alert, Button, ConfirmDialog, Dialog, TextField, useToast } from '@/shared/ui'
import { SAMPLE_TIMEZONE, sampleEventAt } from '@/templates/lib/eventDate'
import { useCreateInvitation, usePublishInvitation, useUpdateInvitation } from '../api'
import {
  autoTitle,
  draftFromInvitation,
  emptyDraft,
  eventAtOf,
  firstStepWithError,
  STEPS,
  stepOf,
  toFields,
  validateDraft,
  type DraftErrors,
  type InvitationDraft,
  type Step,
} from '../draft'
import { formatEventAt } from '../format'
import { ContentFields } from './ContentFields'
import { PhonePreview, TemplateThumb } from './PhonePreview'
import { PublishedScreen } from './PublishedScreen'
import s from './Wizard.module.css'

const PREVIEW_DELAY = 300

type Props =
  | { mode: 'create'; templates: ModelsTemplateResponse[]; categories: ModelsCategoryResponse[]; invitation?: undefined }
  | { mode: 'edit'; invitation: ModelsInvitationResponse; categories: ModelsCategoryResponse[]; templates?: undefined }

export function InvitationWizard(props: Props) {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const locale = asLocale(i18n.language)

  // Birinchi POST javobidan so‘ng versiya va kategoriya serverdagi qoralamaga mahkamlanadi.
  const [saved, setSaved] = useState(props.invitation)
  const steps: readonly Step[] = props.mode === 'create' && !saved ? STEPS : STEPS.filter((step) => step !== 'template')
  const [step, setStep] = useState<Step>(steps[0]!)
  const [draft, setDraft] = useState<InvitationDraft>(() =>
    props.mode === 'edit' ? draftFromInvitation(props.invitation) : initialDraft(props.templates),
  )
  const [errors, setErrors] = useState<DraftErrors>({})
  const [formError, setFormError] = useState<string>()
  const [dirty, setDirty] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  // yaratilgandan keyin (masalan, e'lon qilish xato bersa) qayta yuborish yangisini emas, shuni yangilaydi
  const savedId = saved?.id
  const [published, setPublished] = useState<ModelsInvitationResponse>()
  const leaving = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)
  const focusErrors = useRef(false)
  useEffect(() => {
    if (focusErrors.current) {
      focusErrors.current = false
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    } else if (previousStep.current !== step) {
      headingRef.current?.focus()
    }
    previousStep.current = step
  }, [step, errors])

  const create = useCreateInvitation()
  const update = useUpdateInvitation()
  const publish = usePublishInvitation()
  const busy = create.isPending || update.isPending || publish.isPending

  const template = props.mode === 'create' ? props.templates.find((tpl) => tpl.code === draft.templateCode) : undefined
  const rendererKey = saved?.renderer_key ?? template?.renderer_key ?? ''
  const fields: ModelsTemplateField[] = saved?.fields ?? template?.fields ?? []
  const status = saved?.status ?? 'draft'
  const validate = () => validateDraft(draft, fields, undefined, saved?.status === 'published' ? saved.event_at : undefined)

  // Saqlanmagan o'zgarish bo'lsa — sahifadan chiqishdan oldin so'raymiz.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname,
  )
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const preview = useDebouncedValue(draft, PREVIEW_DELAY)
  const [fallbackEventAt] = useState(() => sampleEventAt())
  const previewProps = {
    rendererKey,
    content: preview.content,
    title: preview.title,
    eventAt: eventAtOf(preview) || fallbackEventAt,
    timezone: SAMPLE_TIMEZONE,
    venue: { name: preview.venueName, address: preview.venueAddress, mapUrl: preview.mapUrl || null },
    locale,
  }

  function change(patch: Partial<InvitationDraft>) {
    setDraft((d) => ({ ...d, ...patch }))
    setDirty(true)
    // tuzatilgan maydonning xatosini olib tashlaymiz
    const keys = Object.keys(patch).map(errorKeyOf)
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !keys.includes(k))))
  }

  function changeContent(key: string, value: string) {
    setDraft((d) => ({ ...d, content: { ...d.content, [key]: value } }))
    setDirty(true)
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== `content.${key}`)))
  }

  function chooseTemplate(tpl: ModelsTemplateResponse) {
    if (saved || tpl.code === draft.templateCode) return
    // boshqa andozaning maydonlari boshqa: namuna matnlar yangisidan olinadi
    change({ templateCode: tpl.code, categoryCode: tpl.categories[0] ?? '', content: { ...tpl.default_content } })
  }

  const index = steps.indexOf(step)
  const isLast = index === steps.length - 1

  function goTo(next: Step) {
    setFormError(undefined)
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  function next(e: FormEvent) {
    e.preventDefault()
    const stepErrors = Object.fromEntries(
      Object.entries(validate()).filter(([field]) => stepOf(field) === step),
    )
    if (Object.keys(stepErrors).length > 0) {
      focusErrors.current = true
      setErrors(stepErrors)
      setFormError(t('wizard.fixErrors'))
      return
    }
    const following = steps[index + 1]
    if (following) goTo(following)
  }

  async function submit(andPublish: boolean) {
    if (busy) return
    setFormError(undefined)
    const found = validate()
    if (Object.keys(found).length > 0) {
      showErrors(found)
      return
    }
    try {
      const body = toFields(draft, fields, saved?.event_at)
      let inv: ModelsInvitationResponse
      if (savedId) {
        inv = await update.mutateAsync({ id: savedId, body })
      } else {
        inv = await create.mutateAsync({ ...body, template_code: draft.templateCode, category_code: draft.categoryCode })
      }
      setSaved(inv)
      if (andPublish && inv.status === 'draft') inv = await publish.mutateAsync(inv.id)
      setSaved(inv)

      setDirty(false)
      leaving.current = true
      if (andPublish) {
        setPublished(inv)
        window.scrollTo({ top: 0 })
      } else {
        toast.success(t('wizard.saved'))
        void navigate('/')
      }
    } catch (error) {
      if (isApiError(error) && error.code === 'validation') {
        showErrors(error.fields)
      } else {
        setFormError(errorText(t, isApiError(error) ? error.code : 'unknown'))
      }
    }
  }

  function showErrors(found: DraftErrors) {
    focusErrors.current = true
    setErrors(found)
    setFormError(t('wizard.fixErrors'))
    const target = firstStepWithError(found)
    if (target && steps.includes(target)) setStep(target)
  }

  const category = useMemo(
    () => props.categories.find((c) => c.code === draft.categoryCode),
    [props.categories, draft.categoryCode],
  )

  if (published) return <PublishedScreen invitation={published} />

  const fieldError = (key: string) => (errors[key] ? errorText(t, errors[key], key) : undefined)

  return (
    <div className={s.wizard}>
      <header className={s.head}>
        <h1 ref={headingRef} tabIndex={-1} className={s.title}>{t(props.mode === 'create' ? 'wizard.createTitle' : 'wizard.editTitle')}</h1>
        <ol className={s.steps} aria-label={t('wizard.stepOf', { current: index + 1, total: steps.length })}>
          {steps.map((name, i) => (
            <li
              key={name}
              className={cn(s.stepItem, i < index && s.stepDone, i === index && s.stepCurrent)}
              aria-current={i === index ? 'step' : undefined}
            >
              <span className={s.stepNumber}>{i + 1}</span>
              <span className={s.stepName}>{t(`wizard.steps.${name}`)}</span>
            </li>
          ))}
        </ol>
      </header>

      <div className={cn(s.layout, step === 'template' && s.layoutWide)}>
        <form ref={formRef} className={s.form} onSubmit={next} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}

          {step === 'template' && props.mode === 'create' && !saved ? (
            <section className={s.section}>
              <h2 className={s.sectionTitle}>{t('wizard.chooseTemplate')}</h2>
              {fieldError('template_code') ? <p className={s.error}>{fieldError('template_code')}</p> : null}
              <div className={s.templates} role="radiogroup" aria-label={t('wizard.chooseTemplate')}>
                {props.templates.map((tpl) => {
                  const selected = tpl.code === draft.templateCode
                  return (
                    <label key={tpl.code} className={cn(s.templateCard, selected && s.templateSelected)}>
                      <input
                        className={s.templateRadio}
                        type="radio"
                        name="template"
                        value={tpl.code}
                        aria-label={tpl.name[locale] || tpl.name['uz-Latn'] || tpl.code}
                        checked={selected}
                        onChange={() => chooseTemplate(tpl)}
                      />
                      <TemplateThumb
                        rendererKey={tpl.renderer_key}
                        content={tpl.default_content}
                        title=""
                        eventAt={fallbackEventAt}
                        timezone={SAMPLE_TIMEZONE}
                        venue={{ name: t('invitation.sampleVenueName'), address: t('invitation.sampleVenueAddress'), mapUrl: null }}
                        locale={locale}
                      />
                      <span className={s.templateName}>{tpl.name[locale] || tpl.name['uz-Latn'] || tpl.code}</span>
                      <span className={s.templateState}>{selected ? t('wizard.chosen') : t('wizard.choose')}</span>
                    </label>
                  )
                })}
              </div>
              {template && template.categories.length > 1 ? (
                <fieldset className={s.categories}>
                  <legend className={s.legend}>{t('wizard.category')}</legend>
                  {template.categories.map((code) => {
                    const cat = props.categories.find((c) => c.code === code)
                    return (
                      <label key={code} className={cn(s.chip, draft.categoryCode === code && s.chipSelected)}>
                        <input
                          type="radio"
                          name="category"
                          value={code}
                          checked={draft.categoryCode === code}
                          onChange={() => change({ categoryCode: code })}
                        />
                        {cat?.name[locale] || cat?.name['uz-Latn'] || code}
                      </label>
                    )
                  })}
                </fieldset>
              ) : null}
            </section>
          ) : null}

          {step === 'texts' ? (
            <section className={s.section}>
              {props.mode === 'create' ? <p className={s.note}>{t('wizard.textsNote')}</p> : null}
              <ContentFields
                rendererKey={rendererKey}
                fields={fields}
                values={draft.content}
                errors={errors}
                onChange={changeContent}
              />
              <TextField
                label={t('wizard.title')}
                hint={t('wizard.titleHint', { auto: autoTitle(draft.content) || '—' })}
                error={fieldError('title')}
                value={draft.title}
                maxLength={200}
                onChange={(e) => change({ title: e.target.value })}
              />
            </section>
          ) : null}

          {step === 'when' ? (
            <section className={s.section}>
              <div className={s.row}>
                <TextField
                  type="date"
                  label={`${t('wizard.date')} *`}
                  error={fieldError('event_at')}
                  value={draft.date}
                  required
                  onChange={(e) => change({ date: e.target.value })}
                />
                <TextField
                  type="time"
                  label={`${t('wizard.time')} *`}
                  hint={t('wizard.timeHint')}
                  value={draft.time}
                  required
                  onChange={(e) => change({ time: e.target.value })}
                />
              </div>
              <TextField
                label={`${t('wizard.venueName')} *`}
                error={fieldError('venue_name')}
                value={draft.venueName}
                required
                maxLength={200}
                onChange={(e) => change({ venueName: e.target.value })}
              />
              <TextField
                label={`${t('wizard.venueAddress')} *`}
                error={fieldError('venue_address')}
                value={draft.venueAddress}
                required
                maxLength={500}
                onChange={(e) => change({ venueAddress: e.target.value })}
              />
              <TextField
                type="url"
                inputMode="url"
                label={t('wizard.mapUrl')}
                hint={t('wizard.mapUrlHint')}
                error={fieldError('map_url')}
                value={draft.mapUrl}
                placeholder="https://"
                onChange={(e) => change({ mapUrl: e.target.value })}
              />
            </section>
          ) : null}

          {step === 'review' ? (
            <section className={s.section}>
              <h2 className={s.sectionTitle}>{t('wizard.summary')}</h2>
              <dl className={s.summary}>
                {template ? (
                  <>
                    <dt>{t('wizard.steps.template')}</dt>
                    <dd>{template.name[locale] || template.name['uz-Latn']}</dd>
                  </>
                ) : null}
                {category ? (
                  <>
                    <dt>{t('wizard.category')}</dt>
                    <dd>{category.name[locale] || category.name['uz-Latn']}</dd>
                  </>
                ) : null}
                <dt>{t('wizard.title')}</dt>
                <dd>{draft.title.trim() || autoTitle(draft.content)}</dd>
                {eventAtOf(draft) ? (
                  <>
                    <dt>{t('wizard.steps.when')}</dt>
                    <dd>{formatEventAt(t, eventAtOf(draft), SAMPLE_TIMEZONE)}</dd>
                  </>
                ) : null}
                <dt>{t('wizard.venueName')}</dt>
                <dd>
                  {draft.venueName}
                  <br />
                  {draft.venueAddress}
                </dd>
              </dl>
              {status === 'draft' && !savedId ? <p className={s.note}>{t('wizard.linkNote')}</p> : null}
              <div className={s.reviewPreview}>
                <PhonePreview {...previewProps} />
              </div>
            </section>
          ) : null}

          <footer className={s.footer}>
            {index > 0 ? (
              <Button variant="secondary" onClick={() => goTo(steps[index - 1]!)} disabled={busy}>
                {t('wizard.back')}
              </Button>
            ) : null}
            {step !== 'template' && step !== 'review' ? (
              <Button variant="secondary" className={s.previewButton} onClick={() => setPreviewOpen(true)}>
                {t('wizard.preview')}
              </Button>
            ) : null}
            <span className={s.spacer} />
            {isLast ? (
              status === 'draft' ? (
                <>
                  <Button variant="secondary" loading={busy && !publish.isPending} disabled={busy} onClick={() => void submit(false)}>
                    {t('wizard.saveDraft')}
                  </Button>
                  <Button loading={busy} onClick={() => void submit(true)}>
                    {t('wizard.publish')}
                  </Button>
                </>
              ) : (
                <Button loading={busy} onClick={() => void submit(false)}>
                  {t('wizard.save')}
                </Button>
              )
            ) : (
              <Button type="submit" disabled={step === 'template' && !draft.templateCode}>
                {t('wizard.next')}
              </Button>
            )}
          </footer>
        </form>

        {step !== 'template' && step !== 'review' ? (
          <aside className={s.side} aria-label={t('wizard.previewTitle')}>
            <PhonePreview {...previewProps} />
          </aside>
        ) : null}
      </div>

      <Dialog open={previewOpen} title={t('wizard.previewTitle')} onClose={() => setPreviewOpen(false)}>
        {previewOpen ? <PhonePreview {...previewProps} /> : null}
      </Dialog>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title={t('wizard.leaveTitle')}
        description={t('wizard.leaveText')}
        confirmLabel={t('wizard.leave')}
        cancelLabel={t('wizard.stay')}
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />
    </div>
  )
}

/** Yangi taklifnoma: andoza bitta bo'lsa — darhol tanlangan. */
function initialDraft(templates: ModelsTemplateResponse[]): InvitationDraft {
  const draft = emptyDraft()
  const only = templates.length === 1 ? templates[0] : undefined
  if (!only) return draft
  return { ...draft, templateCode: only.code, categoryCode: only.categories[0] ?? '', content: { ...only.default_content } }
}

/** InvitationDraft maydoni → xato kaliti (backend nomi). */
function errorKeyOf(key: string): string {
  switch (key) {
    case 'date':
    case 'time':
      return 'event_at'
    case 'venueName':
      return 'venue_name'
    case 'venueAddress':
      return 'venue_address'
    case 'mapUrl':
      return 'map_url'
    case 'templateCode':
      return 'template_code'
    case 'categoryCode':
      return 'category_code'
    default:
      return key
  }
}
