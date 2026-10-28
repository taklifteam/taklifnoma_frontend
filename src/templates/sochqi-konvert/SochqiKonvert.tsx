// "Sochqi · Konvert" (sochqi-konvert@1): oltin yurak muhrli konvert, ochilganda — krem fonda taklifnoma,
// atrofida tanga, navvot va gul barglari. E'lon qilingan versiya: ko'rinishini o'zgartirmang, yangisi — @2.

import { useEffect, useMemo, useState } from 'react'
import { i18n } from '@/shared/i18n'
import { Rings, SochqiScene } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { downloadIcs, mapHref } from '../lib/calendar'
import { field, fillPlaceholders } from '../lib/content'
import { countdown, eventDateParts } from '../lib/eventDate'
import type { TemplateProps } from '../types'
import s from './SochqiKonvert.module.css'

const OPEN_ANIMATION_MS = 900

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Hozirgi vaqt, daqiqada bir yangilanadi (sanagacha qolgan vaqt uchun). */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function SochqiKonvert({ content, title, eventAt, timezone, venue, locale, mode, slug }: TemplateProps) {
  // Taklifnoma o'z tilida: saytning tanlangan tili bu yerga ta'sir qilmaydi.
  const t = useMemo(() => i18n.getFixedT(locale, undefined, 'invitation'), [locale])
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>(mode === 'guest' ? 'closed' : 'open')

  useEffect(() => {
    if (stage !== 'opening') return
    const id = setTimeout(() => setStage('open'), prefersReducedMotion() ? 0 : OPEN_ANIMATION_MS)
    return () => clearTimeout(id)
  }, [stage])

  const groom = field(content, 'groom')
  const bride = field(content, 'bride')

  return (
    <div className={s.root} lang={locale}>
      <SochqiScene className={s.scene} />
      {stage === 'open' ? (
        <Letter
          t={t}
          content={content}
          title={title}
          eventAt={eventAt}
          timezone={timezone}
          venue={venue}
          interactive={mode === 'guest'}
          slug={slug}
        />
      ) : (
        <div className={cn(s.cover, stage === 'opening' && s.opening)}>
          <p className={s.coverNote}>{t('envelopeNote')}</p>
          <div className={s.envelope} aria-hidden="true">
            <div className={s.envelopeBack} />
            <div className={s.envelopeLetter} />
            <div className={s.envelopeFront} />
            <div className={s.envelopeFlap} />
            <HeartSeal className={s.seal} />
          </div>
          <p className={s.coverNames}>
            {groom}
            {groom && bride ? <span className={s.amp}> & </span> : null}
            {bride}
          </p>
          <button type="button" className={s.openButton} onClick={() => setStage('opening')} disabled={stage === 'opening'}>
            {t('open')}
          </button>
        </div>
      )}
    </div>
  )
}

type LetterProps = Pick<TemplateProps, 'content' | 'title' | 'eventAt' | 'timezone' | 'venue' | 'slug'> & {
  t: ReturnType<typeof i18n.getFixedT>
  /** false — preview: tugmalar bosilmaydi */
  interactive: boolean
}

function Letter({ t, content, title, eventAt, timezone, venue, interactive, slug }: LetterProps) {
  const now = useNow()
  const date = eventDateParts(eventAt, timezone)
  const left = countdown(eventAt, now)
  const months = t('months', { returnObjects: true }) as string[]
  const weekdays = t('weekdays', { returnObjects: true }) as string[]

  const hosts = field(content, 'hosts')
  const groom = field(content, 'groom')
  const bride = field(content, 'bride')
  const greeting = field(content, 'greeting_text')
  const quote = field(content, 'quote')
  const quoteRef = field(content, 'quote_ref')
  const closing = field(content, 'closing_text')

  function addToCalendar() {
    downloadIcs({
      uid: `${slug ?? 'preview'}@taklifnoma`,
      title: title || [groom, bride].filter(Boolean).join(' & '),
      eventAt,
      location: [venue.name, venue.address].filter(Boolean).join(', '),
    })
  }

  return (
    <article className={cn(s.letter, interactive && s.rise)}>
      {hosts ? <p className={s.hosts}>{hosts}</p> : null}

      <h1 className={s.names}>
        {groom ? <span className={s.name}>{groom}</span> : null}
        {groom && bride ? <span className={s.amp}> & </span> : null}
        {bride ? <span className={s.name}>{bride}</span> : null}
      </h1>

      <Rings className={s.rings} />

      {greeting ? <p className={s.greeting}>{fillPlaceholders(greeting, content)}</p> : null}

      <section className={s.date} aria-label={t('when')}>
        <span className={s.dateSide}>{weekdays[date.weekday]}</span>
        <span className={s.dateDay}>{date.day}</span>
        <span className={s.dateSide}>{date.time}</span>
        <span className={s.dateLine}>
          {t('dayLine', { day: date.day, month: months[date.month - 1] })} · {t('yearLine', { year: date.year })}
        </span>
      </section>

      {left ? (
        <section className={s.countdown} aria-label={t('countdown')}>
          <p className={s.label}>{t('countdown')}</p>
          <div className={s.countdownGrid}>
            <span>
              <b>{left.days}</b> {t('days')}
            </span>
            <span>
              <b>{left.hours}</b> {t('hours')}
            </span>
            <span>
              <b>{left.minutes}</b> {t('minutes')}
            </span>
          </div>
        </section>
      ) : null}

      {venue.name || venue.address ? (
        <section className={s.venue}>
          <p className={s.label}>{t('where')}</p>
          {venue.name ? <p className={s.venueName}>{venue.name}</p> : null}
          {venue.address ? <p className={s.venueAddress}>{venue.address}</p> : null}
        </section>
      ) : null}

      {/* preview'da tugmalar o'rniga oddiy belgi: andoza tanlash kartochkasi (tugma) ichida ham turadi */}
      <div className={s.actions}>
        {interactive ? (
          <>
            <a className={s.action} href={mapHref(venue.mapUrl, venue.address || venue.name)} target="_blank" rel="noopener noreferrer">
              <PinIcon />
              {t('map')}
            </a>
            <button type="button" className={s.action} onClick={addToCalendar}>
              <CalendarIcon />
              {t('calendar')}
            </button>
          </>
        ) : (
          <>
            <span className={s.action} aria-disabled="true">
              <PinIcon />
              {t('map')}
            </span>
            <span className={s.action} aria-disabled="true">
              <CalendarIcon />
              {t('calendar')}
            </span>
          </>
        )}
      </div>

      {quote ? (
        <figure className={s.quote}>
          <blockquote>{quote}</blockquote>
          {quoteRef ? <figcaption>{quoteRef}</figcaption> : null}
        </figure>
      ) : null}

      {closing ? <p className={s.closing}>{closing}</p> : null}

      <HeartSeal className={s.footerSeal} />
      <p className={s.madeWith}>{t('madeWith')}</p>
    </article>
  )
}

function HeartSeal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="var(--gold-500)" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="var(--gold-700)" strokeWidth="1.5" strokeDasharray="2 3" />
      <path
        d="M32 45 C20 37 16 31 16 25.5 C16 21 19.5 18 23.5 18 C27 18 30 20 32 23 C34 20 37 18 40.5 18 C44.5 18 48 21 48 25.5 C48 31 44 37 32 45Z"
        fill="var(--gold-100)"
        stroke="var(--gold-700)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}
