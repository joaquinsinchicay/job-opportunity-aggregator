'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { consumeOAuthSessionFromUrlHash, signInWithGoogleOAuth, signInWithPassword } from '@/lib/supabase/auth'
import { getAccessToken } from '@/lib/supabase/session-storage'

const GOOGLE_AUTH_ERROR_MESSAGE = 'Something went wrong. Please try again'
const SERVICE_ERROR_MESSAGE = 'Something went wrong. Please try again'

type FormValues = {
  email: string
  password: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(values.email.trim())) {
    errors.email = 'Invalid email address'
  }

  if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}

function isInvalidCredentialsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return message.includes('invalid login credentials') || message.includes('invalid_credentials')
}

export default function LoginPage() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (consumeOAuthSessionFromUrlHash()) {
        router.replace('/dashboard')
        return
      }
    } catch {
      setFeedback(GOOGLE_AUTH_ERROR_MESSAGE)
    }

    if (getAccessToken()) {
      router.replace('/dashboard')
    }
  }, [router])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await signInWithPassword(values.email.trim(), values.password)
      router.replace('/dashboard')
    } catch (error) {
      if (isInvalidCredentialsError(error)) {
        setFeedback('Invalid email or password')
      } else {
        setFeedback(SERVICE_ERROR_MESSAGE)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function onGoogleSignIn() {
    setFeedback(null)
    setIsGoogleLoading(true)

    try {
      signInWithGoogleOAuth('/login')
    } catch {
      setFeedback(GOOGLE_AUTH_ERROR_MESSAGE)
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
            {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

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
