import { test, expect } from '@fixtures/test-fixtures';

test.describe('Session — edge cases', () => {
  test('refresh on shop page returns to login (in-memory session, no persistence)', {
    tag: ['@regression'],
  }, async ({ page, loginPage, shopPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.expectCartVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Document the actual behavior: the demo SPA holds auth state in JS only,
    // so a hard refresh drops it. If the site ever wires up persistence this
    // assertion flips and prompts a session-test rewrite.
    await shopPage.expectLoggedOut();
  });

  test('direct navigation to /auth_ecommerce while logged out lands on login form', {
    tag: ['@regression'],
  }, async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  });

  test('two-tab login: a fresh tab does not inherit the first tab\'s session', {
    tag: ['@regression'],
  }, async ({ context, loginPage, shopPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.expectCartVisible();

    // Same browser context, fresh tab — would inherit cookies/storage if the
    // site used either. With in-memory state, the second tab starts logged out.
    const tab2 = await context.newPage();
    await tab2.goto('/auth_ecommerce');
    await expect(tab2.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await tab2.close();
  });
});
