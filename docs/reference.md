# Reference

Authoritative facts about the framework. Sections are self-contained: jump to the one you need. For step-by-step instructions on *using* these, see [how-to.md](./how-to.md). For the rationale, see [explanation.md](./explanation.md).

---

## npm scripts

### Test execution

| Script | Effect |
|---|---|
| `npm test` | Full suite, all three browsers, list + HTML + Allure reporters. |
| `npm run test:chromium` | Full suite, Chromium only. |
| `npm run test:firefox` | Full suite, Firefox only. |
| `npm run test:webkit` | Full suite, WebKit only. |
| `npm run test:headed` | Full suite, browser window visible. |
| `npm run test:ui` | Playwright's interactive UI mode. |
| `npm run test:debug` | Debug mode (`PWDEBUG=1`). |
| `npm run test:auth` | E-commerce specs only (`auth-ecommerce`, `auth-edge-cases`). |
| `npm run test:upload` | File-upload specs only. |
| `npm run test:smoke` | `@smoke`-tagged tests only. |
| `npm run test:critical` | `@critical`-tagged tests only. |
| `npm run test:regression` | `@regression`-tagged tests only. |
| `npm run test:a11y` | Accessibility specs only. |
| `npm run test:api` | `tests/api/` only, Chromium. Direct HTTP + captured-traffic specs. |
| `npm run test:network` | `tests/network/` only, Chromium. Route-mocking + offline specs. |
| `npm run test:perf` | `@perf`-tagged specs (Lighthouse + Web Vitals), Chromium, single worker. |
| `npm run test:edge-cases` | Cart / checkout / session / file-upload edge-case specs. |
| `npm run test:security` | Security-smoke specs (XSS / SQLi). |
| `npm run test:mobile` | Pixel 5 + iPhone 13 projects (`@smoke` only by default). |

### Self-healing

| Script | Effect |
|---|---|
| `npm run test:healing` | Full suite with `AI_HEALING_ENABLED=true`. Requires `ANTHROPIC_API_KEY`. |
| `npm run demo:healing` | Healing demo, headed, Chromium. Runs the deliberately broken-selector spec. |

### Stability

| Script | Effect | Default N |
|---|---|---|
| `npm run test:stability` | Full suite × N, retries disabled, Chromium. | 10 |
| `npm run test:stability:smoke` | `@smoke` × N, retries disabled, Chromium. | 20 |
| `npm run test:stability:report` | Print the latest stability markdown summary. | — |

### Reporting

| Script | Effect |
|---|---|
| `npm run report` | Open the Playwright HTML report from the last run. |
| `npm run allure:generate` | Build the Allure dashboard into `reports/allure/`. |
| `npm run allure:open` | Open the generated Allure dashboard. |
| `npm run allure:serve` | Generate and serve the Allure dashboard on a local port. |

### Lifecycle

| Script | Effect |
|---|---|
| `npm run pretest` | Generate upload fixtures (`sample.txt`, `sample.pdf`, `large-file.bin`). Auto-runs before `npm test`. |
| `npm run lint` | Run ESLint. |
| `npm run format` | Format `.ts`/`.json`/`.md` with Prettier. |
| `npm run docker:build` | Build the Playwright Docker image. |
| `npm run docker:test` | Run the suite inside Docker. |

---

## Environment variables

All variables also documented inline in `.env.example`.

### Core

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://qa-practice.netlify.app` | Base URL of the system under test. |
| `LOG_LEVEL` | `info` | One of `debug`, `info`, `warn`, `error`. |

### Self-healing

| Variable | Default | Purpose |
|---|---|---|
| `AI_HEALING_ENABLED` | `false` | Master switch. Healing only runs when this is `true` **and** the provider's credentials are set. |
| `AI_HEALING_PROVIDER` | `anthropic` | One of `anthropic`, `openrouter`, `ollama`. |
| `AI_HEALING_MODEL` | `claude-haiku-4-5-20251001` | Model identifier — meaning depends on provider. |
| `AI_HEALING_MAX_PER_TEST` | `3` | Hard cap on heal calls per test. |
| `AI_HEALING_MAX_PER_RUN` | `10` | Hard cap on heal calls per overall test run. |
| `ANTHROPIC_API_KEY` | _(unset)_ | Required when provider is `anthropic`. |
| `OPENROUTER_API_KEY` | _(unset)_ | Required when provider is `openrouter`. |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama daemon URL. Used when provider is `ollama`. |

