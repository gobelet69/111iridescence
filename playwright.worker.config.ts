import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/worker',
  webServer: {
    command: 'wrangler dev --ip 127.0.0.1 --port 8787 --local',
    port: 8787,
    reuseExistingServer: false,
  },
  use: { baseURL: 'http://127.0.0.1:8787' },
  projects: [{ name: 'worker-routing', use: { browserName: 'chromium' } }],
});
