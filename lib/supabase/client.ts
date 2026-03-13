export interface SupabaseClientConfig {
  url: string
  anonKey: string
}

export interface SupabaseSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email?: string
  }
}

interface SupabaseTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: {
    id: string
    email?: string
  }
}

const SESSION_STORAGE_KEY = 'job-opportunity-aggregator:supabase-session'

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

export async function supabaseRestFetch<T>(
  config: SupabaseClientConfig,
  path: string,
  init: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken ?? config.anonKey}`,
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

function toSession(response: SupabaseTokenResponse): SupabaseSession {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: Date.now() + response.expires_in * 1000,
    user: {
      id: response.user.id,
      email: response.user.email,
    },
  }
}

export async function signInWithPassword(
  config: SupabaseClientConfig,
  email: string,
  password: string
): Promise<SupabaseSession> {
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase auth error (${response.status}): ${body}`)
  }

  const body = (await response.json()) as SupabaseTokenResponse
  return toSession(body)
}

export function readStoredSession(): SupabaseSession | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SupabaseSession
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function storeSession(session: SupabaseSession): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}
