import { test, expect } from '@fixtures/test-fixtures';

test.describe('E-commerce — auth edge cases', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('rejects invalid password — shows Bad credentials error', {
    tag: ['@critical'],
  }, async ({ loginPage, shopPage }) => {
    await loginPage.login('admin@admin.com', 'wrong-password');
    await loginPage.expectBadCredentialsError();
    await shopPage.expectCartHidden();
  });

  test('rejects unknown email — shows Bad credentials error', {
    tag: ['@critical'],
  }, async ({ loginPage, shopPage }) => {
    await loginPage.login('not-a-user@example.com', 'admin123');
    await loginPage.expectBadCredentialsError();
    await shopPage.expectCartHidden();
  });

  test('empty form submit shows Bad credentials error', {
    tag: ['@regression'],
  }, async ({ loginPage }) => {
    await loginPage.submitWithoutFilling();
    await loginPage.expectBadCredentialsError();
  });

  test('email-only submit (empty password) shows Bad credentials error', {
    tag: ['@regression'],
  }, async ({ loginPage }) => {
    await loginPage.fillEmail('admin@admin.com');
    await loginPage.submitWithoutFilling();
    await loginPage.expectBadCredentialsError();
  });

  test('removing a cart item updates the total', {
    tag: ['@critical'],
  }, async ({ loginPage, shopPage }) => {
    await loginPage.loginWithValidCredentials();
    await shopPage.addProductToCart(0);
    await shopPage.addProductToCart(1);

    const totalBefore = await shopPage.getCartTotal();
    expect(totalBefore).toBeGreaterThan(0);

    const itemsBefore = await shopPage.getCartItemCount();
    await shopPage.removeFirstItem();

    await expect
      .poll(async () => shopPage.getCartItemCount(), { timeout: 5_000 })
      .toBeLessThan(itemsBefore);

    const totalAfter = await shopPage.getCartTotal();
    expect(totalAfter).toBeLessThan(totalBefore);
  });

  test('logout clears authenticated state — re-navigation lands on login form', {
    tag: ['@regression'],
  }, async ({
    loginPage,
    shopPage,
  }) => {
    await loginPage.loginWithValidCredentials();
    await shopPage.logout();
    await loginPage.goto();
    await shopPage.expectLoggedOut();
  });
});
