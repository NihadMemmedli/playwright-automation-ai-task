import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const EnvSchema = z.object({
  BASE_URL: z.string().url().default('https://qa-practice.netlify.app'),
  AI_HEALING_ENABLED: z
    .string()
    .default('false')
    .transform((v) => v.toLowerCase() === 'true'),
  AI_HEALING_PROVIDER: z.enum(['anthropic', 'openrouter', 'ollama']).default('anthropic'),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  AI_HEALING_MODEL: z.string().default('claude-haiku-4-5-20251001'),
  AI_HEALING_MAX_PER_TEST: z.coerce.number().int().positive().default(3),
  AI_HEALING_MAX_PER_RUN: z.coerce.number().int().positive().default(10),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  BASE_URL: process.env.BASE_URL,
  AI_HEALING_ENABLED: process.env.AI_HEALING_ENABLED,
  AI_HEALING_PROVIDER: process.env.AI_HEALING_PROVIDER,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  AI_HEALING_MODEL: process.env.AI_HEALING_MODEL,
  AI_HEALING_MAX_PER_TEST: process.env.AI_HEALING_MAX_PER_TEST,
  AI_HEALING_MAX_PER_RUN: process.env.AI_HEALING_MAX_PER_RUN,
  LOG_LEVEL: process.env.LOG_LEVEL,
});

export const isHealingActive = (): boolean => {
  if (!env.AI_HEALING_ENABLED) return false;
  switch (env.AI_HEALING_PROVIDER) {
    case 'anthropic':
      return !!env.ANTHROPIC_API_KEY;
    case 'openrouter':
      return !!env.OPENROUTER_API_KEY;
    case 'ollama':
      return true;
  }
};
