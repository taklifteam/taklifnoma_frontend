import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { session } from '@/shared/api'
import { endSession, meQueryKey, type Me } from './api'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

const me: Me = {
  id: 'u1',
  full_name: 'Elyor',
  phone: '998901234567',
  email: null,
  locale: 'uz-Latn',
  role: 'client',
  is_staff: false,
  permissions: [],
}

function Status() {
  const auth = useAuth()
  return <p>{auth.status === 'authenticated' ? `kirgan: ${auth.user.full_name}` : auth.status}</p>
}

beforeEach(() => {
  localStorage.clear()
  session.clear()
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// Regressiya: keshni o'chirish (clear/removeQueries) ochiq turgan useQuery'ga xabar bermaydi —
// chiqqandan keyin ham ekran "kirgan" bo'lib qolardi.
it('switches to guest immediately after the session ends', async () => {
  const queryClient = new QueryClient()
  queryClient.setQueryData(['invitations'], ['eski ma’lumot'])
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Status />
      </AuthProvider>
    </QueryClientProvider>,
  )
  expect(await screen.findByText('guest')).toBeInTheDocument()

  act(() => {
    queryClient.setQueryData(meQueryKey, me)
  })
  expect(await screen.findByText('kirgan: Elyor')).toBeInTheDocument()

  act(() => {
    endSession(queryClient)
  })
  expect(await screen.findByText('guest')).toBeInTheDocument()
  expect(queryClient.getQueryData(['invitations'])).toBeUndefined()
})
