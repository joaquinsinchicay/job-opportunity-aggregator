'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { consumeOAuthSessionFromUrlHash, signInWithGoogleOAuth } from '@/lib/supabase/auth'
import { getAccessToken } from '@/lib/supabase/session-storage'

const GOOGLE_AUTH_ERROR_MESSAGE = 'Google sign in is currently unavailable. Please try again in a moment.'

export default function LoginPage() {
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (consumeOAuthSessionFromUrlHash()) {
        router.replace('/dashboard')
        return
      }
    } catch {
      setError(GOOGLE_AUTH_ERROR_MESSAGE)
    }

    if (getAccessToken()) {
      router.replace('/dashboard')
    }
  }, [router])

  function onGoogleSignIn() {
    setError(null)
    setIsGoogleLoading(true)

    try {
      signInWithGoogleOAuth('/login')
    } catch {
      setError(GOOGLE_AUTH_ERROR_MESSAGE)
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Don&apos;t have an account?&nbsp;
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
