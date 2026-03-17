'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { consumeOAuthSessionFromUrlHash, signUpWithPassword } from '@/lib/supabase/auth'
import { getAccessToken } from '@/lib/supabase/session-storage'

const SERVICE_ERROR_MESSAGE = 'Something went wrong. Please try again'

type FormValues = {
  fullName: string
  email: string
  password: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(values.email.trim())) {
    errors.email = 'Invalid email address'
  }

  if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}

export default function SignUpPage() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (consumeOAuthSessionFromUrlHash()) {
        router.replace('/dashboard')
        return
      }
    } catch {
      setFeedback(SERVICE_ERROR_MESSAGE)
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
      await signUpWithPassword(values.fullName.trim(), values.email.trim(), values.password)
      setFeedback('Account created successfully')
      router.replace('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.toLowerCase().includes('already') && message.toLowerCase().includes('register')) {
        setFeedback('Email already registered')
      } else {
        setFeedback(SERVICE_ERROR_MESSAGE)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}

            <div className="space-y-2">
              <label htmlFor="full-name" className="text-sm font-medium">
                Full name
              </label>
              <Input
                id="full-name"
                type="text"
                value={values.fullName}
                onChange={(event) => setValues((prev) => ({ ...prev, fullName: event.target.value }))}
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName ? <p className="text-sm text-red-600">{errors.fullName}</p> : null}
            </div>

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
              {isSubmitting ? 'Creating account...' : 'Create account'}
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
