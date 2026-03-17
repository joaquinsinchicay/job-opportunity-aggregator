import { expect, test } from '@playwright/test'
import { hasPasswordAuthEnv, seedAuthenticatedSession } from './helpers/auth'

test('route protection redirects unauthenticated users to /login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login$/)
})

test('email/password login redirects to dashboard', async ({ page }) => {
  test.skip(!hasPasswordAuthEnv(), 'Missing Supabase and smoke credentials env vars for password login.')

  await page.goto('/login')
  await page.getByLabel('Email address').fill(process.env.SMOKE_TEST_EMAIL!)
  await page.getByLabel('Password').fill(process.env.SMOKE_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

test('google auth entrypoint is visible', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
})

test('logout invalidates protected route access', async ({ page }) => {
  await seedAuthenticatedSession(page)

  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page).toHaveURL(/\/login$/)

  await page.goto('/opportunities')
  await expect(page).toHaveURL(/\/login$/)
})
