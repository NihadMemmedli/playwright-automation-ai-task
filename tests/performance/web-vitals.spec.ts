import { test, expect } from '../fixtures/test-fixtures';

interface WebVitals {
  lcp: number | null;
  cls: number;
  fcp: number | null;
  domContentLoaded: number;
  loadEvent: number;
}

/**
 * Hand-rolled Core Web Vitals capture via PerformanceObserver — no extra dep.
 * Less rigorous than Lighthouse but cheap enough to run on every PR.
 *
 * Thresholds are deliberately generous: this is a free-tier static demo host,
 * not a production app. The point is to surface large regressions, not to
 * enforce production-grade SLAs. Tighten via env vars once a baseline exists.
 */
const collectVitals = async (page: import('@playwright/test').Page): Promise<WebVitals> => {
  return page.evaluate(
    () => new Promise<WebVitals>((resolve) => {
      const result: WebVitals = {
        lcp: null,
        cls: 0,
        fcp: null,
        domContentLoaded: 0,
        loadEvent: 0,
      };

      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) result.lcp = last.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch { /* not all browsers support every entry type */ }

      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // @ts-expect-error layout-shift entries have a `value` field
            if (!entry.hadRecentInput) result.cls += entry.value as number;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch { /* swallow */ }

      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') result.fcp = entry.startTime;
          }
        }).observe({ type: 'paint', buffered: true });
      } catch { /* swallow */ }

      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        result.domContentLoaded = nav.domContentLoadedEventEnd - nav.startTime;
        result.loadEvent = nav.loadEventEnd - nav.startTime;
      }

      // Give observers ~1s to capture late-firing entries (LCP can fire well
      // after the main thread settles), then resolve.
      setTimeout(() => resolve(result), 1_500);
    }),
  );
};

const envNum = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const BUDGETS = {
  // Generous defaults; tighten via env once you have a stable baseline.
  lcp: envNum('WV_LCP_MS', 8_000),
  cls: parseFloat(process.env.WV_CLS ?? '0.5'),
  domContentLoaded: envNum('WV_DCL_MS', 6_000),
};

test.describe('Performance — Core Web Vitals', () => {
  test('login page emits acceptable LCP / CLS / DCL', {
    tag: ['@perf'],
  }, async ({ page, loginPage }) => {
    await loginPage.goto();
    await page.waitForLoadState('load');
    // Settle window for late-firing PerformanceObserver entries (LCP can fire
    // well after load). Lint exception is justified: this is intentionally
    // measuring the post-load period itself.
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    const vitals = await collectVitals(page);

    test.info().attachments.push({
      name: 'web-vitals-login',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(vitals, null, 2)),
    });

    // LCP can legitimately be null on tiny pages where no contentful paint
    // ever fires; treat null as 0 so the budget check still runs.
    expect(vitals.lcp ?? 0, 'LCP').toBeLessThan(BUDGETS.lcp);
    expect(vitals.cls, 'CLS').toBeLessThan(BUDGETS.cls);
    expect(vitals.domContentLoaded, 'DCL').toBeLessThan(BUDGETS.domContentLoaded);
  });

  test('file-upload page emits acceptable LCP / CLS / DCL', {
    tag: ['@perf'],
  }, async ({ page, fileUploadPage }) => {
    await fileUploadPage.goto();
    await page.waitForLoadState('load');
    // Settle window for late-firing PerformanceObserver entries (LCP can fire
    // well after load). Lint exception is justified: this is intentionally
    // measuring the post-load period itself.
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    const vitals = await collectVitals(page);

    test.info().attachments.push({
      name: 'web-vitals-file-upload',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(vitals, null, 2)),
    });

    // LCP can legitimately be null on tiny pages where no contentful paint
    // ever fires; treat null as 0 so the budget check still runs.
    expect(vitals.lcp ?? 0, 'LCP').toBeLessThan(BUDGETS.lcp);
    expect(vitals.cls, 'CLS').toBeLessThan(BUDGETS.cls);
    expect(vitals.domContentLoaded, 'DCL').toBeLessThan(BUDGETS.domContentLoaded);
  });
});
