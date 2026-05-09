import type { Page } from '@playwright/test';
import { heal, type SelfHealingLocator } from '@healing/index';

export abstract class BasePage {
  protected readonly page: Page;
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    // Wait for web fonts to finish loading. The practice site uses Bootstrap with
    // async fonts — text reflows when fonts swap in, which under parallel-worker
    // contention happens late enough to trip WebKit's actionability stability check.
    // Probing showed the login submit button shifts ~6px wide ~400ms after DOM ready.
    await this.page.evaluate(() => document.fonts.ready).catch(() => undefined);
  }

  protected $(intent: string, selector: string): SelfHealingLocator {
    return heal(this.page, intent, selector);
  }

  url(): string {
    return this.page.url();
  }
}
