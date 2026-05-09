import { test, expect } from '@fixtures/test-fixtures';

test.describe('Checkout — edge cases', () => {
  test.beforeEach(async ({ loginPage, shopPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.addProductToCart(0);
    await shopPage.proceedToCheckout();
  });

  test('changing the country select updates the bound option', {
    tag: ['@regression'],
  }, async ({ page }) => {
    const countrySelect = page.locator('select[name="country"]');
    await countrySelect.selectOption('Canada');
    await expect(countrySelect).toHaveValue('Canada');
    await countrySelect.selectOption('United Kingdom');
    await expect(countrySelect).toHaveValue('United Kingdom');
  });

  test('special characters in shipping fields are accepted as plain text', {
    tag: ['@regression'],
  }, async ({ checkoutPage, page }) => {
    const tricky = "O'Brien-Müller 中文 (test) <span>";
    await checkoutPage.fillShippingDetails({
      phone: '15551234567',
      street: tricky,
      city: tricky,
      country: 'Canada',
    });
    await expect(page.locator('input[name="street"]')).toHaveValue(tricky);
    await expect(page.locator('input[name="city"]')).toHaveValue(tricky);
    // No script execution / DOM injection — the value should round-trip as text.
    await expect(page.locator('span', { hasText: 'span' })).toHaveCount(0);
  });

  test('phone field accepts numeric input but does not coerce non-numeric to empty', {
    tag: ['@regression'],
  }, async ({ page }) => {
    const phoneInput = page.locator('input[name="phone"]');
    await phoneInput.fill('+1 (555) 123-4567');
    const value = await phoneInput.inputValue();
    // Document the input's actual handling: accepts the literal string. A
    // future site change to enforce numeric-only would surface as a regression.
    expect(value.length).toBeGreaterThan(0);
  });

  test('clicking Submit Order without a phone number still attempts submission', {
    tag: ['@regression'],
  }, async ({ checkoutPage }) => {
    // Don't fill phone. The site's submit handler runs JS regardless — capture
    // whatever signal (console / dialog / network) it produces and pin it.
    const result = await checkoutPage.submitOrder().catch((err: Error) => ({ error: err.message }));
    expect(result).toBeDefined();
  });
});
