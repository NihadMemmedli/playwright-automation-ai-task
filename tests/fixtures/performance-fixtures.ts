import { test as base, type Page } from '@playwright/test';

// playwright-lighthouse is loaded lazily inside the audit fixture so that
// Playwright's spec discovery (which loads every fixture file in every
// project) does not require the dep to be installed when only running the
// non-@perf slices. The package has no bundled types either; we treat the
// dynamic import's value as `any` and call its `playAudit` named export.

export interface LighthouseThresholds {
  performance?: number;
  accessibility?: number;
  'best-practices'?: number;
  seo?: number;
  pwa?: number;
}

export interface AuditOptions {
  page: Page;
  /** Categories + minimum scores (0–100). Below threshold → test fails. */
  thresholds?: LighthouseThresholds;
  /** Override the default filename for the JSON+HTML report artifacts. */
  reportName?: string;
}

const PORT = parseInt(process.env.LIGHTHOUSE_PORT ?? '9222', 10);

const envNum = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Lighthouse defaults are deliberately lenient — the live demo site (a free
// Netlify host) jitters under shared CI runners. Override per-page in the spec
// when you have a stable baseline. All overridable via env for CI tuning.
//
// Note: the `pwa` category was removed from Lighthouse 12 — passing it as a
// threshold throws "unrecognized category in 'onlyCategories'". Opt in via
// LH_THRESHOLD_PWA env only if you've pinned an older Lighthouse version.
export const DEFAULT_THRESHOLDS: LighthouseThresholds = {
  performance: envNum('LH_THRESHOLD_PERF', 50),
  accessibility: envNum('LH_THRESHOLD_A11Y', 80),
  'best-practices': envNum('LH_THRESHOLD_BP', 70),
  seo: envNum('LH_THRESHOLD_SEO', 70),
  ...(process.env.LH_THRESHOLD_PWA ? { pwa: envNum('LH_THRESHOLD_PWA', 0) } : {}),
};

interface PerfFixtures {
  audit: (opts: AuditOptions) => Promise<void>;
}

export const test = base.extend<PerfFixtures>({
  audit: async ({}, use) => {
    const runner = async ({ page, thresholds, reportName }: AuditOptions): Promise<void> => {
      // Resolved at runtime only — typed as `unknown` because the package
      // ships no declarations and is intentionally absent from compile-time
      // resolution so that non-@perf runs don't require it to be installed.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import(/* @vite-ignore */ 'playwright-lighthouse' as string);
      await mod.playAudit({
        page,
        port: PORT,
        thresholds: { ...DEFAULT_THRESHOLDS, ...thresholds },
        reports: {
          formats: { html: true, json: true },
          name: reportName ?? `lighthouse-${Date.now()}`,
          directory: 'reports/lighthouse',
        },
      });
    };
    await use(runner);
  },
});

export { expect } from '@playwright/test';
