import { defineConfig, devices } from '@playwright/test'

const databaseUrl = process.env.E2E_DATABASE_URL
const PORT = 3100

// The tests create and delete data, so they never fall back to .env
if (!databaseUrl) {
  throw new Error('Set E2E_DATABASE_URL to a throwaway Postgres database')
}
if (databaseUrl.includes('neon.tech')) {
  throw new Error('E2E_DATABASE_URL looks like a real Neon database')
}

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: databaseUrl,
      JWT_SECRET: 'e2e-only-secret-that-is-not-used-anywhere-else',
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
})
