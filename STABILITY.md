# Test Stability

> A flake is a test that fails intermittently without any code change. Retrying past it doesn't make it stable — it makes it invisible. This document explains how the framework surfaces flakes instead of hiding them, and what to do when you find one.

This is a single, focused document because flake detection is one connected workflow: you need to understand the principle to use the tool, you need the tool to triage, and you need the reference to script around it. Read it top-to-bottom the first time; jump to a section thereafter.

| Section | Doc type | When to read |
|---|---|---|
| [Why this exists](#why-this-exists) | Explanation | First time, or when arguing the case to a sceptical team. |
| [Run a stability check](#run-a-stability-check) | How-to | When something feels flaky. |
| [Reference](#reference) | Reference | Looking up a flag, env var, or schema. |
| [Triage workflow](#triage-workflow) | How-to | When a stability run flags a flake and you need to act. |
| [CI](#ci) | How-to | Setting up or interpreting the nightly job. |
| [Why not `failOnFlakyTests`?](#why-not-failonflakytests) | Explanation | Wondering why the obvious-looking config option isn't enabled. |

For everything else (running tests, AI healing, Docker, CI), see [docs/](./docs/README.md).

---

## Why this exists

Most teams treat test retries as a stability fix. They aren't. Retries change one thing — whether the build is red — without changing whether the test is reliable. The cost shows up later:

- **False confidence on PRs.** A test that passes on retry 2/3 is shipped as "green," but the underlying race or timing bug is still there. It will fail in a less convenient place — production, a demo, an incident.
- **Eroded trust.** Once a team knows "tests are sometimes flaky," every red run gets re-run instead of investigated. Real failures hide in the noise.
- **No baseline.** Without measurement, you can't tell whether a fix made the suite more stable or whether you got lucky on the next 10 runs.

This framework's stance, mirroring the README's self-healing principle ("opt-in, never silent"):

> **Surface flakes, don't retry past them.**

The stability check is the explicit tool for that. It runs each test N times with **retries disabled**, so every observation is independent, and reports the per-test failure rate. A test that passes 10/10 is stable. A test that passes 9/10 is **not** stable — it's a 10% flake that hasn't bitten you yet.

The default PR gate (`playwright.yml`) keeps `retries: 2` so infra blips don't block merges. The stability check is the *separate* signal you run before sending the framework to a team, before a release, or any time a test "feels flaky."

---

## Run a stability check

### Quick smoke check (~3–5 min)

Repeats the `@smoke` suite 20 times. Use this before a PR if a smoke test feels off.

```bash
npm run test:stability:smoke
npm run test:stability:report   # prints the markdown summary
```

### Full suite stability check (~20–40 min)

Repeats every spec 10 times on Chromium. Use this when shipping the framework, after a meaningful refactor, or weekly.

```bash
npm run test:stability
open reports/stability/stability-report.md
```

### Investigate one spec hard

If you suspect a specific spec, isolate and crank up N:

```bash
npx playwright test file-upload \
  --repeat-each=50 \
  --retries=0 \
  --reporter=list,./src/reporters/StabilityReporter.ts \
  --project=chromium
```

50 runs of one spec is usually enough to confirm or rule out a flake at ≥5% rate.

### Read the report

Two artifacts land in `reports/stability/`:

- **`stability-report.md`** — human, sorted by flake rate desc. Open in a viewer or `cat` it.
- **`stability-report.json`** — machine, one entry per test with `runs`, `passed`, `failed`, `flakeRate`, `p50`/`p95` durations, and de-duplicated failure messages.

Top of the markdown is a Summary table with the verdict (✅ Stable / ❌ Flaky tests detected). Below it, a "Flaky tests" table sorted worst-first, then a collapsible "Stable tests" section.

### Quarantine a confirmed flaky test

When you've reproduced a flake but can't fix it immediately, quarantine it so the suite stays meaningful:

```ts
test.fixme('intermittent: shop add-to-cart toast race — see #142', async ({ shopPage }) => {
  // ...
});
```

`test.fixme` makes the test show up as expected-skipped (visible in reports) but doesn't fail the build. Always link to a tracking issue — a quarantined test without an owner becomes permanent.

---

## Reference

### npm scripts

| Script | What it does | Default N |
|---|---|---|
| `npm run test:stability` | Full suite, Chromium, with HTML report retained | 10 |
| `npm run test:stability:smoke` | `@smoke` only, fast triage | 20 |
| `npm run test:stability:report` | Print the latest markdown summary | — |

### CLI flags worth knowing

| Flag | Purpose |
|---|---|
| `--repeat-each=N` | Run each test N times. Stability scripts pass this; override on CLI. |
| `--retries=0` | Critical — retries mask flakes. Always 0 for stability runs. |
| `--reporter=list,./src/reporters/StabilityReporter.ts` | Console + the stability writer. Add `,html` to also retain traces. |
| `--grep @smoke` | Restrict to a tag. Combine with `--repeat-each` for targeted runs. |
| `--project=chromium` | Single browser. Stability is per-browser; cross-browser flakes need separate runs. |

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `STABILITY_THRESHOLD` | `0` | Max acceptable per-test flake rate (0 = any flake fails). Set to `0.05` to allow up to 5%. |

### Exit codes

| Code | Meaning |
|---|---|
| `0` | All tests at or below `STABILITY_THRESHOLD`. Suite is stable for this run. |
| `1` | At least one test exceeded the threshold. Report names which. |

### JSON report schema

```ts
{
  generatedAt: string;       // ISO timestamp
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  totalTests: number;        // distinct tests observed
  totalRuns: number;         // sum of repeats
  totalPassed: number;
  totalFailed: number;
  overallFlakeRate: number;  // 0..1
  threshold: number;         // 0..1
  exitCode: 0 | 1;
  tests: Array<{
    id: string;
    title: string;
    file: string;
    project: string;
    runs: number;
    passed: number;
    failed: number;
    timedOut: number;
    skipped: number;
    flakeRate: number;       // failed / (passed + failed)
    p50: number;             // ms
    p95: number;             // ms
    durations: number[];     // ms, all runs
    failures: string[];      // first-line of each error, max 200 chars
  }>;
}
```

---

## Triage workflow

When a flake is reported (locally, or by the nightly CI job), follow this loop:

1. **Reproduce.** Don't trust a one-off. Re-run with high N to confirm a real flake rate:
   ```bash
   npx playwright test <spec-name> --repeat-each=50 --retries=0 \
     --reporter=list,./src/reporters/StabilityReporter.ts --project=chromium
   ```
   - Reproduces: confirmed flake. Continue.
   - Doesn't reproduce after 50 runs: file the symptoms (browser, version, env), but don't quarantine yet — it may be infra.

2. **Categorize the root cause** by reading the failure samples and the trace (`reports/html`):

   | Category | Telltale sign | Common fix |
   |---|---|---|
   | **Timing race** | Element-not-attached, click-on-detached, "expected text X, got Y" | Replace polling sleeps with `expect(locator).toBeVisible()` / `toHaveText()`. Use `waitFor({ state: 'attached' })` only for genuine async DOM. |
   | **Order dependency** | Fails only when run after another test | Inspect shared state — cookies, localStorage, fixture leakage. Use isolated `storageState`. |
   | **Network** | Timeout on a third-party request, intermittent 5xx | Mock the boundary with `page.route()`. Don't rely on third-party uptime in critical-path tests. |
   | **Locator drift** | Element-not-found that resolves on retry because DOM re-renders | Tighten selectors (prefer `data-testid`, role + accessible name). The self-healing layer is a *safety net*, not a substitute. |
   | **Animation / transition** | Click registers but action doesn't fire | Disable animations in the test (`page.addStyleTag`) or wait for the transition's end state, not a fixed delay. |

3. **Fix or quarantine.**
   - Fix preferred: it's almost always cheaper than the long-tail cost of a quarantined test.
   - Quarantine with `test.fixme` only if blocked by an external dependency, with a linked issue.

4. **Re-verify.** Run the same `--repeat-each=50` after the fix. Don't merge until the stability report shows 0% for that test across at least 50 runs.

5. **Land it.** Reference the stability report run in the PR description. The reviewer should see the before/after numbers, not just the diff.

---

## CI

A scheduled GitHub Actions workflow (`.github/workflows/stability.yml`) runs `npm run test:stability` nightly at 03:00 UTC and uploads the `stability-report` artifact for 30 days. PRs are not gated on this — the goal is to catch slow-burn flakes that only surface in CI conditions, without blocking merges on infra noise.

To trigger an ad-hoc CI run: GitHub → Actions → "Stability (nightly)" → Run workflow.

---

## Why not `failOnFlakyTests`?

Playwright supports a `failOnFlakyTests` config option that fails the run if any test passes only after retry. We deliberately did **not** enable it on the PR gate. Reasons:

- The PR gate keeps `retries: 2` to absorb infra noise. Combining `retries: 2` with `failOnFlakyTests` makes any infra blip a hard fail — that's the noise we explicitly didn't want.
- Stability is best measured by *repeating* a test, not by *one retry*. A test that fails once and passes once tells you almost nothing; a test that fails 1/20 tells you it's a 5% flake.

The nightly stability check + manual triage is the chosen tradeoff. If your team prefers strictness, flip `failOnFlakyTests: true` in `playwright.config.ts` — it composes cleanly with the rest of the framework.
