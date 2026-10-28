import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ModelsPublicInvitationResponse } from '@/shared/api'
import { i18n } from '@/shared/i18n'
import { InvitationPage } from './InvitationPage'

const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>()
const reply = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

const invitation: ModelsPublicInvitationResponse = {
  slug: 'k7mx2qvd',
  title: 'Jasur & Madina',
  renderer_key: 'sochqi-konvert@1',
  category_code: 'wedding',
  event_at: '2099-11-14T18:00:00+05:00',
  timezone: 'Asia/Tashkent',
  locale: 'uz-Latn',
  venue_name: 'Navro‘z to‘yxonasi',
  venue_address: 'Toshkent, Amir Temur 1',
  map_url: null,
  content: {
    groom: 'Jasur',
    bride: 'Madina',
    greeting_text: 'Farzandlarimiz {groom} va {bride}ning to‘yiga taklif etamiz',
    quote: '',
  },
}

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:slug" element={<InvitationPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(async () => {
  await i18n.changeLanguage('ru') // sayt tili taklifnomaga ta'sir qilmasligi kerak
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  // konvert animatsiyasiz ochilsin
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce'), media: query }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('InvitationPage', () => {
  it('opens the envelope and shows the invitation in its own language', async () => {
    fetchMock.mockReturnValue(reply(200, invitation))
    const user = userEvent.setup()
    renderAt('/k7mx2qvd')

    await user.click(await screen.findByRole('button', { name: 'Taklifnomani ochish' }))

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Jasur & Madina')
    expect(screen.getByText('Farzandlarimiz Jasur va Madinaning to‘yiga taklif etamiz')).toBeInTheDocument()
    expect(screen.getByText('14-noyabr · 2099-yil')).toBeInTheDocument()
    expect(screen.getByText('18:00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xaritada ochish' })).toHaveAttribute(
      'href',
      'https://yandex.uz/maps/?text=Toshkent%2C%20Amir%20Temur%201',
    )
    expect(document.documentElement.lang).toBe('uz-Latn')
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/public/invitations/k7mx2qvd')
  })

  it('leaves out empty blocks', async () => {
    fetchMock.mockReturnValue(reply(200, invitation))
    const user = userEvent.setup()
    const { container } = renderAt('/k7mx2qvd')

    await user.click(await screen.findByRole('button', { name: 'Taklifnomani ochish' }))
    await screen.findByRole('heading', { level: 1 })

    expect(container.querySelector('blockquote')).toBeNull()
  })

  it('says not found for a missing or expired invitation', async () => {
    fetchMock.mockReturnValue(reply(404, { error: { code: 'not_found', message: 'x' } }))
    renderAt('/k7mx2qvd')

    expect(await screen.findByRole('heading', { name: 'Приглашение не найдено' })).toBeInTheDocument()
  })

  it('does not call the API for a malformed link', async () => {
    renderAt('/Jasur_Madina')

    expect(await screen.findByRole('heading', { name: 'Приглашение не найдено' })).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('offers a retry when the server is unreachable', async () => {
    fetchMock.mockReturnValueOnce(reply(500, { error: { code: 'internal', message: 'x' } }))
    fetchMock.mockReturnValueOnce(reply(200, invitation))
    const user = userEvent.setup()
    renderAt('/k7mx2qvd')

    await user.click(await screen.findByRole('button', { name: 'Повторить' }))

    expect(await screen.findByRole('button', { name: 'Taklifnomani ochish' })).toBeInTheDocument()
  })
})
