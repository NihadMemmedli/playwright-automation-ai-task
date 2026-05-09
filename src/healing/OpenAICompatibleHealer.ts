import OpenAI from 'openai';
import { createLogger } from '@utils/logger';
import { SYSTEM_PROMPT, buildUserMessage, parseHealResponse } from './prompts';
import type { HealerProvider, HealRequest, HealResult, IHealer } from './types';

export type OpenAICompatibleProvider = Extract<HealerProvider, 'openrouter'>;

export interface OpenAICompatibleHealerOptions {
  baseURL: string;
  apiKey: string;
  model: string;
  providerLabel: OpenAICompatibleProvider;
  defaultHeaders?: Record<string, string>;
}

export class OpenAICompatibleHealer implements IHealer {
  readonly provider: HealerProvider;
  readonly model: string;
  private readonly client: OpenAI;
  private readonly log: ReturnType<typeof createLogger>;

  constructor(opts: OpenAICompatibleHealerOptions) {
    this.client = new OpenAI({
      baseURL: opts.baseURL,
      apiKey: opts.apiKey,
      defaultHeaders: opts.defaultHeaders,
    });
    this.model = opts.model;
    this.provider = opts.providerLabel;
    this.log = createLogger('OpenRouterHealer');
  }

  async heal(req: HealRequest): Promise<HealResult> {
    this.log.debug('Requesting heal', {
      provider: this.provider,
      model: this.model,
      intent: req.intent,
      original: req.originalSelector,
    });

    const completion = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 512,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(req) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`${this.provider} healer returned no text content`);
    }

    let result: HealResult;
    try {
      result = parseHealResponse(content);
    } catch (err) {
      this.log.warn('Heal response failed to parse', {
        provider: this.provider,
        model: this.model,
        rawResponse: content.slice(0, 1000),
      });
      throw err;
    }
    this.log.info('Heal received', {
      provider: this.provider,
      intent: req.intent,
      original: req.originalSelector,
      healed: result.selector,
      confidence: result.confidence,
    });
    return result;
  }
}
