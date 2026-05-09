# Explanation

The reasoning behind the framework's design. This document is *discursive* — it discusses trade-offs and history rather than telling you what to do or listing facts. For instructions, see [how-to.md](./how-to.md); for facts, see [reference.md](./reference.md).

---

## Why this framework exists

The brief asked for an end-to-end automation suite covering two flows on `qa-practice.netlify.app`. A flat answer is straightforward: write the specs, run them, hand them in. What makes the framework interesting is the questions it tries to answer **beyond** the brief:

- How does a suite stay maintainable when selectors drift?
- How do you tell a real failure apart from a flake without retrying past the signal?
- How do you keep CI fast without losing coverage?
- How do you onboard a reviewer in five minutes without burying them in 300 lines of README?

The decisions below all stem from those questions.

---

## Design decisions

### Page Object Model with a thin `BasePage.$()`

Every locator goes through one wrapper:

```ts
private get submitButton() {
  return this.$('login submit button', '#submitLoginBtn');
}
```

The first argument is a **plain-English intent** — what the element is *for*. The second is the original CSS / role selector. Routing all locators through `this.$()` means cross-cutting concerns (logging, retries, self-healing) plug in once, in the wrapper, instead of leaking into every spec. It also gives the healer a stable description of the element when the selector breaks; without intent, all the healer has is a CSS string and no context for what it should match.

The trade-off: every page object author has to write the intent. That's friction. But the alternative — bolting a healing system onto raw selectors — produces a worse healer and a worse abstraction.

### Self-healing is opt-in, never silent

Healing is disabled by default and requires two explicit choices to turn on (`AI_HEALING_ENABLED=true` *and* a provider credential). This is deliberate. An always-on AI layer in a test framework has a failure mode worse than flakiness: it can make a broken test pass by quietly papering over real product bugs. A test that "works" because the AI invented a clever new selector is no longer telling you what your product does.

Three rails enforce the principle:

1. **Off by default.** No accidental spend, no accidental dependency on Anthropic during evaluation runs.
2. **Budget caps.** `AI_HEALING_MAX_PER_TEST=3` and `AI_HEALING_MAX_PER_RUN=10`. A genuinely broken page won't burn money in a runaway loop.
3. **Failed heals surface the original error.** If the AI's proposed selector also fails, the framework reports the *original* failure — not the AI's. The healer can never falsely green a test.

Every successful heal is also recorded as a step in the report with the AI's reasoning attached as JSON. Reviewers can see exactly which selectors were repaired and why. The audit trail matters more than the heal itself.

### Tags over folders

Tests are sliced by `@smoke` / `@critical` / `@regression` / `@a11y` rather than by `tests/smoke/`, `tests/critical/`, etc.

The reason is composability. A folder structure forces you to pick *one* axis to slice on. A tagging system lets a test be both "a smoke test" *and* "an a11y test" without copying the file. CI can pick by intent (`--grep @smoke`) without restructuring.

The cost is discipline: tag drift is real, and a test without tags falls through every gate. The framework treats untagged tests as a smell — they don't get run by any of the named slices, only by full `npm test`.

### Mobile = `@smoke`-only by default

Adding Pixel 5 + iPhone 13 to the project list without a tag filter would 5× the matrix (3 desktop browsers + 2 mobile = 5) on every test. That's a lot of CI time spent re-confirming what desktop already proved.

Mobile coverage exists to catch responsive risk: the layout breaking, a button vanishing, touch targets disappearing. Smoke tests cover those concerns. Edge-case tests (invalid login error positioning, exact filename echo) don't add mobile-specific signal — they'd just inflate runtimes.

If you ever want a full mobile run: `npm run test:mobile -- --grep .` overrides the tag filter.

### Accessibility triage is nuanced, not binary

A naive a11y gate fails the build on any axe violation. That's noise — many violations on third-party pages are colour-contrast issues you can't fix because you don't own the stylesheet, and treating them as blockers trains the team to ignore the report.

This framework picks a middle path:

- **Hard-fail on `critical`-impact violations** (missing labels, no skip-link, blocking modals).
- **Attach all violations as JSON** to the test report — so the team gets a triage list even when the test is green.

