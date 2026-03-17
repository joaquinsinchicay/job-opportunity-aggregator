'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { requestPasswordReset } from '@/lib/supabase/auth'

const SUCCESS_MESSAGE = 'If the email exists, a reset link has been sent.'
const SERVICE_ERROR_MESSAGE = 'Something went wrong. Please try again'

type FormErrors = {
  email?: string
}

function validateEmail(email: string): FormErrors {
  const trimmedEmail = email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmedEmail)) {
    return { email: 'Invalid email address' }
  }

  return {}
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFeedback(null)

    const validationErrors = validateEmail(email)
    if (validationErrors.email) {
      setError(validationErrors.email)
      return
    }

    setIsSubmitting(true)

    try {
      const redirectTo = `${window.location.origin}/reset-password`
      await requestPasswordReset(email.trim(), redirectTo)
      setFeedback(SUCCESS_MESSAGE)
    } catch {
      setFeedback(SERVICE_ERROR_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error)}
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <Link href="/login" className="underline underline-offset-4">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
