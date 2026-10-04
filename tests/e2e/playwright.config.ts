import { defineConfig, devices } from '@playwright/test';

/**
 * Two projects:
 *  - `api`: black-box HTTP tests against the Fastify server (no browser).
 *  - `web`: browser tests against the React app (which talks to the API through /api).
 *
 * Targets are configurable so the same suite runs against dev, staging or production:
 *   API_URL=http://localhost:3100 WEB_URL=http://localhost:8100 E2E_NO_SERVER=1 pnpm test:smoke
 */
const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';
const isCI = Boolean(process.env.CI);
const startServers = !process.env.E2E_NO_SERVER;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: { baseURL: API_URL },
    },
    {
      name: 'web',
      testMatch: /.*\.web\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: WEB_URL },
    },
  ],
  webServer: startServers
    ? [
        {
          command: 'pnpm --filter api dev',
          url: `${API_URL}/health`,
          cwd: '../..',
          reuseExistingServer: !isCI,
          timeout: 120_000,
          stdout: 'pipe',
        },
        {
          command: 'pnpm --filter web dev',
          url: WEB_URL,
          cwd: '../..',
          reuseExistingServer: !isCI,
          timeout: 120_000,
        },
      ]
    : undefined,
});
