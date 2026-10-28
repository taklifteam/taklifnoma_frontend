import { useTranslation } from 'react-i18next'
import type { ModelsInvitationResponse } from '@/shared/api'
import { copyText } from '@/shared/lib/clipboard'
import { telegramShareUrl } from '@/shared/lib/share'
import { useToast } from '@/shared/ui'

/** Havolani nusxalash va Telegram'da ulashish (kabinet kartochkasi va muvaffaqiyat ekrani uchun). */
export function useShareActions() {
  const { t } = useTranslation()
  const toast = useToast()
  return {
    copy: async (inv: Pick<ModelsInvitationResponse, 'url'>) => {
      if (await copyText(inv.url)) toast.success(t('cabinet.copied'))
      else toast.error(t('cabinet.copyFailed'))
    },
    telegramUrl: (inv: Pick<ModelsInvitationResponse, 'url' | 'title'>) => telegramShareUrl(inv.url, inv.title),
  }
}
