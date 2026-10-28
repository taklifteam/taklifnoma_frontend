import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TemplateView } from './TemplateView'

describe('TemplateView', () => {
  it('explains instead of crashing on an unknown renderer', () => {
    render(
      <TemplateView
        rendererKey="yangi-andoza@1"
        content={{}}
        title=""
        eventAt="2099-01-01T18:00:00+05:00"
        timezone="Asia/Tashkent"
        venue={{ name: '', address: '', mapUrl: null }}
        locale="uz-Latn"
        mode="preview"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Bu taklifnoma dizayni hozircha ochilmadi')
  })
})
