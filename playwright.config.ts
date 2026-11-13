import { defineConfig, devices } from '@playwright/test'

// Tests run against a production build served from the same sub-path GitHub Pages uses,
// so a broken asset URL fails here before it fails live.
const BASE_PATH = '/a320-maintenance-sim/'
const PORT = 4173

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE_PATH}`,
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          // CI runners have no GPU; allow the software WebGL renderer.
          args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
        },
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE_PATH}`,
    env: { BASE_PATH },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
