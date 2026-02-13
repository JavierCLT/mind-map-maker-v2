"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase-client"

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const supabase = getSupabaseClient()
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (!mounted) return
          setSession(data.session ?? null)
          setUser(data.session?.user ?? null)
          setLoading(false)
        })
        .catch((err) => {
          if (!mounted) return
          setError(err?.message || "Failed to load auth session")
          setLoading(false)
        })

      const listener = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!mounted) return
        setSession(nextSession)
        setUser(nextSession?.user ?? null)
      })
      subscription = listener.data.subscription
    } catch (err: any) {
      if (!mounted) return
      setError(err?.message || "Supabase not configured")
      setLoading(false)
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      error,
      signOut: async () => {
        const supabase = getSupabaseClient()
        await supabase.auth.signOut()
      },
    }),
    [user, session, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
