import type { Page } from '@playwright/test'

const ACCESS_TOKEN_KEY = 'supabase.access_token'
const REFRESH_TOKEN_KEY = 'supabase.refresh_token'
const EXPIRES_AT_KEY = 'supabase.expires_at'

export async function seedAuthenticatedSession(page: Page) {
  const expiresAt = String(Date.now() + 60 * 60 * 1000)

  await page.addInitScript(
    ({ accessTokenKey, refreshTokenKey, expiresAtKey, expiresAt }) => {
      window.localStorage.setItem(accessTokenKey, 'smoke-test-access-token')
      window.localStorage.setItem(refreshTokenKey, 'smoke-test-refresh-token')
      window.localStorage.setItem(expiresAtKey, expiresAt)
    },
    {
      accessTokenKey: ACCESS_TOKEN_KEY,
      refreshTokenKey: REFRESH_TOKEN_KEY,
      expiresAtKey: EXPIRES_AT_KEY,
      expiresAt,
    }
  )
}

export function hasPasswordAuthEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SMOKE_TEST_EMAIL &&
      process.env.SMOKE_TEST_PASSWORD
  )
}
