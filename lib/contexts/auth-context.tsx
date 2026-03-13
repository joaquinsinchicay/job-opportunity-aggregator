'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearStoredSession,
  getSupabaseClientConfig,
  readStoredSession,
  signInWithPassword,
  storeSession,
  type SupabaseSession,
} from '@/lib/supabase/client'

interface AuthContextValue {
  session: SupabaseSession | null
  isReady: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<SupabaseSession | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const stored = readStoredSession()
    if (stored && stored.expiresAt > Date.now()) {
      setSession(stored)
    } else {
      clearStoredSession()
    }
    setIsReady(true)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const config = getSupabaseClientConfig()
    if (!config) {
      throw new Error('Supabase configuration is missing')
    }

    const nextSession = await signInWithPassword(config, email, password)
    storeSession(nextSession)
    setSession(nextSession)
  }, [])

  const signOut = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isReady,
      signIn,
      signOut,
    }),
    [session, isReady, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
