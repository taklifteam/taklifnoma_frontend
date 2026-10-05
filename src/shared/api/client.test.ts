import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, refreshSession, session } from './client'
import { ApiError } from './errors'

const REFRESH_KEY = 'taklifnoma.refresh_token'

const tokens = (n: number) => ({
  access_token: `access-${n}`,
  refresh_token: `refresh-${n}`,
  token_type: 'Bearer',
  expires_in: 900,
  user: {
    id: 'u1',
    full_name: 'Elyor',
    phone: '998901234567',
    email: null,
    locale: 'uz-Latn',
    role: 'client',
    is_staff: false,
    permissions: [],
  },
})

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const error = (status: number, code: string) => json(status, { error: { code, message: code } })

type FetchArgs = [string, RequestInit]
const fetchMock = vi.fn<(...args: FetchArgs) => Promise<Response>>()
const headerOf = (init: RequestInit) => (init.headers as Record<string, string>).Authorization
const refreshCalls = () => fetchMock.mock.calls.filter(([url]) => url.endsWith('/api/auth/refresh'))

beforeEach(() => {
  session.clear()
  localStorage.clear()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('sends the access token', async () => {
    session.save(tokens(1))
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }))

    await api.get('/api/auth/me')

    expect(headerOf(fetchMock.mock.calls[0]![1])).toBe('Bearer access-1')
  })

  it('refreshes once for parallel requests and retries them', async () => {
    session.save(tokens(1))
    fetchMock.mockImplementation(async (url, init) => {
      if (url.endsWith('/api/auth/refresh')) return json(200, tokens(2))
      return headerOf(init) === 'Bearer access-2' ? json(200, { ok: true }) : error(401, 'token_expired')
    })

    const results = await Promise.all([api.get('/api/a'), api.get('/api/b'), api.get('/api/c')])

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }])
    expect(refreshCalls()).toHaveLength(1)
    expect(localStorage.getItem(REFRESH_KEY)).toBe('refresh-2')
  })

  it('ends the session when the refresh token is rejected', async () => {
    session.save(tokens(1))
    const onExpired = vi.fn()
    const unsubscribe = session.onExpired(onExpired)
    fetchMock.mockImplementation(async (url) =>
      url.endsWith('/api/auth/refresh') ? error(401, 'unauthorized') : error(401, 'token_expired'),
    )

    await expect(api.get('/api/a')).rejects.toMatchObject({ status: 401, code: 'token_expired' })

    expect(onExpired).toHaveBeenCalledOnce()
    expect(session.hasRefreshToken()).toBe(false)
    expect(session.hasAccessToken()).toBe(false)
    unsubscribe()
  })

  it('retries with the token another tab has just stored', async () => {
    localStorage.setItem(REFRESH_KEY, 'refresh-old')
    fetchMock.mockImplementation(async (_url, init) => {
      const { refresh_token } = JSON.parse(String(init.body)) as { refresh_token: string }
      if (refresh_token === 'refresh-old') {
        localStorage.setItem(REFRESH_KEY, 'refresh-from-other-tab')
        return error(401, 'unauthorized')
      }
      return json(200, tokens(3))
    })

    const result = await refreshSession()

    expect(result?.access_token).toBe('access-3')
    expect(refreshCalls()).toHaveLength(2)
  })

  it('keeps the session on a server error during refresh', async () => {
    localStorage.setItem(REFRESH_KEY, 'refresh-1')
    fetchMock.mockResolvedValue(error(500, 'internal'))

    await expect(refreshSession()).rejects.toMatchObject({ status: 500 })
    expect(session.hasRefreshToken()).toBe(true)
  })

  it('turns error responses into ApiError with fields', async () => {
    fetchMock.mockResolvedValueOnce(
      json(400, { error: { code: 'validation', message: 'x', fields: { phone: 'invalid' } } }),
    )

    const err = await api.post('/api/auth/register', {}, { auth: false }).catch((e: unknown) => e)

    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 400, code: 'validation', fields: { phone: 'invalid' } })
  })

  it('reports network failures as code "network"', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(api.get('/api/a')).rejects.toMatchObject({ status: 0, code: 'network' })
  })
})
