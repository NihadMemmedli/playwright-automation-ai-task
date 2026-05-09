import type { HealRequest, HealResult, HealStrategy } from './types';

export const SYSTEM_PROMPT = `You are an expert QA automation engineer specializing in Playwright. Your job is to repair broken selectors.

When given:
- The element's intent (what the test is trying to interact with, in plain English)
- The original failing selector
- The failure reason
- A trimmed HTML snapshot of the current page

Return a JSON object with a single, robust replacement selector that targets the same element. Prefer in this order:
1. Stable test attributes (data-testid, id with semantic name)
2. ARIA roles + accessible name (role-based)
3. Text content (when the visible label is stable)
4. Placeholder / label associations
5. CSS selector with stable class/structure (only as a last resort)

You MUST output STRICT JSON matching this schema, with no prose, no markdown fences:
{"selector": "<playwright selector>", "strategy": "css|xpath|text|role|testid|placeholder|label", "confidence": <0..1>, "reasoning": "<why this selector>"}

Selector formatting rules:
- For role-based, use the form: role=button[name="Submit"]
- For text, use: text="Log Out" (exact) or text=/Log Out/i (regex)
- For placeholder, use: [placeholder="..."]
- Otherwise return a valid CSS selector
- Never invent attributes that aren't in the provided HTML
- If you cannot find a confident match, return confidence < 0.3 and your best guess`;

export const VALID_STRATEGIES: ReadonlySet<HealStrategy> = new Set([
  'css', 'xpath', 'text', 'role', 'testid', 'placeholder', 'label',
]);

export const buildUserMessage = (req: HealRequest): string =>
  [
    'I have a broken Playwright selector that needs healing.',
    '',
    `Element intent: ${req.intent}`,
    `Broken selector: ${req.originalSelector}`,
    `Failure reason: ${req.failureReason}`,
    `Page URL: ${req.url}`,
    '',
    'The current page HTML is below. The page may contain multiple similar elements (e.g. several buttons or inputs from different sections). Pick ONLY the element whose semantic role matches the intent above — do not pick a similar element from a different section.',
    '',
    req.domSnippet,
    '',
    `Now propose a replacement selector that targets the "${req.intent}" element. Reply with JSON only, in this exact shape:`,
    '{"selector":"<replacement>","strategy":"css|role|text|testid|placeholder|label|xpath","confidence":0.0,"reasoning":"<short>"}',
  ].join('\n');

export const parseHealResponse = (raw: string): HealResult => {
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd <= jsonStart) {
    throw new Error(`No JSON object in healer response: ${raw.slice(0, 200)}`);
  }
  const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as Partial<HealResult>;
  if (typeof parsed.selector !== 'string' || !parsed.selector) {
    throw new Error('Healer response missing selector');
  }
  const strategy = (parsed.strategy ?? 'css') as HealStrategy;
  return {
    selector: parsed.selector,
    strategy: VALID_STRATEGIES.has(strategy) ? strategy : 'css',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '(no reasoning provided)',
  };
};
