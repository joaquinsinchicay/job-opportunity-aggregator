import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.SMOKE_TEST_PORT ?? 3000)
const baseURL = process.env.SMOKE_TEST_BASE_URL ?? `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/smoke',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `${baseURL}/login`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      NEXT_PUBLIC_OPPORTUNITIES_REPOSITORY_KIND:
        process.env.NEXT_PUBLIC_OPPORTUNITIES_REPOSITORY_KIND ?? 'memory',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
