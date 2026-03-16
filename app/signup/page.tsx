'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpWithPassword } from '@/lib/supabase/auth'
import { getAccessToken } from '@/lib/supabase/session-storage'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

function normalizeSignUpError(message: string) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('already') && lowerMessage.includes('registered')) {
    return 'This email is already registered. Try signing in instead.'
  }

  if (lowerMessage.includes('already') && lowerMessage.includes('exists')) {
    return 'This email is already registered. Try signing in instead.'
  }

  return message
}

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (getAccessToken()) {
      router.replace('/dashboard')
    }
  }, [router])

  const validationError = useMemo(() => {
    if (!email || !password) {
      return 'Email and password are required.'
    }

    if (!EMAIL_REGEX.test(email)) {
      return 'Enter a valid email address.'
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    }

    return null
  }, [email, password])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isLoading) return

    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await signUpWithPassword(email, password)

      setSuccess(
        result.hasSession
          ? 'Account created successfully. Redirecting to dashboard...'
          : 'Account created successfully. Check your email to confirm your account before signing in.'
      )

      if (result.hasSession) {
        router.replace('/dashboard')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(normalizeSignUpError(message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError(null)
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (error) setError(null)
                }}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-700">{success}</p> : null}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?&nbsp;
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
