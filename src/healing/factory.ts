import { env, isHealingActive } from '@config/env';
import { ClaudeHealer } from './ClaudeHealer';
import { OpenAICompatibleHealer } from './OpenAICompatibleHealer';
import { OllamaHealer } from './OllamaHealer';
import type { IHealer } from './types';

export const createHealer = (): IHealer | null => {
  if (!isHealingActive()) return null;

  switch (env.AI_HEALING_PROVIDER) {
    case 'anthropic':
      return new ClaudeHealer(env.ANTHROPIC_API_KEY!);

    case 'openrouter':
      return new OpenAICompatibleHealer({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: env.OPENROUTER_API_KEY!,
        model: env.AI_HEALING_MODEL,
        providerLabel: 'openrouter',
        defaultHeaders: {
          'HTTP-Referer': 'https://github.com/playwright-qa-framework',
          'X-Title': 'Playwright QA Framework',
        },
      });

    case 'ollama':
      return new OllamaHealer({
        baseURL: env.OLLAMA_BASE_URL,
        model: env.AI_HEALING_MODEL,
      });
  }
};
