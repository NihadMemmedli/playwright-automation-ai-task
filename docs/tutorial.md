# Tutorial: Watch the AI heal a broken selector

This tutorial walks you from a fresh checkout to seeing the framework's self-healing layer in action — Claude inspecting a deliberately broken locator, suggesting a fix, and the test passing as a result. It takes about 10 minutes and assumes only that you have Node.js installed.

By the end you will have:

1. A running test suite on your machine.
2. An Anthropic API key wired into the framework.
3. A demo run where you see a click fail on a broken selector, a healing step appear in the report, and the test recover.

You don't need to understand *how* the healer works to follow along — that's covered in [explanation.md](./explanation.md). For now, just follow the steps.

---

## Step 1 — Install the framework

Clone the repo and install dependencies:

```bash
git clone <your-fork-url>
cd playwright-qa-framework
npm ci
npx playwright install --with-deps
```

The `pretest` lifecycle hook will generate the upload fixtures (`sample.txt`, `sample.pdf`, `large-file.bin`) on first run — you don't need to create them by hand.

## Step 2 — Run the suite once, healing-off

Before introducing the healer, confirm the suite passes as-is:

```bash
npm run test:smoke
```

You should see three green tests on Chromium. This is your baseline. Open the HTML report to look around:

```bash
npm run report
```

Notice that there are no "AI Healing" steps in the report. Healing is opt-in — it is not running yet.

## Step 3 — Add an Anthropic API key

The healing demo calls Claude. You need a key:

```bash
cp .env.example .env
```

Get a key at <https://console.anthropic.com>, then edit `.env`:

```dotenv
ANTHROPIC_API_KEY=sk-ant-...
```

The default model (`claude-haiku-4-5-20251001`) is fast and costs roughly a fraction of a cent per heal — you will not spend more than a few cents during this tutorial.

## Step 4 — Run the healing demo

```bash
npm run demo:healing
```

A Chromium window opens (the demo runs **headed** so you can see what's happening). Watch the login flow:

1. The test fills the email and password.
2. It clicks `#submitLoginBtnBROKEN` — a deliberately broken selector that does not exist on the page.
3. The click fails. **You see a brief pause.**
4. The test recovers and the login completes.

The pause is the healer running. It captured the DOM, asked Claude "what selector matches the *login submit button* now?", got back `#submitLoginBtn`, retried the click, and continued.

## Step 5 — Inspect the report

Open the HTML report:

```bash
npm run report
```

Drill into the `healing-demo` test. You will see a new step that wasn't there in step 2:

> **AI Healing: login submit button (click)**

Expand it. Attached you'll find `healing-login submit button-success.json` — Claude's reply, with the healed selector, a confidence score, and a one-line reasoning. Click through and read it.

This is the contract: **every heal is a step in the report, with the AI's reasoning attached.** Healing is never silent.

## Step 6 — See the cache at work

Run the demo a second time:

```bash
npm run demo:healing
```

This run is faster — the healer hits its local cache (`.healing-cache.json`) instead of calling the API. Open the file and you'll see the cached entry keyed by `{path, intent, originalSelector}`.

Cached heals are free. Commit `.healing-cache.json` if you want your team to share heals; leave it gitignored (the default) to keep heals per-developer.

---

## What you have done

You ran the suite, enabled the healer with one env var, watched a broken selector get repaired live, and saw the report record the heal as an explicit step.

## Where to go next

- **To run the suite in different shapes** (Docker, CI, AI healing on the full suite, mobile viewports), see [how-to.md](./how-to.md).
- **To understand why the healer is structured this way** (opt-in, budget-capped, never silent), see [explanation.md](./explanation.md#the-self-healing-layer).
- **To check the catalogue of npm scripts and env vars**, see [reference.md](./reference.md).
