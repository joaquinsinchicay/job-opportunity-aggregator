import { clearSession, getSession, saveSession } from '@/lib/supabase/session-storage'

export interface SupabaseClientConfig {
  url: string
  anonKey: string
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export function getSupabaseClientConfig(): SupabaseClientConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  return {
    url: trimTrailingSlash(url),
    anonKey,
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClientConfig() !== null
}


interface SupabaseRefreshTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

async function getAuthToken(config: SupabaseClientConfig): Promise<string | null> {
  const session = getSession()
  if (!session) {
    return null
  }

  if (Date.now() < session.expiresAt) {
    return session.accessToken
  }

  const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  })

  if (!response.ok) {
    clearSession()
    return null
  }

  const payload = (await response.json()) as SupabaseRefreshTokenResponse
  const refreshedSession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  }

  saveSession(refreshedSession)
  return refreshedSession.accessToken
}

export async function supabaseRestFetch<T>(
  config: SupabaseClientConfig,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const authToken = await getAuthToken(config)

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${authToken ?? config.anonKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase REST error (${response.status}): ${body}`)
  }

  const text = await response.text()
  if (!text) {
    return null as T
  }

  return JSON.parse(text) as T
}
