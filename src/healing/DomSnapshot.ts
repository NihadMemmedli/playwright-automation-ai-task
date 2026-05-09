import type { Page } from '@playwright/test';

const MAX_SNAPSHOT_CHARS = 20_000;

const STRIP_TAGS = ['script', 'style', 'noscript', 'svg', 'iframe', 'link', 'meta'];

const cleanScript = (html: string): string => {
  let cleaned = html;
  for (const tag of STRIP_TAGS) {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    cleaned = cleaned.replace(regex, '');
    cleaned = cleaned.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '');
  }
  return cleaned
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const truncate = (s: string, max: number): string =>
  s.length <= max ? s : s.slice(0, max) + `\n<!-- truncated ${s.length - max} chars -->`;

export const captureSnapshot = async (page: Page): Promise<string> => {
  try {
    const html = await page.evaluate(() => document.body?.outerHTML ?? document.documentElement.outerHTML);
    return truncate(cleanScript(html), MAX_SNAPSHOT_CHARS);
  } catch {
    return '<unable to capture DOM snapshot>';
  }
};
