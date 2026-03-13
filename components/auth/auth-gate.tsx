'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getAccessToken } from '@/lib/supabase/session-storage'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = getAccessToken()
    if (!token && pathname !== '/login') {
      router.replace('/login')
    }
  }, [pathname, router])

  return <>{children}</>
}
