import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@fixtures/test-fixtures';

/**
 * Accessibility scans on the four key pages of the app under test.
 *
 * Strategy for a third-party demo site: we **don't hard-fail** on the existing
 * violations (qa-practice.netlify.app is a deliberately bad-practice playground —
 * failing builds on issues we can't fix would just train the team to ignore the
 * report). Instead we:
 *   1. Scan with WCAG 2.1 A + AA rule sets.
 *   2. Attach the full violation JSON to the test report.
 *   3. Annotate the test with the violation count grouped by impact, so it's
 *      surfaced in HTML + Allure dashboards.
 *   4. Compare against a per-page `BASELINE` — if a *new* critical violation
 *      appears (more than baseline), the test fails. This catches regressions
 *      while tolerating known issues.
 *
 * For a real product (one we own), set `BASELINE` to 0 and the suite becomes a
 * hard a11y gate.
 */

interface ViolationSummary {
  id: string;
  impact: string | null | undefined;
  description: string;
  helpUrl: string;
  nodes: number;
}

const summarise = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']): ViolationSummary[] =>
  violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    helpUrl: v.helpUrl,
    nodes: v.nodes.length,
  }));

const countByImpact = (violations: ViolationSummary[]): Record<string, number> =>
  violations.reduce<Record<string, number>>((acc, v) => {
    const key = v.impact ?? 'unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

/** Per-page baseline of `critical` impact violations on qa-practice.netlify.app.
 *  A scan that exceeds this is a regression and fails the test. Set all to 0
 *  when running against a product you own. */
const BASELINE: Record<string, number> = {
  login: 1,
  shop: 2,
  checkout: 2,
  'file-upload': 2,
};

const runScan = async (page: import('@playwright/test').Page, label: string): Promise<void> => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const summary = summarise(results.violations);
  const byImpact = countByImpact(summary);
  const criticalCount = byImpact.critical ?? 0;

  await test.info().attach(`a11y-${label}-violations.json`, {
    body: JSON.stringify(summary, null, 2),
    contentType: 'application/json',
  });

  test.info().annotations.push({
    type: 'a11y',
    description: `${label}: ${summary.length} total violations — ${JSON.stringify(byImpact)}`,
  });

  const baseline = BASELINE[label] ?? 0;
  expect(
    criticalCount,
    `Regression: ${label} now has ${criticalCount} critical violations (baseline ${baseline}).\n` +
      `Violations:\n${JSON.stringify(summary.filter((v) => v.impact === 'critical'), null, 2)}`,
  ).toBeLessThanOrEqual(baseline);
};

test.describe('Accessibility (WCAG 2.1 A + AA)', () => {
  test('login page has no critical a11y violations', {
    tag: ['@a11y', '@critical'],
  }, async ({ loginPage, page }) => {
    await loginPage.goto();
    await runScan(page, 'login');
  });

  test('shop page (post-login) has no critical a11y violations', {
    tag: ['@a11y'],
  }, async ({ loginPage, shopPage, page }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.expectCartVisible();
    await runScan(page, 'shop');
  });

  test('checkout shipping form has no critical a11y violations', {
    tag: ['@a11y'],
  }, async ({ loginPage, shopPage, checkoutPage, page }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.addProductToCart(0);
    await shopPage.proceedToCheckout();
    await checkoutPage.expectShippingFormVisible();
    await runScan(page, 'checkout');
  });

  test('file upload page has no critical a11y violations', {
    tag: ['@a11y'],
  }, async ({ fileUploadPage, page }) => {
    await fileUploadPage.goto();
    await runScan(page, 'file-upload');
  });
});
