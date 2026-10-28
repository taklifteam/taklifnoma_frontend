import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, Link, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/shared/i18n'
import { ToastProvider } from '@/shared/ui'
import { categories, fakeApi, invitation, sochqiTemplate } from '@/test/fixtures'
import { InvitationWizard } from './InvitationWizard'

// sana — doim kelajakda, lekin 3 yildan yaqin
function futureDate(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)
}

function renderWizard(element: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/', element: <h1>Mening taklifnomalarim</h1> },
      {
        path: '/wizard',
        element: (
          <>
            <Link to="/">Bosh sahifa</Link>
            {element}
          </>
        ),
      },
    ],
    { initialEntries: ['/wizard'] },
  )
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
  return router
}

beforeEach(async () => {
  await i18n.changeLanguage('uz-Latn')
  vi.stubGlobal('scrollTo', () => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('InvitationWizard (create)', () => {
  it('creates, publishes and shows the link', async () => {
    const created = invitation()
    const api = fakeApi({
      'POST /api/invitations': () => ({ status: 201, body: created }),
      [`POST /api/invitations/${created.id}/publish`]: () => ({ status: 200, body: { ...created, status: 'published' } }),
    })
    vi.stubGlobal('fetch', api.fetch)
    const user = userEvent.setup()
    renderWizard(<InvitationWizard mode="create" templates={[sochqiTemplate]} categories={categories} />)

    // 1. andoza bitta — tanlangan; ikki tadbir turi bor — tanlash mumkin
    expect(screen.getByRole('radio', { name: /Sochqi · Konvert/ })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: 'Fotiha to‘yi' }))
    await user.click(screen.getByRole('button', { name: 'Davom etish' }))

    // 2. matnlar: namuna bilan to'ldirilgan; uzun matn — textarea
    expect(screen.getByLabelText('Kuyovning ismi *')).toHaveValue('Jasur')
    expect(screen.getByLabelText('Taklif matni').tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('Kuyovning ismi *').tagName).toBe('INPUT')
    await user.clear(screen.getByLabelText('Kuyovning ismi *'))
    await user.type(screen.getByLabelText('Kuyovning ismi *'), 'Sardor')
    await user.click(screen.getByRole('button', { name: 'Davom etish' }))

    // 3. sana va joy
    const date = futureDate(60)
    fireEvent.change(screen.getByLabelText('Sana *'), { target: { value: date } })
    await user.type(screen.getByLabelText('To‘yxona yoki joy nomi *'), 'Navro‘z')
    await user.type(screen.getByLabelText('Manzil *'), 'Toshkent, Amir Temur 1')
    await user.click(screen.getByRole('button', { name: 'Davom etish' }))

    // 4. ko'rib chiqish → e'lon qilish
    await user.click(screen.getByRole('button', { name: 'Saqlash va e’lon qilish' }))

    expect(await screen.findByRole('heading', { name: 'Taklifnomangiz tayyor!' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://taklifnoma.uz/k7mx2qvd')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Telegram’da ulashish' })).toHaveAttribute(
      'href',
      expect.stringContaining('https://t.me/share/url?url=https%3A%2F%2Ftaklifnoma.uz%2Fk7mx2qvd'),
    )
    expect(api.calls.map((c) => c.key)).toEqual(['POST /api/invitations', `POST /api/invitations/${created.id}/publish`])
    expect(api.calls[0]!.body).toEqual({
      template_code: 'sochqi-konvert',
      category_code: 'engagement',
      title: 'Sardor & Madina',
      event_at: `${date}T18:00:00+05:00`,
      venue_name: 'Navro‘z',
      venue_address: 'Toshkent, Amir Temur 1',
      map_url: null,
      content: { groom: 'Sardor', bride: 'Madina', greeting_text: '{groom} va {bride}ning to‘yi' },
    })
  })

  it('does not move on while the step has errors', async () => {
    vi.stubGlobal('fetch', fakeApi({}).fetch)
    const user = userEvent.setup()
    renderWizard(<InvitationWizard mode="create" templates={[sochqiTemplate]} categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Davom etish' }))
    await user.clear(screen.getByLabelText('Kelinning ismi *'))
    await user.click(screen.getByRole('button', { name: 'Davom etish' }))

    expect(screen.getByLabelText('Kelinning ismi *')).toHaveAccessibleDescription('Bu maydonni to‘ldiring')
    expect(screen.getByRole('alert')).toHaveTextContent('Ba’zi maydonlarda xato bor')
  })
})

describe('InvitationWizard (edit)', () => {
  it('returns to the step of a server validation error', async () => {
    const inv = invitation()
    const api = fakeApi({
      [`PUT /api/invitations/${inv.id}`]: () => ({
        status: 400,
        body: { error: { code: 'validation', message: 'x', fields: { 'content.groom': 'too_long' } } },
      }),
    })
    vi.stubGlobal('fetch', api.fetch)
    const user = userEvent.setup()
    renderWizard(<InvitationWizard mode="edit" invitation={inv} categories={categories} />)

    // tahrirlashda andoza qadami yo'q
    expect(screen.queryByRole('radio')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Davom etish' }))
    await user.click(screen.getByRole('button', { name: 'Davom etish' }))
    await user.click(screen.getByRole('button', { name: 'Qoralama sifatida saqlash' }))

    expect(await screen.findByLabelText('Kuyovning ismi *')).toHaveAccessibleDescription('Juda uzun')
    expect(api.calls[0]!.body).toMatchObject({ event_at: inv.event_at })
  })

  it('offers only "save" for a published invitation and goes back to the list', async () => {
    const inv = invitation({ status: 'published' })
    const api = fakeApi({ [`PUT /api/invitations/${inv.id}`]: () => ({ status: 200, body: inv }) })
    vi.stubGlobal('fetch', api.fetch)
    const user = userEvent.setup()
    const router = renderWizard(<InvitationWizard mode="edit" invitation={inv} categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Davom etish' }))
    await user.click(screen.getByRole('button', { name: 'Davom etish' }))
    expect(screen.queryByRole('button', { name: /e’lon qilish/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Saqlash' }))

    expect(await screen.findByRole('heading', { name: 'Mening taklifnomalarim' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('asks before leaving with unsaved changes', async () => {
    vi.stubGlobal('fetch', fakeApi({}).fetch)
    const user = userEvent.setup()
    const router = renderWizard(<InvitationWizard mode="edit" invitation={invitation()} categories={categories} />)

    await user.type(screen.getByLabelText('Taklif qiluvchilar'), 'Karimovlar')
    await user.click(screen.getByRole('link', { name: 'Bosh sahifa' }))

    const dialog = await screen.findByRole('dialog', { name: 'Sahifadan chiqasizmi?' })
    await user.click(within(dialog).getByRole('button', { name: 'Qolish' }))
    expect(router.state.location.pathname).toBe('/wizard')

    await user.click(screen.getByRole('link', { name: 'Bosh sahifa' }))
    await user.click(within(await screen.findByRole('dialog', { name: 'Sahifadan chiqasizmi?' })).getByRole('button', { name: 'Chiqish' }))
    expect(router.state.location.pathname).toBe('/')
  })
})

it('keeps the persisted template and category after publish failure', async () => {
  const created = invitation()
  const api = fakeApi({
    'POST /api/invitations': () => ({ status: 201, body: created }),
    [`POST /api/invitations/${created.id}/publish`]: () => ({ status: 500, body: { error: { code: 'unknown' } } }),
    [`PUT /api/invitations/${created.id}`]: () => ({ status: 200, body: created }),
  })
  vi.stubGlobal('fetch', api.fetch)
  const user = userEvent.setup()
  renderWizard(<InvitationWizard mode="create" templates={[sochqiTemplate]} categories={categories} />)
  await user.click(screen.getByRole('button', { name: 'Davom etish' }))
  await user.click(screen.getByRole('button', { name: 'Davom etish' }))
  fireEvent.change(screen.getByLabelText('Sana *'), { target: { value: futureDate(30) } })
  await user.type(screen.getByLabelText('To‘yxona yoki joy nomi *'), 'Navro‘z')
  await user.type(screen.getByLabelText('Manzil *'), 'Toshkent')
  await user.click(screen.getByRole('button', { name: 'Davom etish' }))
  await user.click(screen.getByRole('button', { name: 'Saqlash va e’lon qilish' }))
  await screen.findByRole('alert')
  for (let i = 0; i < 2; i++) await user.click(screen.getByRole('button', { name: 'Orqaga' }))
  expect(screen.queryByRole('radio')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Orqaga' })).toBeNull()
  for (let i = 0; i < 2; i++) await user.click(screen.getByRole('button', { name: 'Davom etish' }))
  expect(api.calls.filter(c => c.key === 'POST /api/invitations')).toHaveLength(1)
  await user.click(screen.getByRole('button', { name: 'Qoralama sifatida saqlash' }))
  await screen.findByRole('heading', { name: 'Mening taklifnomalarim' })
  expect(api.calls.find(c => c.key === 'POST /api/invitations')?.body).toMatchObject({ category_code: 'wedding' })
  expect(api.calls.find(c => c.key.startsWith('PUT '))?.body).not.toHaveProperty('category_code')
})

it('saves a text correction on an ongoing published event', async () => {
  const inv = invitation({ status: 'published', event_at: new Date(Date.now() - 3600000).toISOString() })
  const api = fakeApi({ [`PUT /api/invitations/${inv.id}`]: () => ({ status: 200, body: inv }) })
  vi.stubGlobal('fetch', api.fetch)
  const user = userEvent.setup()
  renderWizard(<InvitationWizard mode="edit" invitation={inv} categories={categories} />)
  await user.type(screen.getByLabelText('Taklif qiluvchilar'), 'Karimovlar')
  await user.click(screen.getByRole('button', { name: 'Davom etish' }))
  await user.click(screen.getByRole('button', { name: 'Davom etish' }))
  await user.click(screen.getByRole('button', { name: 'Saqlash' }))
  await screen.findByRole('heading', { name: 'Mening taklifnomalarim' })
  expect(api.calls[0]?.body).toMatchObject({ event_at: inv.event_at })
})
