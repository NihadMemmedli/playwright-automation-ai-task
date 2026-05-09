import { test, expect } from '@fixtures/test-fixtures';

test.describe('Cart — edge cases', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
  });

  test('clicking ADD TO CART twice for the same product is a no-op on the second click', {
    tag: ['@regression'],
  }, async ({ shopPage, page }) => {
    // Pin the demo site's actual behavior: the second click on the same
    // product's ADD TO CART button does NOT add a new cart row and does NOT
    // bump the cart total. The site neither shows a quantity field nor
    // duplicates the row — the click is effectively idempotent. If the site
    // ever changes (real cart with quantities), this test flips and prompts
    // the cart-quantity tests to be revisited.
    const itemsBefore = await shopPage.getCartItemCount();
    await shopPage.addProductToCart(0);
    const itemsAfterFirst = await shopPage.getCartItemCount();
    expect(itemsAfterFirst).toBe(itemsBefore + 1);

    const totalAfterFirst = await shopPage.getCartTotal();

    // Bypass the POM (which waits for cart-row count to grow) and click
    // directly — we expect the row count to stay the same. Use a poll-based
    // negative wait: confirm the count stays at itemsAfterFirst over a window.
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
    await expect
      .poll(async () => shopPage.getCartItemCount(), { timeout: 1_500 })
      .toBe(itemsAfterFirst);

    const itemsAfterSecond = await shopPage.getCartItemCount();
    const totalAfterSecond = await shopPage.getCartTotal();
    expect(itemsAfterSecond).toBe(itemsAfterFirst);
    expect(totalAfterSecond).toBeCloseTo(totalAfterFirst, 2);
  });

  test('cart total equals the sum of unit prices for all added products', {
    tag: ['@regression'],
  }, async ({ shopPage, page }) => {
    const productCount = await page.getByRole('button', { name: 'ADD TO CART' }).count();
    expect(productCount, 'shop should expose at least 2 products').toBeGreaterThanOrEqual(2);

    let expectedTotal = 0;
    for (let i = 0; i < Math.min(productCount, 3); i += 1) {
      const { price } = await shopPage.addProductToCart(i);
      expectedTotal += price;
    }

    const total = await shopPage.getCartTotal();
    expect(total).toBeCloseTo(expectedTotal, 2);
  });

  test('removing every item one by one returns the cart total to zero', {
    tag: ['@regression'],
  }, async ({ shopPage, page }) => {
    await shopPage.addProductToCart(0);
    await shopPage.addProductToCart(1);

    let remaining = await shopPage.getCartItemCount();
    expect(remaining).toBeGreaterThan(0);

    while (remaining > 0) {
      await shopPage.removeFirstItem();
      // Wait until the row count actually decreases — the site re-renders
      // asynchronously after the click handler runs.
      await expect
        .poll(async () => shopPage.getCartItemCount(), { timeout: 5_000 })
        .toBeLessThan(remaining);
      remaining = await shopPage.getCartItemCount();
    }

    expect(await shopPage.getCartTotal()).toBe(0);
    await expect(page.getByRole('button', { name: 'REMOVE' })).toHaveCount(0);
  });

  test('proceeding to checkout with an empty cart still navigates without crashing', {
    tag: ['@regression'],
  }, async ({ shopPage, page }) => {
    expect(await shopPage.getCartItemCount()).toBe(0);
    await shopPage.proceedToCheckout();

    // The site does not block empty-cart checkout — it surfaces the shipping
    // form the same as for a populated cart. Document that behavior so a
    // future fix flips this test red and prompts a coverage update.
    await expect(page.getByRole('heading', { name: 'Shipping Details' })).toBeVisible();
  });
});
