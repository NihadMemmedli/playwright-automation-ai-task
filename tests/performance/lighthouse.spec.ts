import { test, expect } from '../fixtures/performance-fixtures';
import { LoginPage } from '@pages/index';

/**
 * Lighthouse audits via playwright-lighthouse against the running Chromium
 * instance. Only runs in the `performance` Playwright project (Chromium with
 * --remote-debugging-port). Excluded from the default desktop projects via
 * `grepInvert: /@perf/` so PRs don't pay the ~30s/page Lighthouse cost.
 *
 * Thresholds default to deliberately lenient values (see DEFAULT_THRESHOLDS in
 * performance-fixtures.ts) and can be tightened per-page or via the LH_*
 * environment variables once a stable baseline is established.
 */
test.describe('Performance — Lighthouse audits', () => {
  test('login page meets Lighthouse budgets', {
    tag: ['@perf'],
  }, async ({ page, audit }) => {
    await page.goto('/auth_ecommerce', { waitUntil: 'load' });
    await audit({
      page,
      reportName: 'login-page',
    });
  });

  test('shop page (post-login) meets Lighthouse budgets', {
    tag: ['@perf'],
  }, async ({ page, audit }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    // Lighthouse needs the page to be quiet before audit; wait for the load
    // event then a short settle window. (networkidle would be ideal but the
    // project's lint config forbids it for E2E reasons that don't apply here.)
    await page.waitForLoadState('load');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    await audit({
      page,
      reportName: 'shop-page',
    });
  });

  test('checkout page meets Lighthouse budgets', {
    tag: ['@perf'],
  }, async ({ page, audit }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
    await page.getByRole('button', { name: 'PROCEED TO CHECKOUT' }).click();
    await expect(page.getByRole('heading', { name: 'Shipping Details' })).toBeVisible();
    await audit({
      page,
      reportName: 'checkout-page',
    });
  });

  test('file upload page meets Lighthouse budgets', {
    tag: ['@perf'],
  }, async ({ page, audit }) => {
    await page.goto('/file-upload', { waitUntil: 'load' });
    // The file-upload page has known a11y gaps (no labels on the file input,
    // no live region on the response box) — see tests/e2e/accessibility.spec.ts
    // which already gates this page with axe-core. Lighthouse's heuristic a11y
    // score reflects the same issues; loosen its threshold here so the perf
    // gate doesn't double-report what axe-core already covers.
    await audit({
      page,
      thresholds: { accessibility: 70 },
      reportName: 'file-upload-page',
    });
  });
});
