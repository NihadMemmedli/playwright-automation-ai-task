export type HealStrategy = 'css' | 'xpath' | 'text' | 'role' | 'testid' | 'placeholder' | 'label';

export interface HealRequest {
  url: string;
  intent: string;
  originalSelector: string;
  failureReason: string;
  domSnippet: string;
}

export interface HealResult {
  selector: string;
  strategy: HealStrategy;
  confidence: number;
  reasoning: string;
}

export type HealerProvider = 'anthropic' | 'openrouter' | 'ollama';

export interface HealingEvent {
  timestamp: string;
  url: string;
  intent: string;
  originalSelector: string;
  healed: HealResult;
  outcome: 'success' | 'failure';
  durationMs: number;
  provider: HealerProvider;
  model: string;
}

export interface CacheEntry {
  intent: string;
  originalSelector: string;
  url: string;
  healed: HealResult;
  hits: number;
  lastUsed: string;
}

export interface IHealer {
  readonly provider: HealerProvider;
  readonly model: string;
  heal(req: HealRequest): Promise<HealResult>;
}
