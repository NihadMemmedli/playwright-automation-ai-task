import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ShippingDetails {
  phone: string;
  street?: string;
  city?: string;
  /** Country option label as shown in the <select> (e.g. "United Kingdom"). */
  country: string;
}

export class CheckoutPage extends BasePage {
  // Shared route with LoginPage / ShopPage — the practice site renders login → shop →
  // checkout as states on a single page; we keep the path here so direct .goto() works.
  readonly path = '/auth_ecommerce';

  constructor(page: Page) {
    super(page);
  }

  // The form fields on this page have no <label for=...> and no aria-label, so a
  // user-facing locator (getByLabel / role+name) isn't available. The form's `name`
  // attributes are the most stable hook — they're load-bearing for form submission,
  // so they don't drift with copy or styling changes.
  private get shippingHeading()  { return this.$('shipping details heading', 'role=heading[name="Shipping Details"]'); }
  private get phoneInput()       { return this.$('phone input',  'input[name="phone"]'); }
  private get streetInput()      { return this.$('street input', 'input[name="street"]'); }
  private get cityInput()        { return this.$('city input',   'input[name="city"]'); }
  private get countrySelect()    { return this.$('country select','select[name="country"]'); }
  private get submitOrderButton(){ return this.$('submit order button','role=button[name="Submit Order"]'); }

  async expectShippingFormVisible(): Promise<void> {
    await this.shippingHeading.expectVisible();
  }

  async fillShippingDetails(details: ShippingDetails): Promise<void> {
    await this.phoneInput.fill(details.phone);
    if (details.street !== undefined) await this.streetInput.fill(details.street);
    if (details.city !== undefined) await this.cityInput.fill(details.city);
    await this.countrySelect.selectOption(details.country);
  }

  /**
   * Submits the order. The site under test has a UX bug — it does NOT render a visible
   * success element after a valid submit. The site's JS does emit a console message via
   * `submitOrder()` ("afisat" / "total Price ..."), so we use that as the success signal
   * and additionally assert no error dialog appeared.
   */
  async submitOrder(): Promise<{ orderConsoleSeen: boolean }> {
    let orderConsoleSeen = false;
    let dialogText: string | null = null;

    const consoleListener = (msg: import('@playwright/test').ConsoleMessage): void => {
      const text = msg.text();
      if (/total\s*price/i.test(text) || /afisat/i.test(text)) {
        orderConsoleSeen = true;
      }
    };
    const dialogListener = async (d: import('@playwright/test').Dialog): Promise<void> => {
      dialogText = d.message();
      await d.dismiss();
    };

    this.page.on('console', consoleListener);
    this.page.on('dialog', dialogListener);

    try {
      await this.submitOrderButton.click();
      // Give the site's JS time to log/dialog
      await this.page.waitForTimeout(1_000);
    } finally {
      this.page.off('console', consoleListener);
      this.page.off('dialog', dialogListener);
    }

    if (dialogText) {
      throw new Error(`Order submission triggered a dialog: ${dialogText}`);
    }
    return { orderConsoleSeen };
  }
}
