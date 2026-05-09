import Anthropic from '@anthropic-ai/sdk';
import { env } from '@config/env';
import { createLogger } from '@utils/logger';
import { SYSTEM_PROMPT, buildUserMessage, parseHealResponse } from './prompts';
import type { HealerProvider, HealRequest, HealResult, IHealer } from './types';

const log = createLogger('ClaudeHealer');

export class ClaudeHealer implements IHealer {
  readonly provider: HealerProvider = 'anthropic';
  readonly model: string;
  private readonly client: Anthropic;

  constructor(apiKey: string, model: string = env.AI_HEALING_MODEL) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async heal(req: HealRequest): Promise<HealResult> {
    log.debug('Requesting heal', { intent: req.intent, original: req.originalSelector });

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: buildUserMessage(req) }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Healer returned no text content');
    }

    const result = parseHealResponse(textBlock.text);
    log.info('Heal received', {
      intent: req.intent,
      original: req.originalSelector,
      healed: result.selector,
      confidence: result.confidence,
    });
    return result;
  }
}
