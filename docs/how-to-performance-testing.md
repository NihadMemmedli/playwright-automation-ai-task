# How to run performance tests

Task-oriented guide for the performance slice. For the full script catalogue, see [reference.md](./reference.md).

---

## What's in this slice

| Spec | Tool | What it measures |
|---|---|---|
| `tests/performance/lighthouse.spec.ts` | [`playwright-lighthouse`](https://www.npmjs.com/package/playwright-lighthouse) | Full Lighthouse audit per page (performance, a11y, best-practices, SEO). |
| `tests/performance/web-vitals.spec.ts` | `PerformanceObserver` (no extra dep) | LCP, CLS, FCP, DCL, load-event timings. |

Performance specs are tagged `@perf` and **excluded from the default desktop projects** (`grepInvert: /@perf/` in [`playwright.config.ts`](../playwright.config.ts)). They run only via the dedicated `performance` project.

## Running them

```bash
npm run test:perf                    # all @perf specs, Chromium, single worker
LIGHTHOUSE_PORT=9333 npm run test:perf   # override the debug port
```

The script enforces `--workers=1` because Lighthouse attaches to a fixed Chrome remote-debugging port and parallel workers would collide on it.

## Tuning thresholds

Defaults are deliberately lenient (the demo target is a free-tier static host that jitters under shared CI runners). Override per-page in the spec, or globally via env vars:

| Variable | Default | Lighthouse category |
|---|---|---|
| `LH_THRESHOLD_PERF` | `50` | performance |
| `LH_THRESHOLD_A11Y` | `80` | accessibility |
| `LH_THRESHOLD_BP` | `70` | best-practices |
| `LH_THRESHOLD_SEO` | `70` | seo |
| `LH_THRESHOLD_PWA` | _(unset)_ | pwa — disabled by default (Lighthouse ≥ 12 removed the PWA category) |
| `WV_LCP_MS` | `8000` | Web Vitals: LCP budget (ms) |
| `WV_CLS` | `0.5` | Web Vitals: CLS budget |
| `WV_DCL_MS` | `6000` | Web Vitals: DOMContentLoaded budget (ms) |

Per-spec override:

```ts
await audit({
  page,
  thresholds: { performance: 80, accessibility: 95 },
});
```

## Reading the output

Lighthouse writes per-test JSON + HTML reports under `reports/lighthouse/`. Web Vitals attaches its measurements to the test record (visible in Allure / Playwright HTML reports under "Attachments").

In CI, the `performance` job (see [`.github/workflows/playwright.yml`](../.github/workflows/playwright.yml)) uploads `reports/lighthouse/` as a build artifact for download.

## Why `@perf` doesn't gate PRs

Lighthouse takes ~30s per page on a clean run and is noisy on shared runners — gating PRs on a 4-page audit would create roughly one false-red per week per developer. The current CI design promotes performance to its own job that runs only on push to `main` and on manual `workflow_dispatch`, so a regression surfaces quickly without blocking unrelated changes.

If/when the budgets stabilize, promote `@perf` into the PR gate by adding it to the smoke `--grep` filter in `.github/workflows/playwright.yml`.

## Troubleshooting

- **`Error: ECONNREFUSED 127.0.0.1:9222`** — another Chrome process is holding the debug port. Kill it (`pkill -f remote-debugging-port`) or set `LIGHTHOUSE_PORT` to a free port.
- **Lighthouse score swings ±10 between runs** — expected on shared CI runners. Tighten thresholds only after collecting at least 5 stable runs.
- **`fullyParallel: false` slows local runs** — by design. Lighthouse can only attach to one debug port at a time. Use `npm run test:smoke` while iterating, then run perf separately.
