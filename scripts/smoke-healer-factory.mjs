#!/usr/bin/env node
// Smoke-tests the healer factory for each provider.
// Verifies env-driven selection wires the correct concrete class without making live API calls.
//
// Each case runs in a child process because src/config/env.ts parses env at module load.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');

const probe = `
import { createHealer } from './src/healing/factory';
const h = createHealer();
if (!h) { console.error('NULL'); process.exit(2); }
console.log(JSON.stringify({ ctor: h.constructor.name, provider: h.provider, model: h.model }));
`;

const cases = [
  {
    name: 'anthropic',
    env: {
      AI_HEALING_ENABLED: 'true',
      AI_HEALING_PROVIDER: 'anthropic',
      ANTHROPIC_API_KEY: 'sk-ant-smoke-test',
      AI_HEALING_MODEL: 'claude-haiku-4-5-20251001',
    },
    expect: { ctor: 'ClaudeHealer', provider: 'anthropic' },
  },
  {
    name: 'openrouter',
    env: {
      AI_HEALING_ENABLED: 'true',
      AI_HEALING_PROVIDER: 'openrouter',
      OPENROUTER_API_KEY: 'sk-or-smoke-test',
      AI_HEALING_MODEL: 'anthropic/claude-3.5-haiku',
    },
    expect: { ctor: 'OpenAICompatibleHealer', provider: 'openrouter' },
  },
  {
    name: 'ollama',
    env: {
      AI_HEALING_ENABLED: 'true',
      AI_HEALING_PROVIDER: 'ollama',
      OLLAMA_BASE_URL: 'http://localhost:11434',
      AI_HEALING_MODEL: 'qwen2.5-coder:7b',
    },
    expect: { ctor: 'OllamaHealer', provider: 'ollama' },
  },
  {
    name: 'disabled-returns-null',
    env: { AI_HEALING_ENABLED: 'false', AI_HEALING_PROVIDER: 'anthropic' },
    expectNull: true,
  },
  {
    name: 'enabled-but-no-key-returns-null',
    env: { AI_HEALING_ENABLED: 'true', AI_HEALING_PROVIDER: 'anthropic' },
    expectNull: true,
  },
];

let failed = 0;
for (const c of cases) {
  const res = spawnSync('npx', ['tsx', '-e', probe], {
    cwd: projectRoot,
    env: { ...process.env, ...c.env },
    encoding: 'utf8',
  });

  if (c.expectNull) {
    if (res.status === 2 && res.stderr.includes('NULL')) {
      console.log(`  PASS  ${c.name}`);
    } else {
      console.log(`  FAIL  ${c.name}: expected null, got status=${res.status} stdout=${res.stdout.trim()} stderr=${res.stderr.trim()}`);
      failed++;
    }
    continue;
  }

  if (res.status !== 0) {
    console.log(`  FAIL  ${c.name}: status=${res.status} stderr=${res.stderr.trim()}`);
    failed++;
    continue;
  }

  let parsed;
  try {
    parsed = JSON.parse(res.stdout.trim().split('\n').pop());
  } catch {
    console.log(`  FAIL  ${c.name}: unparseable stdout=${res.stdout.trim()}`);
    failed++;
    continue;
  }

  const ok = parsed.ctor === c.expect.ctor && parsed.provider === c.expect.provider;
  if (ok) {
    console.log(`  PASS  ${c.name}: ${parsed.ctor} provider=${parsed.provider} model=${parsed.model}`);
  } else {
    console.log(`  FAIL  ${c.name}: expected ${JSON.stringify(c.expect)}, got ${JSON.stringify(parsed)}`);
    failed++;
  }
}

console.log(failed === 0 ? '\nAll factory cases wired correctly.' : `\n${failed} case(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