That gives a senior QA the right artefact: a forced gate on the worst, plus a backlog for everything else. Tightening to also fail on `serious` is a one-line change (`IMPACT_FAIL_THRESHOLD` in `accessibility.spec.ts`) — but the *default* favours signal-to-noise.

### Two reporters, on purpose

HTML and Allure aren't redundant. They serve different reading habits:

- **Playwright HTML report**: best for fast local debugging. One click takes you to a trace; the trace timeline is the most efficient debugger you'll ever use.
- **Allure**: best for trends. Per-test history, suite-level pass-rate over time, an aggregate dashboard suitable for embedding in a team's CI status page. The merged Allure dashboard is auto-published to GitHub Pages on push to `main`.

Carrying both costs ~30 seconds per CI run for the merge step. Worth it.

---

## The self-healing layer

The healer wraps every locator. Conceptually:

```
spec → BasePage.$() → SelfHealingLocator
                          │
                          ├── Playwright Locator (fast path)
                          │
                          └── (on action failure, opt-in only)
                              ↓
                          DOM snapshot + intent + original selector
                              ↓
                          local cache lookup
                              ↓ miss
                          LLM healer (Claude / OpenRouter / Ollama)
                              ↓
                          { selector, strategy, confidence, reasoning }
                              ↓
                          retry action with healed selector
                              ↓
                          attach HealingEvent step + cache result
```

### Why an "intent" string

LLM healers fed only `#submitLoginBtn` and a chunk of DOM frequently propose plausible-but-wrong selectors — a button labelled "Submit" elsewhere on the page, a submit on the wrong form. Intent (`"login submit button"`) gives the model a stable description to anchor on, independent of the broken selector. It dramatically reduces the rate of confidently wrong heals.

### Why a local cache

Without a cache, every CI run pays for every heal. With a cache keyed by `{path, intent, originalSelector}`, the second run hits zero API calls if nothing has changed. `.healing-cache.json` is gitignored by default so individual developers' caches don't conflict, but committing it is a deliberate design point — a team that wants shared heals can opt in.

### Why local model size matters

Selector healing requires reading and reasoning over a sizable DOM (often hundreds of nodes). Anthropic's Haiku and Sonnet handle this comfortably. Local models below ~8B parameters frequently:

- Echo back the prompt instead of producing a selector.
- Hallucinate IDs that don't exist on the page.
- Pick a plausible-looking selector from the wrong section.

The framework does not silently downgrade the demo to a smaller model on `npm run demo:healing` — if you've configured Ollama with a tiny model, the demo will fail honestly. For reliable local healing, use `llama3.1:8b`, `qwen2.5:14b`, or `mistral-nemo:12b` at minimum.

### Why Ollama uses the native API instead of OpenAI compatibility

Ollama exposes both an OpenAI-compatible REST endpoint and its own `/api/chat`. The OpenAI-compatible shim mishandles `response_format: json_object` for many small models — they ignore the format hint and echo prompts back as text. The native endpoint accepts `format: "json"` and produces structured output reliably. The framework picks the boring-but-working option.

---

## Test stability philosophy

Most teams treat retries as a stability fix. They aren't — retries change one thing (whether the build is red) without changing whether the test is reliable. The detailed argument and the workflow for handling flakes lives in **[STABILITY.md](../STABILITY.md#why-this-exists)**. The short version:

> Surface flakes, don't retry past them.

The framework keeps `retries: 2` on the PR gate so infrastructure blips don't block merges, and keeps the stability sweep as a *separate* signal that runs nightly with retries disabled. Two different jobs answering two different questions: "did this PR break anything?" vs "is the suite trustworthy?"

---

## What's deliberately not here

A few things that often appear in test frameworks but were left out on purpose:

- **A custom assertion library.** Playwright's web-first assertions (`expect(locator).toBeVisible()` etc.) are already retry-aware and produce excellent error messages. Wrapping them is noise.
- **A test data abstraction layer.** The brief uses a public demo site with fixed credentials and no API. There's no tenancy to manage, no factories worth writing.
- **A reporter that posts to Slack.** This is a code challenge, not a deployed pipeline. The hooks exist (Allure → GH Pages, artefacts on every run) but the actual notification target is environment-specific and best left to whoever adopts it.

The principle: ship what the brief needs plus the production-readiness layers a senior reviewer would expect to see (CI, Docker, a11y, stability, AI healing as a differentiator). Skip what's speculative.
