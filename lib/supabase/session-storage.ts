const ACCESS_TOKEN_KEY = 'supabase.access_token'
const REFRESH_TOKEN_KEY = 'supabase.refresh_token'
const EXPIRES_AT_KEY = 'supabase.expires_at'

export interface SupabaseSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function saveSession(session: SupabaseSession) {
  if (!canUseStorage()) return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  window.localStorage.setItem(EXPIRES_AT_KEY, String(session.expiresAt))
}

export function clearSession() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(EXPIRES_AT_KEY)
}

export function getSession(): SupabaseSession | null {
  if (!canUseStorage()) return null

  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)
  const expiresAtRaw = window.localStorage.getItem(EXPIRES_AT_KEY)

  if (!accessToken || !refreshToken || !expiresAtRaw) return null

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt)) {
    clearSession()
    return null
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
  }
}

export function getAccessToken(): string | null {
  const session = getSession()
  if (!session) return null

  if (Date.now() >= session.expiresAt) {
    clearSession()
    return null
  }

  return session.accessToken
}
