import { useQuery } from '@tanstack/react-query'
import { use } from 'react'
import { session } from '@/shared/api'
import { fetchMe, meQueryKey, type Me } from './api'
import { SessionBootedContext } from './context'

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'guest'; user: null }
  | { status: 'authenticated'; user: Me }

export function useAuth(): AuthState {
  const booted = use(SessionBootedContext)
  const { data } = useQuery<Me | null>({
    queryKey: meQueryKey,
    queryFn: ({ signal }) => fetchMe(signal),
    enabled: booted && session.hasAccessToken(),
    staleTime: 5 * 60_000,
  })

  if (!booted) return { status: 'loading', user: null }
  return data ? { status: 'authenticated', user: data } : { status: 'guest', user: null }
}
