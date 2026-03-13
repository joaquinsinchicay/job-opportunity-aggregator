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


function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  const token = window.localStorage.getItem('supabase.access_token')
  return token && token.trim() ? token : null
}

export async function supabaseRestFetch<T>(
  config: SupabaseClientConfig,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${getAuthToken() ?? config.anonKey}`,
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
