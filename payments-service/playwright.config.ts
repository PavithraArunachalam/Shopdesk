import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:4000' },
  webServer: {
    command: 'node src/server.js',
    url: 'http://localhost:4000/health',
    env: { LLM_MODE: 'mock', PORT: '4000' }, // tests never call the real LLM
    reuseExistingServer: !process.env.CI,
  },
});