### Stability

| Variable | Default | Purpose |
|---|---|---|
| `STABILITY_THRESHOLD` | `0` | Max acceptable per-test flake rate. `0` fails on any flake; `0.05` allows up to 5%. |
| `HEALING_DEMO` | _(unset)_ | Internal flag set by `npm run demo:healing` to un-skip the demo spec. |

### Performance

| Variable | Default | Purpose |
|---|---|---|
| `LIGHTHOUSE_PORT` | `9222` | Chromium remote-debugging port for `playwright-lighthouse`. Override if 9222 is busy. |
| `LH_THRESHOLD_PERF` | `50` | Lighthouse performance score floor. |
| `LH_THRESHOLD_A11Y` | `80` | Lighthouse accessibility score floor. |
| `LH_THRESHOLD_BP` | `70` | Lighthouse best-practices score floor. |
| `LH_THRESHOLD_SEO` | `70` | Lighthouse SEO score floor. |
| `LH_THRESHOLD_PWA` | _(unset)_ | Lighthouse PWA score floor. **Off by default** — Lighthouse ≥ 12 removed the PWA category and rejects it as an unknown category. Set this only if you've pinned an older Lighthouse. |
| `WV_LCP_MS` | `8000` | Web Vitals LCP budget (ms). |
| `WV_CLS` | `0.5` | Web Vitals CLS budget (cumulative layout shift score). |
| `WV_DCL_MS` | `6000` | Web Vitals DOMContentLoaded budget (ms). |

---

## Tags

Tests are sliced by `@tag` annotations, not by folder. The slice that runs in CI is decided per workflow; locally, use the matching npm script.

| Tag | What it covers | When CI runs it |
|---|---|---|
| `@smoke` | Login happy path, text-file upload — fastest validation. | Every PR (Chromium + Mobile Chrome). |
| `@critical` | Full order checkout, invalid login, large-file upload, cart removal, login a11y. | Pre-release / push to `main`. |
| `@regression` | Edge cases, secondary upload formats, HTML5 validation. | Full nightly. |
| `@a11y` | WCAG 2.1 A + AA scans on the four key pages. | Push to `main`. |
| `@api` | Direct HTTP + captured network traffic from real flows. | Every PR (folded into smoke gate). |
| `@network` | Route-mocking, slow-network, offline simulation. | Every PR (folded into smoke gate). |
| `@perf` | Lighthouse audits + Core Web Vitals. **Excluded from default projects** — runs only via `npm run test:perf` or the dedicated CI job. | Push to `main` and `workflow_dispatch`. |
| `@security` | Lightweight XSS / SQLi smoke checks against form inputs. | Push to `main`. |

---

## Test coverage

| Spec | Scenarios |
|---|---|
| `tests/e2e/auth-ecommerce.spec.ts` | Login → add 2 products → verify cart total → checkout → ship → submit order → logout. |
| `tests/e2e/auth-edge-cases.spec.ts` | Invalid password, unknown email, empty-field HTML5 validation (×2), cart-item removal updates total, logout invalidates session. |
| `tests/e2e/file-upload.spec.ts` | Upload `.txt`, upload `.pdf`, upload ~5 MB binary, submit-without-file, exact filename in response. |
| `tests/e2e/accessibility.spec.ts` | WCAG 2.1 A + AA scans on login, shop (post-login), checkout shipping form, file upload. |
| `tests/e2e/cart-edge-cases.spec.ts` | Same product twice, sum-of-prices invariant, remove-all-items, empty-cart checkout. |
| `tests/e2e/checkout-edge-cases.spec.ts` | Country select changes, special chars round-trip, free-form phone, missing required fields. |
| `tests/e2e/session-edge-cases.spec.ts` | Refresh drops in-memory session, direct-URL access, two-tab session isolation. |
| `tests/e2e/file-upload-edge-cases.spec.ts` | 200+ char filenames, unicode filenames, zero-byte file, second-select replaces first. |
| `tests/e2e/security-smoke.spec.ts` | XSS in email, SQLi in password, no email reflection in DOM. |
| `tests/api/auth-api.spec.ts` | Direct HTTP to login page, bad-cred POST behavior, session-state diff before/after logout. |
| `tests/api/order-api.spec.ts` | File-upload page reachable, multipart POST status, captured order-submission traffic. |
| `tests/network/error-handling.spec.ts` | 500 on assets, slow network throttling, offline mid-flow. |
| `tests/performance/lighthouse.spec.ts` | Lighthouse audits on login / shop / checkout / file-upload pages. |
| `tests/performance/web-vitals.spec.ts` | LCP / CLS / DCL on login + file-upload pages. |

