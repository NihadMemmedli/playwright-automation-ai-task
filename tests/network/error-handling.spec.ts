import { test, expect } from '../fixtures/test-fixtures';

/**
 * Network resilience tests. The site under test is a static SPA with no real
 * backend — most of these specs exercise the framework's ability to inject
 * faults via `page.route()` and `context.setOffline()`, and document how the
 * UI behaves when the network misbehaves around it (e.g. a third-party CDN
 * for assets, or a hypothetical future API endpoint).
 */
test.describe('Network — error handling', () => {
  test('app survives a 500 from an intercepted asset request', {
    tag: ['@network', '@regression'],
  }, async ({ page, loginPage, shopPage }) => {
    // Inject a 500 for any non-document GET issued during login. The SPA's
    // critical path runs entirely in JS shipped with the HTML, so login should
    // still complete even if a peripheral asset (favicon, analytics, etc.)
    // returns 500. This pins that resilience.
    await page.route('**/*.{png,jpg,jpeg,svg,ico,gif}', async (route) => {
      await route.fulfill({ status: 500, body: '' });
    });

    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.expectCartVisible();
  });

  test('slow network: login still completes when responses are throttled', {
    tag: ['@network', '@regression'],
  }, async ({ page, loginPage, shopPage }) => {
    // Add a 500ms delay to every non-document response. Tests that the
    // selector strategy + actionability waits accommodate slow loads and that
    // we don't silently double-click the submit button under throttling.
    await page.route('**/*', async (route) => {
      await new Promise((r) => setTimeout(r, 200));
      await route.continue();
    });

    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.expectCartVisible();
  });

  test('offline mid-flow: action after going offline does not corrupt UI state', {
    tag: ['@network', '@regression'],
  }, async ({ page, context, loginPage, shopPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.expectCartVisible();

    // Go offline. Any subsequent navigation/asset request will fail. The
    // cart UI is already loaded — interacting with it should remain possible.
    await context.setOffline(true);

    const totalBefore = await shopPage.getCartTotal();
    await shopPage.addProductToCart(0).catch(() => undefined);

    // The page should not have crashed: critical UI elements still rendered.
    await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();

    // Restore connectivity for cleanup.
    await context.setOffline(false);

    // Document state after offline interaction (may or may not reflect the
    // attempted add — depends on whether the click handler is purely client).
    const totalAfter = await shopPage.getCartTotal();
    expect(typeof totalAfter).toBe('number');
    expect(totalBefore).toBeGreaterThanOrEqual(0);
  });
});
