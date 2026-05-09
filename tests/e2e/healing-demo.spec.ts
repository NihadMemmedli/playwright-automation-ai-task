import { test, expect } from '@fixtures/test-fixtures';
import { BasePage } from '@pages/index';
import type { Page } from '@playwright/test';

/**
 * Self-healing demonstration.
 *
 * This spec deliberately uses a **broken selector** (`#submitLoginBtnBROKEN`).
 * Without the self-healing layer it would fail. With healing enabled, the
 * Claude-backed `SelfHealingLocator` wrapper:
 *
 *   1. Catches the failed click,
 *   2. Snapshots the DOM and asks Claude for a replacement selector,
 *   3. Retries with the healed selector, and
 *   4. Attaches a `healing-…json` step + log entry to the test report.
 *
 * Run with:
 *
 *   npm run demo:healing
 *
 * This sets `HEALING_DEMO=1` and `AI_HEALING_ENABLED=true`. Without the
 * flag, the test is skipped (so this never runs in normal CI).
 *
 * After the run, open `npm run report` (or the Allure dashboard) — you'll
 * find an "AI Healing: login submit button (click)" step on the test, with
 * the healed selector and confidence attached as JSON.
 */

class BrokenLoginPage extends BasePage {
  readonly path = '/auth_ecommerce';

  constructor(page: Page) {
    super(page);
  }

  // Real selectors → SAME as LoginPage.
  private get emailInput()    { return this.$('login email input',    'role=textbox[name="Email"]'); }
  private get passwordInput() { return this.$('login password input', 'role=textbox[name="Password"]'); }

  // Deliberately broken selector — only resolves via the healing layer.
  // The intent string ("login submit button") is what Claude uses to find a real match.
  private get submitButton()  { return this.$('login submit button',  '#submitLoginBtnBROKEN'); }

  private get cartHeading()   { return this.$('shopping cart heading', 'role=heading[name="SHOPPING CART"]'); }

  async loginViaHealing(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedIn(): Promise<void> {
    await this.cartHeading.expectVisible();
  }
}

test.describe('Self-healing demonstration', () => {
  // eslint-disable-next-line playwright/no-skipped-test -- intentional: demo only runs under env flag
  test.skip(
    !process.env.HEALING_DEMO,
    'Skipped by default. Run `npm run demo:healing` (sets HEALING_DEMO=1 + AI_HEALING_ENABLED=true) to see the self-healing layer in action.',
  );

  test.beforeAll(() => {
    expect(
      process.env.AI_HEALING_ENABLED,
      'demo requires AI_HEALING_ENABLED=true',
    ).toBe('true');
    const provider = process.env.AI_HEALING_PROVIDER ?? 'anthropic';
    if (provider === 'anthropic') {
      expect(
        process.env.ANTHROPIC_API_KEY,
        'anthropic provider requires ANTHROPIC_API_KEY',
      ).toBeTruthy();
    } else if (provider === 'openrouter') {
      expect(
        process.env.OPENROUTER_API_KEY,
        'openrouter provider requires OPENROUTER_API_KEY',
      ).toBeTruthy();
    }
    // ollama needs no key — local server.
  });

  test('heals a deliberately broken submit-button selector', {
    tag: ['@demo'],
  }, async ({ page }) => {
    const broken = new BrokenLoginPage(page);
    await broken.goto();

    // Without healing this throws on the click — `#submitLoginBtnBROKEN` doesn't exist.
    // With healing, the wrapper asks Claude for a real submit button matching the
    // intent "login submit button", then retries the click.
    await broken.loginViaHealing('admin@admin.com', 'admin123');

    await broken.expectLoggedIn();
  });
});
