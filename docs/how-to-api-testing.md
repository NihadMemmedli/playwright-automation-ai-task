# How to run API & network tests

Task-oriented guide for the API/network slice of the suite. For the full script catalogue, see [reference.md](./reference.md).

---

## What's in this slice

The API/network slice has two complementary layers:

| Slice | Mechanism | Lives in |
|---|---|---|
| **Direct HTTP** | Playwright's `APIRequestContext` — fires HTTP calls without a browser. | `tests/api/*.spec.ts` |
| **In-browser network** | `page.on('request' \| 'response')` to capture traffic + `page.route()` to intercept and inject faults. | `tests/api/*.spec.ts`, `tests/network/*.spec.ts` |

Both layers exist because [qa-practice.netlify.app](https://qa-practice.netlify.app) is a static SPA — auth and order state are computed client-side, so a "real" REST API may not exist for every flow. The two layers together let you assert against whatever contract the site DOES expose, plus exercise resilience to faults around it.

## Running them

```bash
npm run test:api          # tests/api/ on Chromium
npm run test:network      # tests/network/ on Chromium
npm run test:smoke        # smoke + @api + @network (PR gate)
```

## Adding a new direct HTTP test

```ts
// tests/api/my-feature.spec.ts
import { test, expect } from '../fixtures/api-fixtures';

test('feature endpoint returns the expected shape', {
  tag: ['@api'],
}, async ({ apiClient }) => {
  const res = await apiClient.getAuthEcommercePage();
  expect(res.status()).toBe(200);
});
```

The `apiClient` fixture is a thin wrapper over Playwright's `request` context — it inherits the configured `baseURL` and adds typed helpers (`postLogin`, `postFileUpload`, …) that mirror the site's actual endpoints. Extend [`src/api/api-client.ts`](../src/api/api-client.ts) when you need a new helper.

## Adding a network-mocking test

Use `page.route()` to intercept and fulfil/abort/continue requests:

```ts
// tests/network/checkout-mock.spec.ts
test('UI surfaces an error when the checkout endpoint 500s', async ({ page, ... }) => {
  await page.route('**/checkout**', async (route) => {
    await route.fulfill({ status: 500, body: '{"error":"boom"}' });
  });
  // ...drive the flow and assert on the UI's error state...
});
```

For offline simulation use `context.setOffline(true)`; for slow networks add a `setTimeout` inside the route handler before `route.continue()`. Both patterns are demonstrated in [`tests/network/error-handling.spec.ts`](../tests/network/error-handling.spec.ts).

## Tagging convention

| Tag | When to use |
|---|---|
| `@api` | Spec hits a real HTTP endpoint or asserts on captured request/response shape. |
| `@network` | Spec uses `page.route()` / `setOffline()` to inject a fault. |
| `@critical` | Add for any of the above that gate a release. |
| `@regression` | Default catch-all for edge-case API/network specs. |

The PR-gate workflow runs `@smoke|@api|@network` — keep these tests fast (under ~30s each) so the gate stays under its 10-minute budget.

## Troubleshooting

- **`apiClient.postLogin()` returns 405** — expected. The demo site is static; document the status the test sees rather than asserting `200`.
- **Captured requests array is empty** — the SPA may run the flow entirely in JS without a network call. Pin that behavior (`expect(traffic.length).toBe(0)`) so a future endpoint addition surfaces.
- **Route handler not firing** — Playwright matches glob/regex against the full URL. Use `**/path**` or a `RegExp`; do not rely on relative paths.
