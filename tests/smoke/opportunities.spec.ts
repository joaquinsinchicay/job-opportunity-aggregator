import { expect, test } from '@playwright/test'
import { seedAuthenticatedSession } from './helpers/auth'

test.beforeEach(async ({ page }) => {
  await seedAuthenticatedSession(page)
})

test('dashboard renders for authenticated users', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Opportunity' }).first()).toBeVisible()
})

test('opportunity CRUD + status pipeline persistence', async ({ page }) => {
  const suffix = Date.now()
  const title = `Smoke Opportunity ${suffix}`
  const editedTitle = `Smoke Opportunity Edited ${suffix}`

  await page.goto('/opportunities/new')

  await page.getByLabel('Job Title').fill(title)
  await page.getByLabel('Company').fill('Smoke QA Inc')
  await page.getByLabel('Location').fill('Remote')
  await page.getByLabel('Source URL').fill('https://example.com/job')

  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Remote' }).click()

  await page.getByRole('button', { name: 'Save Opportunity' }).click()

  await expect(page).toHaveURL(/\/opportunities$/)
  await expect(page.getByText(title)).toBeVisible()

  await page.getByRole('link', { name: title }).first().click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.getByRole('link', { name: 'Edit Opportunity' }).click()
  await expect(page).toHaveURL(/\/edit$/)

  await page.getByLabel('Job Title').fill(editedTitle)
  await page.getByRole('button', { name: 'Save Changes' }).click()

  await expect(page.getByRole('heading', { name: editedTitle })).toBeVisible()

  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Interview' }).click()
  await expect(page.getByText('Interview').first()).toBeVisible()

  await page.goto('/pipeline')
  const interviewColumn = page
    .locator('div')
    .filter({ has: page.getByText('Interview') })
    .filter({ has: page.getByRole('link', { name: editedTitle }) })
    .first()

  await expect(interviewColumn).toBeVisible()

  page.on('dialog', (dialog) => dialog.accept())
  await page.goto('/opportunities')
  await page.getByRole('link', { name: editedTitle }).first().click()
  await page.getByRole('button', { name: 'Delete Opportunity' }).click()

  await expect(page).toHaveURL(/\/opportunities$/)
  await expect(page.getByRole('link', { name: editedTitle })).toHaveCount(0)
})
