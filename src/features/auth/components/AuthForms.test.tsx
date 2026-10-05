import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/shared/i18n'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>()
const reply = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

function renderForm(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(async () => {
  await i18n.changeLanguage('uz-Latn')
  localStorage.clear()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('LoginForm', () => {
  it('shows the server message for wrong credentials', async () => {
    fetchMock.mockReturnValue(reply(401, { error: { code: 'invalid_credentials', message: 'x' } }))
    const user = userEvent.setup()
    renderForm(<LoginForm />)

    await user.type(screen.getByLabelText('Telefon raqam yoki email'), '90 123 45 67')
    await user.type(screen.getByLabelText('Parol'), 'notogri-parol')
    await user.click(screen.getByRole('button', { name: 'Kirish' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Login yoki parol noto‘g‘ri')
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1].body))).toEqual({
      login: '90 123 45 67',
      password: 'notogri-parol',
    })
  })

  it('does not call the API with empty fields', async () => {
    const user = userEvent.setup()
    renderForm(<LoginForm />)

    await user.click(screen.getByRole('button', { name: 'Kirish' }))

    expect(await screen.findAllByText('Bu maydonni to‘ldiring')).toHaveLength(2)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('RegisterForm', () => {
  it('formats the phone and sends it in API form', async () => {
    fetchMock.mockReturnValue(reply(409, { error: { code: 'phone_taken', message: 'x' } }))
    const user = userEvent.setup()
    renderForm(<RegisterForm />)

    await user.type(screen.getByLabelText('Ismingiz'), 'Gulruhsor Karimova')
    const phone = screen.getByLabelText('Telefon raqam')
    await user.type(phone, '901234567')
    expect(phone).toHaveValue('90 123 45 67')
    await user.type(screen.getByLabelText('Parol'), 'yangi-parol')
    await user.click(screen.getByRole('button', { name: 'Hisob ochish' }))

    // phone_taken — umumiy xabar emas, telefon maydoni ostida chiqadi
    expect(await screen.findByText(/Bu raqam ro‘yxatdan o‘tgan/)).toBeInTheDocument()
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1].body))).toEqual({
      full_name: 'Gulruhsor Karimova',
      phone: '998901234567',
      password: 'yangi-parol',
    })
  })

  it('validates phone and password length on the client', async () => {
    const user = userEvent.setup()
    renderForm(<RegisterForm />)

    await user.type(screen.getByLabelText('Ismingiz'), 'Elyor')
    await user.type(screen.getByLabelText('Telefon raqam'), '90123')
    await user.type(screen.getByLabelText('Parol'), 'qisqa')
    await user.click(screen.getByRole('button', { name: 'Hisob ochish' }))

    expect(await screen.findByText('Telefon raqamni to‘liq kiriting: 90 123 45 67')).toBeInTheDocument()
    expect(screen.getByText('Parol kamida 8 belgidan iborat bo‘lsin')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps backend validation fields to inputs', async () => {
    fetchMock.mockReturnValue(
      reply(400, { error: { code: 'validation', message: 'x', fields: { full_name: 'too_long' } } }),
    )
    const user = userEvent.setup()
    renderForm(<RegisterForm />)

    await user.type(screen.getByLabelText('Ismingiz'), 'Elyor')
    await user.type(screen.getByLabelText('Telefon raqam'), '901234567')
    await user.type(screen.getByLabelText('Parol'), 'yangi-parol')
    await user.click(screen.getByRole('button', { name: 'Hisob ochish' }))

    expect(await screen.findByText('Ism 120 belgidan oshmasin')).toBeInTheDocument()
  })
})
