'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { clearSession } from '@/lib/supabase/session-storage'
import { consumePasswordRecoverySessionFromUrl, updatePassword } from '@/lib/supabase/auth'

const INVALID_LINK_MESSAGE = 'Reset link is invalid or has expired'
const SUCCESS_MESSAGE = 'Password updated successfully'

type FormValues = {
  newPassword: string
  confirmPassword: string
}

type FormErrors = {
  newPassword?: string
  confirmPassword?: string
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (values.newPassword.length < 6) {
    errors.newPassword = 'Password must be at least 6 characters'
  }

  if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>({ newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecoveryLinkValid, setIsRecoveryLinkValid] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const hasRecoverySession = consumePasswordRecoverySessionFromUrl()
      setIsRecoveryLinkValid(hasRecoverySession)

      if (!hasRecoverySession) {
        clearSession()
        setFeedback(INVALID_LINK_MESSAGE)
      }
    } catch {
      clearSession()
      setIsRecoveryLinkValid(false)
      setFeedback(INVALID_LINK_MESSAGE)
    }
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    if (!isRecoveryLinkValid) {
      setFeedback(INVALID_LINK_MESSAGE)
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(values.newPassword)
      setFeedback(SUCCESS_MESSAGE)
      clearSession()
      window.setTimeout(() => {
        router.replace('/login')
      }, 1200)
    } catch {
      setFeedback(INVALID_LINK_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                value={values.newPassword}
                onChange={(event) => setValues((prev) => ({ ...prev, newPassword: event.target.value }))}
                aria-invalid={Boolean(errors.newPassword)}
              />
              {errors.newPassword ? <p className="text-sm text-red-600">{errors.newPassword}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={values.confirmPassword}
                onChange={(event) => setValues((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword ? <p className="text-sm text-red-600">{errors.confirmPassword}</p> : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || isRecoveryLinkValid === null}>
              {isSubmitting ? 'Resetting password...' : 'Reset password'}
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
