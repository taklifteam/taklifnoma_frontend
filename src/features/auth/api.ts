import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  api,
  session,
  type ModelsLoginRequest,
  type ModelsMeResponse,
  type ModelsRegisterRequest,
  type TokenResponse,
} from '@/shared/api'

export type Me = ModelsMeResponse

export const meQueryKey = ['auth', 'me'] as const

export function fetchMe(signal?: AbortSignal): Promise<Me> {
  return api.get<Me>('/api/auth/me', { signal })
}

/**
 * Sessiyani yopadi. "me" null qilinadi — ochiq turgan useAuth'lar darhol "guest" bo'ladi
 * (keshni clear/removeQueries bilan o'chirish ularga xabar bermaydi). Qolgan keshlangan
 * ma'lumot o'chiriladi: umumiy qurilmada keyingi odam oldingisining ma'lumotini ko'rmasin.
 */
export function endSession(queryClient: QueryClient): void {
  session.clear()
  queryClient.setQueryData<Me | null>(meQueryKey, null)
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== meQueryKey[0] })
}

/** Tokenlarni saqlaydi va foydalanuvchini keshga yozadi — guard'lar shu zahoti ko'radi. */
function useStartSession() {
  const queryClient = useQueryClient()
  return (tokens: TokenResponse) => {
    session.save(tokens)
    queryClient.setQueryData(meQueryKey, tokens.user)
  }
}

export function useLogin() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: (input: ModelsLoginRequest) =>
      api.post<TokenResponse>('/api/auth/login', input, { auth: false }),
    onSuccess: (tokens) => startSession(tokens),
  })
}

export function useRegister() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: (input: ModelsRegisterRequest) =>
      api.post<TokenResponse>('/api/auth/register', input, { auth: false }),
    onSuccess: (tokens) => startSession(tokens),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    // server javob bermasa ham foydalanuvchi chiqadi: tokenlar baribir o'chiriladi
    mutationFn: () => api.post<void>('/api/auth/logout').catch(() => undefined),
    onSettled: () => endSession(queryClient),
  })
}
