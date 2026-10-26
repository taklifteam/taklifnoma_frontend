// Backend bilan ishlaydigan yagona joy: so'rov yuborish, token qo'shish, token yangilash.
// Feature'lar token haqida o'ylamaydi — faqat api.get / api.post'ni chaqiradi.

import { ApiError } from './errors'
import type { ModelsErrorResponse, ModelsTokenResponse } from './types'

export type TokenResponse = ModelsTokenResponse

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const REFRESH_KEY = 'taklifnoma.refresh_token'

// localStorage xususiy rejimda yoki bloklanganda xato berishi mumkin.
const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch {
      // saqlab bo'lmasa, sessiya faqat shu sahifa ochiq turganda ishlaydi
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // e'tiborsiz
    }
  },
}

// Access token faqat xotirada turadi: sahifa yangilansa, refresh token orqali qayta olinadi.
let accessToken: string | null = null
let refreshing: Promise<TokenResponse | null> | null = null
const expiredListeners = new Set<() => void>()

export const session = {
  /** login, register va refresh javobini saqlaydi */
  save(tokens: TokenResponse): void {
    accessToken = tokens.access_token
    storage.set(REFRESH_KEY, tokens.refresh_token)
  },
  clear(): void {
    accessToken = null
    storage.remove(REFRESH_KEY)
  },
  hasAccessToken(): boolean {
    return accessToken !== null
  },
  hasRefreshToken(): boolean {
    return storage.get(REFRESH_KEY) !== null
  },
  /** Refresh token ham yaroqsiz bo'lganda (qayta login kerak) chaqiriladi. Qaytgan funksiya obunani bekor qiladi. */
  onExpired(listener: () => void): () => void {
    expiredListeners.add(listener)
    return () => {
      expiredListeners.delete(listener)
    }
  },
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** false — token qo'shilmaydi va 401'da refresh qilinmaydi (login, register) */
  auth?: boolean
  signal?: AbortSignal
}

/**
 * Backend'ga so'rov. Access token o'zi qo'shiladi; 401 kelsa token yangilanib, so'rov bir marta
 * takrorlanadi. Xato javob — ApiError.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const auth = options.auth ?? true
  const sentToken = auth ? accessToken : null
  let res = await send(path, options, sentToken)

  if (res.status === 401 && auth) {
    if (accessToken && accessToken !== sentToken) {
      // parallel so'rov bu orada tokenni yangilab bo'lgan
      res = await send(path, options, accessToken)
    } else if (session.hasRefreshToken() && (await refreshSession())) {
      res = await send(path, options, accessToken)
    }
  }
  return parse<T>(res)
}

type ShortOptions = Omit<RequestOptions, 'method' | 'body'>

export const api = {
  get: <T>(path: string, options?: ShortOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ShortOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
}

/**
 * Refresh token bilan yangi tokenlar juftligini oladi. Bir vaqtda faqat bitta so'rov ketadi —
 * parallel chaqiruvlar o'sha natijani kutadi, chunki refresh token bir martalik.
 * null — refresh token yo'q yoki yaroqsiz (sessiya tugadi, qayta login kerak).
 */
export function refreshSession(): Promise<TokenResponse | null> {
  refreshing ??= doRefresh().finally(() => {
    refreshing = null
  })
  return refreshing
}

async function doRefresh(): Promise<TokenResponse | null> {
  let token = storage.get(REFRESH_KEY)
  if (!token) return null

  // Boshqa tab xuddi shu token bilan bizdan oldin yangilagan bo'lsa, server 401 qaytaradi,
  // lekin localStorage'da allaqachon yangisi turadi — u bilan yana bir marta urinamiz.
  for (let attempt = 0; token && attempt < 2; attempt++) {
    const res = await send('/api/auth/refresh', { method: 'POST', body: { refresh_token: token } }, null)
    if (res.ok) {
      const tokens = (await res.json()) as TokenResponse
      session.save(tokens)
      return tokens
    }
    if (res.status !== 401 && res.status !== 403) {
      // server xatosi — sessiyani o'chirmaymiz, keyinroq yana urinsa bo'ladi
      return parse<never>(res)
    }
    const latest = storage.get(REFRESH_KEY)
    token = latest !== token ? latest : null
  }

  session.clear()
  expiredListeners.forEach((listener) => listener())
  return null
}

async function send(path: string, options: RequestOptions, token: string | null): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    return await fetch(BASE_URL + path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiError(0, { code: 'network', message: 'Network error' })
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const data: unknown = await res.json().catch(() => null)
  if (res.ok) return data as T
  const body = (data as ModelsErrorResponse | null)?.error
  throw new ApiError(res.status, body ?? { code: 'unknown', message: res.statusText })
}
