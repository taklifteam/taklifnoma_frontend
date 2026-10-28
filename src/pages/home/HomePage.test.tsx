import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/shared/i18n'
import { ToastProvider } from '@/shared/ui'
import { fakeApi, invitation } from '@/test/fixtures'
import { HomePage } from './HomePage'

vi.mock('@/features/auth', () => ({
  useAuth: () => ({ status: 'authenticated', user: { full_name: 'Gulruhsor' } }),
}))

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}

beforeEach(async () => {
  await i18n.changeLanguage('uz-Latn')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('HomePage', () => {
  it('invites to create the first invitation', async () => {
    vi.stubGlobal('fetch', fakeApi({ 'GET /api/invitations': () => ({ status: 200, body: { items: [] } }) }).fetch)
    renderHome()

    expect(await screen.findByRole('heading', { name: 'Hali taklifnoma yo‘q' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Taklifnoma yaratish' })).toHaveAttribute('href', '/invitations/new')
  })

  it('shows actions by status', async () => {
    const published = invitation({ id: 'a', title: 'Jasur & Madina', status: 'published' })
    const expired = invitation({ id: 'b', title: 'Aziz & Laylo', status: 'expired' })
    vi.stubGlobal(
      'fetch',
      fakeApi({ 'GET /api/invitations': () => ({ status: 200, body: { items: [published, expired] } }) }).fetch,
    )
    renderHome()

    const first = (await screen.findByRole('heading', { name: 'Jasur & Madina' })).closest('article')!
    expect(within(first).getByText('E’lon qilingan')).toBeInTheDocument()
    expect(within(first).getByRole('link', { name: 'Tahrirlash' })).toHaveAttribute('href', '/invitations/a/edit')
    expect(within(first).getByRole('button', { name: 'Havolani nusxalash' })).toBeInTheDocument()

    const second = screen.getByRole('heading', { name: 'Aziz & Laylo' }).closest('article')!
    expect(within(second).getByText('Muddati tugagan')).toBeInTheDocument()
    expect(within(second).queryByRole('link', { name: 'Tahrirlash' })).toBeNull()
  })

  it('deletes after confirmation', async () => {
    let items = [invitation({ id: 'a', title: 'Jasur & Madina' })]
    const api = fakeApi({
      'GET /api/invitations': () => ({ status: 200, body: { items } }),
      'DELETE /api/invitations/a': () => {
        items = []
        return { status: 204 }
      },
    })
    vi.stubGlobal('fetch', api.fetch)
    const user = userEvent.setup()
    renderHome()

    await user.click(await screen.findByRole('button', { name: 'O‘chirish' }))
    const dialog = screen.getByRole('dialog', { name: 'Taklifnomani o‘chirish' })
    expect(dialog).toHaveTextContent('Havola ishlamay qoladi')
    await user.click(within(dialog).getByRole('button', { name: 'O‘chirish' }))

    expect(await screen.findByRole('heading', { name: 'Hali taklifnoma yo‘q' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Taklifnoma o‘chirildi')
    expect(api.calls.map((c) => c.key)).toContain('DELETE /api/invitations/a')
  })
})
