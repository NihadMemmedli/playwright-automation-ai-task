# How-to guides

Task-oriented guides for working with the framework. Each section assumes you have already installed the framework (see the [tutorial](./tutorial.md) if you haven't) and answers a single "How do I…?" question. For the catalogue of every script and environment variable, see [reference.md](./reference.md).

---

## How to run a focused subset of the suite

The suite is sliced by **tag**, not by folder. Use the slice that matches your goal:

| If you want to… | Run |
|---|---|
| validate a change in under a minute | `npm run test:smoke` |
| pre-release gate | `npm run test:critical` |
| catch regressions across edge cases | `npm run test:regression` |
| audit accessibility only | `npm run test:a11y` |
| iterate on one area | `npm run test:auth` or `npm run test:upload` |
| run API + captured-traffic specs | `npm run test:api` — see [API & network how-to](./how-to-api-testing.md) |
| run network-mocking specs | `npm run test:network` — see [API & network how-to](./how-to-api-testing.md) |
| run Lighthouse + Web Vitals | `npm run test:perf` — see [Performance how-to](./how-to-performance-testing.md) |
| run the security smoke checks | `npm run test:security` |
| run all edge-case specs | `npm run test:edge-cases` |
| open the interactive UI | `npm run test:ui` |

To restrict to a single browser, append `--project=chromium` (or `firefox`, `webkit`) to any command, or use the dedicated scripts (`npm run test:chromium`, etc.).

After any run:

```bash
npm run report          # Playwright HTML — best for trace debugging
npm run allure:serve    # Allure dashboard — best for trends
```

## How to run with self-healing enabled

Healing is **off by default**. To turn it on for one run:

```bash
AI_HEALING_ENABLED=true ANTHROPIC_API_KEY=sk-ant-... npm test
```

Or, to make it persistent for your shell, add the values to `.env` and use:

```bash
npm run test:healing
```

Every heal attaches a step to the report. If you want to *only* see the demo (a single test with a deliberately broken selector), use `npm run demo:healing` — the [tutorial](./tutorial.md) walks through it end to end.

### Switch healing provider

The healer is provider-agnostic. Pick one with `AI_HEALING_PROVIDER`:

```bash
# Anthropic (default)
AI_HEALING_PROVIDER=anthropic AI_HEALING_ENABLED=true \
  ANTHROPIC_API_KEY=sk-ant-... npm test

# OpenRouter — try Claude, GPT, Gemini, Llama behind one key
AI_HEALING_PROVIDER=openrouter AI_HEALING_ENABLED=true \
  OPENROUTER_API_KEY=sk-or-... \
  AI_HEALING_MODEL=anthropic/claude-3.5-haiku npm test

# Ollama — local, free, offline-capable
ollama pull qwen2.5-coder:7b   # one-time
AI_HEALING_PROVIDER=ollama AI_HEALING_ENABLED=true \
  AI_HEALING_MODEL=qwen2.5-coder:7b npm test
```

If you're on Ollama, prefer an instruction-tuned model with at least ~8B parameters — selector healing requires reasoning over a sizable DOM, and 3B–7B models often hallucinate IDs. See the [explanation](./explanation.md#why-local-model-size-matters) for the trade-off.

## How to run the suite in Docker

For hermetic, browser-pinned runs:

```bash
docker compose build
docker compose run --rm tests                            # full suite
docker compose run --rm tests npm run test:chromium      # one browser
```

Reports mount into `./reports` and `./allure-results` so you can open them on the host afterwards.

To enable healing inside the container, forward the env vars:

```bash
AI_HEALING_ENABLED=true \
  AI_HEALING_PROVIDER=anthropic \
  ANTHROPIC_API_KEY=sk-ant-... \
  docker compose run --rm tests
```

For an Ollama-backed run that stays inside Docker, bring up the sibling service first:

```bash
docker compose --profile ollama up -d ollama
docker compose exec ollama ollama pull llama3.1:8b
AI_HEALING_ENABLED=true \
  AI_HEALING_PROVIDER=ollama \
  AI_HEALING_MODEL=llama3.1:8b \
  docker compose run --rm tests
docker compose --profile ollama down   # when finished
```

The Ollama container is a Compose **profile**, so it starts only when you ask for it. To target an Ollama instance on your host instead, set `OLLAMA_BASE_URL=http://host.docker.internal:11434`.

The Playwright image is pinned to `mcr.microsoft.com/playwright:v1.59.1-jammy`. Bump it in `Dockerfile` whenever you bump `@playwright/test` in `package.json` so the browser bundle stays in step.

## How to run the suite on mobile viewports

```bash
npm run test:mobile
```

This runs Pixel 5 + iPhone 13 viewports against `@smoke`-tagged tests only — keeping the matrix small. To run the *full* suite on mobile (rare, slower), override the grep:

```bash
npm run test:mobile -- --grep .
```

## How to detect flaky tests

Flake detection is a separate workflow with its own dedicated guide. See **[STABILITY.md](../STABILITY.md)** — it covers running a stability sweep, reading the report, the triage workflow, and quarantining a confirmed flake.

The TL;DR:

```bash
npm run test:stability:smoke    # ~3–5 min, @smoke × 20
npm run test:stability          # ~20–40 min, full suite × 10
npm run test:stability:report   # print the latest report
```

## How to enable healing in CI

1. Add `ANTHROPIC_API_KEY` to repo secrets (GitHub → Settings → Secrets and variables → Actions).
2. In `.github/workflows/playwright.yml`, set `AI_HEALING_ENABLED: 'true'` on the test job's `env:` block.
3. (Optional) Set `AI_HEALING_MAX_PER_RUN` to a tighter budget if you want to cap CI spend.

The merged Allure report is automatically published to GitHub Pages on push to `main` — enable Pages → Source: `gh-pages` branch the first time. Reviewers can browse the latest results without cloning.

## How to bypass the pre-commit hook

`husky` + `lint-staged` gate every commit on a fast lint pass:

- `*.ts` → `eslint --fix`, then `tsc --noEmit`
- `*.{json,md,yml,yaml}` → `prettier --write`

Hooks install automatically via the `prepare` script on `npm install`. To bypass for a single commit (rare — prefer fixing the issue):

```bash
git commit --no-verify
```

## Troubleshooting

- **`npx playwright install` is slow or fails behind a proxy** — set `HTTPS_PROXY` and `PLAYWRIGHT_DOWNLOAD_HOST` per the [Playwright docs](https://playwright.dev/docs/browsers#install-behind-a-firewall-or-a-proxy).
- **WebKit fails on Linux without system deps** — use `--with-deps` on `npx playwright install`, or run inside the Docker image.
- **Healing returns junk JSON** — bump the model: `AI_HEALING_MODEL=claude-sonnet-4-6 npm run test:healing`. Small local models are the most common offender (see [explanation.md](./explanation.md#why-local-model-size-matters)).
- **Test data missing** — `npm run pretest` regenerates the upload fixtures. It auto-runs before `npm test`.
- **Allure report empty** — ensure `allure-results/` is non-empty (it gets cleaned by `allure:generate`). Use `npm run allure:serve` to regenerate from raw results.
