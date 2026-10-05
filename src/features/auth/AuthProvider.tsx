import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { refreshSession, session } from '@/shared/api'
import { endSession, meQueryKey } from './api'
import { SessionBootedContext } from './context'

/**
 * Ilova ochilganda refresh token bo'lsa, sessiyani tiklaydi (yangi access token + foydalanuvchi).
 * Shu tugaguncha himoyalangan sahifalar kutib turadi.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    let active = true
    // refresh token ham yaroqsiz bo'lsa — sessiya yopiladi, guard /kirish'ga yuboradi
    const unsubscribe = session.onExpired(() => endSession(queryClient))

    refreshSession()
      .then((tokens) => {
        if (tokens) queryClient.setQueryData(meQueryKey, tokens.user)
      })
      .catch(() => {
        // tarmoq yoki server xatosi: kirmagan holatda ochamiz, refresh token saqlanib qoladi
      })
      .finally(() => {
        if (active) setBooted(true)
      })

    return () => {
      active = false
      unsubscribe()
    }
  }, [queryClient])

  return <SessionBootedContext value={booted}>{children}</SessionBootedContext>
}
