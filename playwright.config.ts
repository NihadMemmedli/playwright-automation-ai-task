import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

loadEnv();

const BASE_URL = process.env.BASE_URL ?? 'https://qa-practice.netlify.app';
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: true,
      environmentInfo: {
        framework: 'Playwright',
        node: process.version,
        os: process.platform,
        baseURL: BASE_URL,
        aiHealing: process.env.AI_HEALING_ENABLED === 'true' ? 'enabled' : 'disabled',
      },
    }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // 15s on actions: the practice site (qa-practice.netlify.app) is a free demo host
    // and slows under parallel-worker load. WebKit's actionability poll requires two
    // consecutive frames with an identical bounding box, and at 10s some Bootstrap
    // buttons can't settle that long when the page is co-loading from 5 workers.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    testIdAttribute: 'data-testid',
  },
  // Default projects skip @perf — Lighthouse is slow and noisy on shared runners; run
  // it explicitly via `npm run test:perf` (or the dedicated CI job).
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@perf/ },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] }, grepInvert: /@perf/ },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] }, grepInvert: /@perf/ },
    // Mobile projects only run @smoke-tagged tests by default to keep the matrix lean.
    // Use `npm run test:mobile` (or override --grep) to run more on mobile viewports.
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] }, grep: /@smoke/ },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] }, grep: /@smoke/ },
    // Performance project: Chromium-only, longer timeout, opted in via @perf grep.
    // Launches Chromium with a remote debugging port so playwright-lighthouse can
    // attach. Parallelism must be capped to 1 worker (npm run test:perf does this)
    // since the debug port can only be bound once per host.
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [`--remote-debugging-port=${process.env.LIGHTHOUSE_PORT ?? '9222'}`],
        },
      },
      grep: /@perf/,
      timeout: 180_000,
      fullyParallel: false,
    },
  ],
  outputDir: 'test-results',
});
