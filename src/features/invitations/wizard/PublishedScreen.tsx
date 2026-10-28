import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { ModelsInvitationResponse } from '@/shared/api'
import { Button, Rings } from '@/shared/ui'
import { useShareActions } from '../useShareActions'
import s from './Wizard.module.css'

/** E'lon qilingandan keyin: havola va uni ulashish yo'llari. */
export function PublishedScreen({ invitation }: { invitation: ModelsInvitationResponse }) {
  const { t } = useTranslation()
  const share = useShareActions()
  return (
    <section className={s.done} aria-labelledby="done-title">
      <Rings />
      <h1 id="done-title" className={s.doneTitle}>
        {t('wizard.doneTitle')}
      </h1>
      <p className={s.doneText}>{t('wizard.doneText')}</p>
      <label className={s.linkBox}>
        <span className={s.legend}>{t('wizard.link')}</span>
        <input readOnly value={invitation.url} className={s.linkInput} onFocus={(e) => e.target.select()} />
      </label>
      <div className={s.doneActions}>
        <Button onClick={() => void share.copy(invitation)}>{t('cabinet.copy')}</Button>
        <a className={s.linkButton} href={share.telegramUrl(invitation)} target="_blank" rel="noopener noreferrer">
          {t('cabinet.telegram')}
        </a>
        <a className={s.linkButton} href={invitation.url} target="_blank" rel="noopener noreferrer">
          {t('wizard.openInvitation')}
        </a>
      </div>
      <Link to="/" className={s.back}>
        {t('wizard.toList')}
      </Link>
    </section>
  )
}
