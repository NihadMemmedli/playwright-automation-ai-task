import { test, expect } from '@fixtures/test-fixtures';
import { VALID_CREDENTIALS } from '@pages/index';

test.describe('E-commerce auth + order — happy path', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('logs in, adds 2 products, completes checkout, and logs out', {
    tag: ['@smoke', '@critical'],
  }, async ({
    loginPage,
    shopPage,
    checkoutPage,
  }) => {
    await test.step('Login with valid credentials', async () => {
      await loginPage.loginWithValidCredentials();
      await shopPage.expectCartVisible();
    });

    await test.step('Add two products to cart and verify total updates', async () => {
      const totalBefore = await shopPage.getCartTotal();
      const first = await shopPage.addProductToCart(0);
      const second = await shopPage.addProductToCart(1);

      const itemCount = await shopPage.getCartItemCount();
      expect(itemCount).toBe(2);

      const totalAfter = await shopPage.getCartTotal();
      expect(totalAfter).toBeGreaterThan(totalBefore);
      expect(totalAfter).toBeCloseTo(first.price + second.price, 2);
    });

    await test.step('Proceed to checkout and fill shipping details', async () => {
      await shopPage.proceedToCheckout();
      await checkoutPage.expectShippingFormVisible();
      await checkoutPage.fillShippingDetails({
        phone: '15551234567',
        street: '221B Baker Street',
        city: 'London',
        country: 'United Kingdom',
      });
    });

    await test.step('Submit order — site emits console "total Price" log on success', async () => {
      const { orderConsoleSeen } = await checkoutPage.submitOrder();
      expect(orderConsoleSeen, 'site should emit order-success console log').toBe(true);
    });

    await test.step('Logout and verify return to login page', async () => {
      await shopPage.logout();
      await shopPage.expectLoggedOut();
    });
  });

  test('credentials displayed on the page match what we use', {
    tag: ['@regression'],
  }, async ({ page }) => {
    const body = await page.locator('body').innerText();
    expect(body).toContain(VALID_CREDENTIALS.email);
    expect(body).toContain(VALID_CREDENTIALS.password);
  });
});
