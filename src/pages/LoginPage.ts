import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export const VALID_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'admin123',
} as const;

export class LoginPage extends BasePage {
  readonly path = '/auth_ecommerce';

  constructor(page: Page) {
    super(page);
  }

  private get emailInput()    { return this.$('login email input',    'role=textbox[name="Email"]'); }
  private get passwordInput() { return this.$('login password input', 'role=textbox[name="Password"]'); }
  // The live site exposes `test-data="submitBtn"` on this button — an explicit test-id
  // the site author placed for automation. Per Playwright guidance, when a test-id is
  // provided, it beats role-based for action targets. WebKit's role-engine + actionability
  // poll is unstable on this Bootstrap button during page load; the attribute selector
  // resolves synchronously and avoids that path.
  private get submitButton()  { return this.$('login submit button',  '[test-data="submitBtn"]'); }
  private get loggedInIndicator() { return this.$('shopping cart heading', 'role=heading[name="SHOPPING CART"]'); }
  private get loginError() { return this.$('bad credentials alert', 'role=alert'); }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginWithValidCredentials(): Promise<void> {
    await this.login(VALID_CREDENTIALS.email, VALID_CREDENTIALS.password);
    await this.expectLoggedIn();
  }

  async expectLoggedIn(): Promise<void> {
    await this.loggedInIndicator.expectVisible();
    // The products grid + click handlers are wired up by the page's JS after the cart
    // header renders. Wait for ADD TO CART buttons AND for the page to settle so the
    // onclick handlers are attached before tests attempt to click.
    await this.page.getByRole('button', { name: 'ADD TO CART' }).first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  }

  async expectBadCredentialsError(): Promise<void> {
    await this.loginError.expectVisible();
    await this.loginError.expectText(/bad credentials/i);
  }

  async isErrorVisible(): Promise<boolean> {
    return this.loginError.isVisible();
  }

  async submitWithoutFilling(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fill only the email field — useful for partial-form edge cases. */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /** Fill only the password field — useful for partial-form edge cases. */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }
}
