import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CacheEntry, HealResult } from './types';

const CACHE_PATH = resolve(process.cwd(), '.healing-cache.json');

const keyOf = (url: string, intent: string, originalSelector: string): string =>
  `${new URL(url).pathname}::${intent}::${originalSelector}`;

const load = (): Record<string, CacheEntry> => {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  } catch {
    return {};
  }
};

const persist = (data: Record<string, CacheEntry>): void => {
  const sorted = Object.keys(data)
    .sort()
    .reduce<Record<string, CacheEntry>>((acc, k) => {
      acc[k] = data[k];
      return acc;
    }, {});
  writeFileSync(CACHE_PATH, JSON.stringify(sorted, null, 2) + '\n');
};

export class HealingCache {
  private data: Record<string, CacheEntry> = load();

  get(url: string, intent: string, originalSelector: string): HealResult | null {
    const entry = this.data[keyOf(url, intent, originalSelector)];
    return entry ? entry.healed : null;
  }

  set(url: string, intent: string, originalSelector: string, healed: HealResult): void {
    const key = keyOf(url, intent, originalSelector);
    const existing = this.data[key];
    this.data[key] = {
      url,
      intent,
      originalSelector,
      healed,
      hits: existing ? existing.hits + 1 : 1,
      lastUsed: new Date().toISOString(),
    };
    persist(this.data);
  }

  invalidate(url: string, intent: string, originalSelector: string): void {
    delete this.data[keyOf(url, intent, originalSelector)];
    persist(this.data);
  }
}
