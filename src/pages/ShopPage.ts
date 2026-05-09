import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ShopPage extends BasePage {
  readonly path = '/auth_ecommerce';

  constructor(page: Page) {
    super(page);
  }

  private get cartHeading() { return this.$('cart heading', 'role=heading[name="SHOPPING CART"]'); }
  // The login form heading is the most stable post-logout signal: static text in an <h2>,
  // no Bootstrap actionability poll, no JS-attached attribute. Both the role-based selector
  // and the [test-data="submitBtn"] attribute land late on slow page loads.
  private get loginPageHeading() { return this.$('login page heading', 'role=heading[name="Login - Shop"]'); }
  private get cartTotal()   { return this.$('cart total price', '.cart-total-price'); }
  private get proceedToCheckoutBtn() { return this.$('proceed to checkout button', 'role=button[name="PROCEED TO CHECKOUT"]'); }
  private get logoutLink()  { return this.$('logout link', 'role=link[name="Log Out"]'); }
  private get mobileNavToggle() { return this.$('mobile nav toggle button', 'role=button[name="Toggle navigation"]'); }

  private addToCartButtons() {
    return this.page.getByRole('button', { name: 'ADD TO CART' });
  }

  private removeButtons() {
    return this.page.getByRole('button', { name: 'REMOVE' });
  }

  /** Adds the Nth ADD TO CART button (0-indexed). Returns the displayed price of that product. */
  async addProductToCart(index: number = 0): Promise<{ price: number }> {
    const addButtons = this.addToCartButtons();
    await expect(addButtons.first()).toBeVisible();
    const count = await addButtons.count();
    if (index >= count) {
      throw new Error(`Product index ${index} out of range (only ${count} products)`);
    }
    // Price lives in the .shop-item-price sibling within the same .shop-item-details
    // container (one DOM step up from the button). Avoids XPath ancestor walks.
    const priceText = await addButtons.nth(index).locator('..').locator('.shop-item-price').innerText().catch(() => '');
    const priceMatch = priceText.match(/\$\s?(\d+(?:\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

    const removeButtonsBefore = await this.removeButtons().count();
    await addButtons.nth(index).click();
    // Wait until the cart reflects the addition (REMOVE button appears for the new row).
    await expect
      .poll(() => this.removeButtons().count(), { timeout: 10_000 })
      .toBeGreaterThan(removeButtonsBefore);
    return { price };
  }

  async getCartTotal(): Promise<number> {
    const text = (await this.cartTotal.textContent()) ?? '$0';
    const match = text.match(/\$?\s?(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getCartItemCount(): Promise<number> {
    return this.removeButtons().count();
  }

  async removeFirstItem(): Promise<void> {
    const removeButtons = this.removeButtons();
    await expect(removeButtons.first()).toBeVisible();
    await removeButtons.first().click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutBtn.click();
  }

  async expectCartVisible(): Promise<void> {
    await this.cartHeading.expectVisible();
  }

  async expectCartHidden(): Promise<void> {
    await this.cartHeading.expectHidden();
  }

  async logout(): Promise<void> {
    // Mobile viewports collapse the side nav behind a hamburger toggle (.d-lg-none).
    // Open it first if the logout link isn't visible.
    if (!(await this.logoutLink.isVisible())) {
      await this.mobileNavToggle.click().catch(() => undefined);
    }
    // noWaitAfter: the practice site's post-logout navigation occasionally stalls past 15s.
    // The follow-up expectLoggedOut() asserts the post-logout DOM, which is the real signal.
    await this.logoutLink.click({ noWaitAfter: true });
  }

  async expectLoggedOut(): Promise<void> {
    // The login heading is the post-logout signal — static <h2> text, no JS-attached
    // attribute, no Bootstrap actionability poll. waitForURL was unreliable here
    // because the practice site's logout redirect chain doesn't always settle on a
    // single URL. 45s budget covers worst p95 (~44s) seen under parallel-worker load.
    await this.loginPageHeading.expectVisible({ timeout: 45_000 });
    await this.cartHeading.expectHidden();
  }
}
