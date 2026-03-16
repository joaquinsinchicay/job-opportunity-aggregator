import { getSupabaseClientConfig } from '@/lib/supabase/client'
import { clearSession, getAccessToken, saveSession, type SupabaseSession } from '@/lib/supabase/session-storage'

interface SupabaseTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
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

export async function signUpWithPassword(email: string, password: string): Promise<{ hasSession: boolean }> {
  const authUrl = getAuthUrl()
  const config = getSupabaseClientConfig()

  const response = await fetch(`${authUrl}/signup`, {
    method: 'POST',
    headers: {
      apikey: config!.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as SupabaseAuthErrorResponse | null
    const message = payload?.msg ?? payload?.error_description ?? payload?.message ?? 'Sign up failed'
    throw new Error(message)
  }

  const payload = (await response.json()) as SupabaseSignUpResponse
  if (payload.access_token && payload.refresh_token && payload.expires_in) {
    saveSession(mapTokenResponse(payload as SupabaseTokenResponse))
    return { hasSession: true }
  }

  return { hasSession: false }
}

export async function signOut(): Promise<void> {
  const config = getSupabaseClientConfig()
  const accessToken = getAccessToken()

  if (config && accessToken) {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  clearSession()
}
