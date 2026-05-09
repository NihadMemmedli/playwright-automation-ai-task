import { createLogger } from '@utils/logger';
import { SYSTEM_PROMPT, buildUserMessage, parseHealResponse } from './prompts';
import type { HealerProvider, HealRequest, HealResult, IHealer } from './types';

const log = createLogger('OllamaHealer');

export interface OllamaHealerOptions {
  baseURL: string;
  model: string;
}

interface OllamaChatResponse {
  message?: { content?: string };
  error?: string;
}

/**
 * Talks to Ollama's native `/api/chat` endpoint with `format: "json"`.
 * The OpenAI-compatible layer mishandles `response_format` for small models —
 * they echo the DOM back instead of producing a selector. The native endpoint
 * with format=json yields strict, reliable JSON.
 */
export class OllamaHealer implements IHealer {
  readonly provider: HealerProvider = 'ollama';
  readonly model: string;
  private readonly baseURL: string;

  constructor(opts: OllamaHealerOptions) {
    this.baseURL = opts.baseURL.replace(/\/$/, '');
    this.model = opts.model;
  }

  async heal(req: HealRequest): Promise<HealResult> {
    log.debug('Requesting heal', {
      model: this.model,
      intent: req.intent,
      original: req.originalSelector,
    });

    const res = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        format: 'json',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserMessage(req) },
        ],
        options: { num_predict: 512 },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama healer HTTP ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = (await res.json()) as OllamaChatResponse;
    if (data.error) {
      throw new Error(`Ollama healer error: ${data.error}`);
    }
    const content = data.message?.content;
    if (!content) {
      throw new Error('Ollama healer returned no message content');
    }

    let result: HealResult;
    try {
      result = parseHealResponse(content);
    } catch (err) {
      log.warn('Heal response failed to parse', {
        model: this.model,
        rawResponse: content.slice(0, 1000),
      });
      throw err;
    }

    log.info('Heal received', {
      model: this.model,
      intent: req.intent,
      original: req.originalSelector,
      healed: result.selector,
      confidence: result.confidence,
    });
    return result;
  }
}
