import { getSupabaseClientConfig } from '@/lib/supabase/client'
import { clearSession, getAccessToken, saveSession, type SupabaseSession } from '@/lib/supabase/session-storage'

interface SupabaseTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

interface SupabaseOAuthErrorResponse {
  error?: string
  error_description?: string
}

interface SupabaseAuthErrorResponse {
  msg?: string
  error_description?: string
  message?: string
}

interface SupabaseSignUpResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  user?: {
    identities?: Array<unknown>
  }
}

interface SupabaseRecoverResponse {
  msg?: string
}

interface SupabaseRecoveryErrorResponse {
  error_description?: string
}

function getAuthUrl() {
  const config = getSupabaseClientConfig()
  if (!config) {
    throw new Error('Supabase configuration is missing')
  }
  return `${config.url}/auth/v1`
}

function mapTokenResponse(payload: SupabaseTokenResponse): SupabaseSession {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  }
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
  const authUrl = getAuthUrl()
  const config = getSupabaseClientConfig()

  const response = await fetch(`${authUrl}/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: config!.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase auth error (${response.status}): ${body}`)
  }

  const payload = (await response.json()) as SupabaseTokenResponse
  const session = mapTokenResponse(payload)
  saveSession(session)
  return session
}

export async function signUpWithPassword(
  fullName: string,
  email: string,
  password: string,
): Promise<{ hasSession: boolean }> {
  const authUrl = getAuthUrl()
  const config = getSupabaseClientConfig()

  const response = await fetch(`${authUrl}/signup`, {
    method: 'POST',
    headers: {
      apikey: config!.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: {
        full_name: fullName,
      },
    }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as SupabaseAuthErrorResponse | null
    const message = payload?.msg ?? payload?.error_description ?? payload?.message ?? 'Sign up failed'
    throw new Error(message)
  }

  const payload = (await response.json()) as SupabaseSignUpResponse

  if (Array.isArray(payload.user?.identities) && payload.user.identities.length === 0) {
    throw new Error('Email already registered')
  }

  if (payload.access_token && payload.refresh_token && payload.expires_in) {
    saveSession(mapTokenResponse(payload as SupabaseTokenResponse))
    return { hasSession: true }
  }

  try {
    await signInWithPassword(email, password)
    return { hasSession: true }
  } catch {
    throw new Error('Sign up failed. Please try again.')
  }
}

export async function signOut(): Promise<void> {
  const config = getSupabaseClientConfig()
  const accessToken = getAccessToken()

  try {
    if (config && accessToken) {
      await fetch(`${config.url}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
      })
    }
  } finally {
    clearSession()
  }
}

export async function requestPasswordReset(email: string, redirectTo?: string): Promise<{ message: string }> {
  const authUrl = getAuthUrl()
  const config = getSupabaseClientConfig()

  const response = await fetch(`${authUrl}/recover`, {
    method: 'POST',
    headers: {
      apikey: config!.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      ...(redirectTo ? { redirect_to: redirectTo } : {}),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase recover error (${response.status}): ${body}`)
  }

  const payload = (await response.json().catch(() => null)) as SupabaseRecoverResponse | null
  return {
    message: payload?.msg ?? 'Recovery email requested',
  }
}

export function consumePasswordRecoverySessionFromUrl(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const hashParams = new URLSearchParams(hash)
  const searchParams = new URLSearchParams(window.location.search)

  const recoveryError =
    ((Object.fromEntries(hashParams.entries()) as SupabaseRecoveryErrorResponse).error_description ??
      (Object.fromEntries(searchParams.entries()) as SupabaseRecoveryErrorResponse).error_description)

  if (recoveryError) {
    throw new Error(recoveryError)
  }

  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')
  const expiresIn = Number(hashParams.get('expires_in'))
  const recoveryType = hashParams.get('type')

  if (!accessToken || !refreshToken || !Number.isFinite(expiresIn) || recoveryType !== 'recovery') {
    return false
  }

  saveSession({
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  })

  window.history.replaceState({}, document.title, window.location.pathname)
  return true
}

export async function updatePassword(password: string): Promise<void> {
  const authUrl = getAuthUrl()
  const config = getSupabaseClientConfig()
  const accessToken = getAccessToken()

  if (!config || !accessToken) {
    throw new Error('Recovery session is invalid')
  }

  const response = await fetch(`${authUrl}/user`, {
    method: 'PUT',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase update user error (${response.status}): ${body}`)
  }
}

export function signInWithGoogleOAuth(redirectPath: string): void {
  const config = getSupabaseClientConfig()
  if (!config) {
    throw new Error('Supabase configuration is missing')
  }

  if (typeof window === 'undefined') {
    throw new Error('OAuth sign in must run in the browser')
  }

  const redirectTo = new URL(redirectPath, window.location.origin)
  const authUrl = new URL(`${config.url}/auth/v1/authorize`)

  authUrl.searchParams.set('provider', 'google')
  authUrl.searchParams.set('redirect_to', redirectTo.toString())

  window.location.assign(authUrl.toString())
}

export function consumeOAuthSessionFromUrlHash(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  if (!hash) {
    return false
  }

  const params = new URLSearchParams(hash)
  const oauthError = (Object.fromEntries(params.entries()) as SupabaseOAuthErrorResponse).error_description
  if (oauthError) {
    throw new Error(oauthError)
  }

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const expiresIn = Number(params.get('expires_in'))

  if (!accessToken || !refreshToken || !Number.isFinite(expiresIn)) {
    return false
  }

  saveSession({
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  })

  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
  return true
}
