'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, isReady } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isReady) return
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [isReady, session, router, pathname])

  if (!isReady || !session) {
    return null
  }

  return <>{children}</>
}
