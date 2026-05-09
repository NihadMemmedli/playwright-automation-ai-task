import { test, expect, type Page, type Locator } from '@playwright/test';
import { env } from '@config/env';
import { createLogger } from '@utils/logger';
import { createHealer } from './factory';
import { HealingCache } from './HealingCache';
import { captureSnapshot } from './DomSnapshot';
import type { HealResult, HealingEvent, IHealer } from './types';

const log = createLogger('SelfHealingLocator');

class HealingBudget {
  private perTest = 0;
  private static perRun = 0;

  resetForTest(): void {
    this.perTest = 0;
  }

  consume(): boolean {
    if (this.perTest >= env.AI_HEALING_MAX_PER_TEST) {
      log.warn('Per-test healing budget exhausted', { limit: env.AI_HEALING_MAX_PER_TEST });
      return false;
    }
    if (HealingBudget.perRun >= env.AI_HEALING_MAX_PER_RUN) {
      log.warn('Per-run healing budget exhausted', { limit: env.AI_HEALING_MAX_PER_RUN });
      return false;
    }
    this.perTest += 1;
    HealingBudget.perRun += 1;
    return true;
  }
}

export const healingBudget = new HealingBudget();

const cache = new HealingCache();

let _healer: IHealer | null = null;
let _healerInitialized = false;
const getHealer = (): IHealer | null => {
  if (_healerInitialized) return _healer;
  _healer = createHealer();
  _healerInitialized = true;
  return _healer;
};

const errMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

const recordHealingEvent = async (event: HealingEvent): Promise<void> => {
  await test.info().attach(`healing-${event.intent}-${event.outcome}.json`, {
    body: JSON.stringify(event, null, 2),
    contentType: 'application/json',
  });
  log.info('AI healed selector', {
    provider: event.provider,
    model: event.model,
    intent: event.intent,
    original: event.originalSelector,
    healed: event.healed.selector,
    confidence: event.healed.confidence,
    outcome: event.outcome,
  });
};

const HEALING_STEP_PREFIX = 'AI Healing';

export interface SelfHealingLocatorOptions {
  intent: string;
  selector: string;
  page: Page;
}

/**
 * Wraps a Playwright Locator with an LLM-powered fallback. On action failure,
 * captures DOM, asks the configured healer (Claude / OpenRouter / Ollama) for a
 * replacement selector, retries once. Healing is opt-in via AI_HEALING_ENABLED;
 * otherwise behaves like a normal Locator.
 */
export class SelfHealingLocator {
  readonly intent: string;
  readonly originalSelector: string;
  private readonly page: Page;
  private healedSelector: string | null = null;

  constructor(opts: SelfHealingLocatorOptions) {
    this.intent = opts.intent;
    this.originalSelector = opts.selector;
    this.page = opts.page;
  }

  /** Returns the active locator (healed if previously healed, else original). */
  resolve(): Locator {
    return this.page.locator(this.healedSelector ?? this.originalSelector);
  }

  async click(options?: Parameters<Locator['click']>[0]): Promise<void> {
    await this.run('click', (loc) => loc.click(options));
  }

  async fill(value: string, options?: Parameters<Locator['fill']>[1]): Promise<void> {
    await this.run('fill', (loc) => loc.fill(value, options));
  }

  async type(value: string, options?: Parameters<Locator['pressSequentially']>[1]): Promise<void> {
    await this.run('type', (loc) => loc.pressSequentially(value, options));
  }

  async check(options?: Parameters<Locator['check']>[0]): Promise<void> {
    await this.run('check', (loc) => loc.check(options));
  }

  async selectOption(value: string | string[]): Promise<void> {
    await this.run('selectOption', (loc) => loc.selectOption(value));
  }

  async setInputFiles(files: string | string[]): Promise<void> {
    await this.run('setInputFiles', (loc) => loc.setInputFiles(files));
  }

  async hover(): Promise<void> {
    await this.run('hover', (loc) => loc.hover());
  }

  async scrollIntoViewIfNeeded(): Promise<void> {
    await this.run('scrollIntoViewIfNeeded', (loc) => loc.scrollIntoViewIfNeeded());
  }

  async waitFor(state: 'visible' | 'attached' | 'detached' | 'hidden' = 'visible'): Promise<void> {
    await this.run(`waitFor:${state}`, (loc) => loc.waitFor({ state }));
  }

  async textContent(): Promise<string | null> {
    return this.runReturning('textContent', (loc) => loc.textContent());
  }

  async innerText(): Promise<string> {
    return this.runReturning('innerText', (loc) => loc.innerText());
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.runReturning('waitFor:visible', (loc) => loc.waitFor({ state: 'visible', timeout: 3_000 }));
      return true;
    } catch {
      return false;
    }
  }

  async expectVisible(options?: { timeout?: number }): Promise<void> {
    await this.run('expect:visible', async (loc) => {
      await expect(loc).toBeVisible(options);
    });
  }

  async expectHidden(): Promise<void> {
    await this.run('expect:hidden', async (loc) => {
      await expect(loc).toBeHidden();
    });
  }

  async expectText(text: string | RegExp): Promise<void> {
    await this.run('expect:text', async (loc) => {
      await expect(loc).toContainText(text);
    });
  }

  // ── internals ──────────────────────────────────────────────────────────

  private async run<T>(action: string, op: (loc: Locator) => Promise<T>): Promise<T> {
    return this.runReturning(action, op);
  }

  private async runReturning<T>(action: string, op: (loc: Locator) => Promise<T>): Promise<T> {
    const activeSelector = this.healedSelector ?? this.originalSelector;
    try {
      return await op(this.page.locator(activeSelector));
    } catch (firstError) {
      const reason = errMessage(firstError);
      const healer = getHealer();
      if (!healer || !healingBudget.consume()) {
        throw firstError;
      }

      const started = Date.now();
      return await test.step(`${HEALING_STEP_PREFIX}: ${this.intent} (${action})`, async () => {
        const url = this.page.url();
        let healed = cache.get(url, this.intent, this.originalSelector);
        const cacheHit = !!healed;

        if (!healed) {
          const domSnippet = await captureSnapshot(this.page);
          healed = await healer.heal({
            url,
            intent: this.intent,
            originalSelector: this.originalSelector,
            failureReason: reason,
            domSnippet,
          });
        }

        try {
          const result = await op(this.page.locator(healed.selector));
          this.healedSelector = healed.selector;
          if (!cacheHit) cache.set(url, this.intent, this.originalSelector, healed);
          await recordHealingEvent(this.buildEvent(url, healed, 'success', Date.now() - started, healer));
          return result;
        } catch (secondError) {
          // Healed selector also failed → invalidate cache, surface original error
          if (cacheHit) cache.invalidate(url, this.intent, this.originalSelector);
          await recordHealingEvent(this.buildEvent(url, healed, 'failure', Date.now() - started, healer));
          throw new Error(
            `Healing failed. Original: "${this.originalSelector}" — ${reason}\n` +
            `Healed:   "${healed.selector}" — ${errMessage(secondError)}`,
          );
        }
      });
    }
  }

  private buildEvent(
    url: string,
    healed: HealResult,
    outcome: 'success' | 'failure',
    durationMs: number,
    healer: IHealer,
  ): HealingEvent {
    return {
      timestamp: new Date().toISOString(),
      url,
      intent: this.intent,
      originalSelector: this.originalSelector,
      healed,
      outcome,
      durationMs,
      provider: healer.provider,
      model: healer.model,
    };
  }
}

export const heal = (page: Page, intent: string, selector: string): SelfHealingLocator =>
  new SelfHealingLocator({ page, intent, selector });