All E2E specs run on Chromium, Firefox, and WebKit. Mobile projects (Pixel 5, iPhone 13) run `@smoke`-tagged tests only by default.

---

## Project structure

```
playwright-qa-framework/
├── src/
│   ├── pages/                Page object models (Base, Login, Shop, Checkout, FileUpload).
│   ├── api/                  ApiClient — thin wrapper over Playwright APIRequestContext.
│   ├── healing/              Self-healing layer: locator wrapper, healer clients, cache, DOM snapshotter.
│   ├── reporters/            Custom Playwright reporters (StabilityReporter).
│   ├── utils/                Logger.
│   └── config/               Zod-validated env parsing.
├── tests/
│   ├── e2e/                  Specs: auth happy path, auth + cart + checkout + session + upload edge cases, accessibility, security smoke, healing demo.
│   ├── api/                  Specs: direct HTTP + captured-traffic.
│   ├── network/              Specs: route mocking, slow network, offline.
│   ├── performance/          Specs: Lighthouse audits + Web Vitals.
│   └── fixtures/             Custom Playwright fixtures (POMs, apiClient, lighthouse audit).
├── test-data/                Generated upload fixtures (large blob is gitignored).
├── scripts/                  Test data generator.
├── reports/                  HTML, Allure, stability outputs (gitignored).
├── docs/                     Documentation (this directory).
├── playwright.config.ts      Reporters, projects, timeouts.
├── Dockerfile                Pinned to `mcr.microsoft.com/playwright:v1.59.1-jammy`.
├── docker-compose.yml        Volume-mounted reports; optional Ollama profile.
└── .github/workflows/        CI: matrix on Chromium/Firefox/WebKit + combined Allure + nightly stability.
```

---

## Healing providers

| Provider | When to use | Required env |
|---|---|---|
| `anthropic` (default) | Best quality, prompt caching, paid. | `ANTHROPIC_API_KEY`, `AI_HEALING_MODEL` (e.g. `claude-haiku-4-5-20251001`). |
| `openrouter` | Try many models behind one key (Claude, GPT, Gemini, Llama, …); cost tuning. | `OPENROUTER_API_KEY`, `AI_HEALING_MODEL` (e.g. `anthropic/claude-3.5-haiku`, `meta-llama/llama-3.3-70b-instruct`). |
| `ollama` | Local, free, offline / air-gapped CI. Sensitive DOM data stays on the box. | `OLLAMA_BASE_URL`, `AI_HEALING_MODEL` (e.g. `qwen2.5-coder:7b`); model must be pulled first with `ollama pull <model>`. |

Implementation notes:

- OpenRouter uses the OpenAI-compatible adapter (`OpenAICompatibleHealer`) with `response_format: json_object`.
- Ollama uses its native `/api/chat` endpoint with `format: "json"` (`OllamaHealer`). Ollama's OpenAI-compatibility shim mishandles `response_format` — small models echo the prompt back instead of generating a selector — so the framework goes through the native API.

---

## Stability report

For the JSON schema, exit codes, CLI flags and triage workflow, see **[STABILITY.md](../STABILITY.md)** — that document is the authoritative reference for the stability subsystem.
