# Stability Report

_Generated: 2026-05-09T14:53:40.886Z_

## Summary

| Metric | Value |
|---|---|
| Tests observed | 48 |
| Total runs | 480 |
| Passed | 460 |
| Failed | 10 |
| Overall flake rate | **2.1%** |
| Threshold | 0.0% |
| Verdict | ❌ Flaky tests detected |
| Duration | 714.2s |

## Flaky tests (6)

| Test | File | Project | Runs | Passed | Failed | Flake rate | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|---|---|---|
| e2e/session-edge-cases.spec.ts › Session — edge cases › two-tab login: a fresh tab does not inherit the first tab's session | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 7 | 3 | **30.0%** | 24300 | 44247 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › removing a cart item updates the total | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 8 | 2 | **20.0%** | 12182 | 22141 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › changing the country select updates the bound option | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 8 | 2 | **20.0%** | 12374 | 23027 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › logout clears authenticated state — re-navigation lands on login form | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 9 | 1 | **10.0%** | 18053 | 45718 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › removing every item one by one returns the cart total to zero | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 9 | 1 | **10.0%** | 11818 | 21718 |
| e2e/session-edge-cases.spec.ts › Session — edge cases › refresh on shop page returns to login (in-memory session, no persistence) | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 9 | 1 | **10.0%** | 15535 | 52356 |

### Failure samples

**e2e/session-edge-cases.spec.ts › Session — edge cases › two-tab login: a fresh tab does not inherit the first tab's session** (`tests/e2e/session-edge-cases.spec.ts`)

- TimeoutError: page.goto: Timeout 30000ms exceeded.

**e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › removing a cart item updates the total** (`tests/e2e/auth-edge-cases.spec.ts`)

- Error: expect(received).toBeGreaterThan(expected)

**e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › changing the country select updates the bound option** (`tests/e2e/checkout-edge-cases.spec.ts`)

- Error: expect(received).toBeGreaterThan(expected)

**e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › logout clears authenticated state — re-navigation lands on login form** (`tests/e2e/auth-edge-cases.spec.ts`)

- TimeoutError: page.goto: Timeout 30000ms exceeded.

**e2e/cart-edge-cases.spec.ts › Cart — edge cases › removing every item one by one returns the cart total to zero** (`tests/e2e/cart-edge-cases.spec.ts`)

- Error: expect(received).toBeGreaterThan(expected)

**e2e/session-edge-cases.spec.ts › Session — edge cases › refresh on shop page returns to login (in-memory session, no persistence)** (`tests/e2e/session-edge-cases.spec.ts`)

- TimeoutError: page.reload: Timeout 30000ms exceeded.

<details><summary>Stable tests (42)</summary>

| Test | File | Project | Runs | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|
| api/auth-api.spec.ts › Auth — API & network layer › direct POST to login endpoint with bad credentials does not 5xx | `tests/api/auth-api.spec.ts` | chromium | 10 | 94 | 450 |
| api/auth-api.spec.ts › Auth — API & network layer › login page is reachable and serves HTML | `tests/api/auth-api.spec.ts` | chromium | 10 | 453 | 1466 |
| api/auth-api.spec.ts › Auth — captured network traffic › captures all network requests during a successful login | `tests/api/auth-api.spec.ts` | chromium | 10 | 11975 | 13353 |
| api/auth-api.spec.ts › Auth — captured network traffic › credentials shown on the page are accepted by login flow | `tests/api/auth-api.spec.ts` | chromium | 10 | 11880 | 16865 |
| api/auth-api.spec.ts › Auth — captured network traffic › logout via UI ends the authenticated session locally | `tests/api/auth-api.spec.ts` | chromium | 10 | 16995 | 37813 |
| api/order-api.spec.ts › Order — captured submission traffic › submitting an order issues network calls or a console signal | `tests/api/order-api.spec.ts` | chromium | 10 | 13351 | 15115 |
| api/order-api.spec.ts › Order — captured submission traffic › upload via UI reflects the uploaded filename in the response | `tests/api/order-api.spec.ts` | chromium | 10 | 1724 | 4560 |
| api/order-api.spec.ts › Order & upload — API & network layer › direct multipart POST to /file-upload does not 5xx | `tests/api/order-api.spec.ts` | chromium | 10 | 112 | 434 |
| api/order-api.spec.ts › Order & upload — API & network layer › file-upload endpoint is reachable | `tests/api/order-api.spec.ts` | chromium | 10 | 391 | 1656 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › checkout shipping form has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 12278 | 14912 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › file upload page has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 2022 | 2998 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › login page has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 2540 | 10192 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › shop page (post-login) has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 12661 | 15783 |
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › credentials displayed on the page match what we use | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 10 | 1859 | 6158 |
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › logs in, adds 2 products, completes checkout, and logs out | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 10 | 20294 | 30647 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › email-only submit (empty password) shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 2330 | 3250 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › empty form submit shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 1730 | 4304 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › rejects invalid password — shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 1966 | 2765 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › rejects unknown email — shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 1815 | 2827 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › cart total equals the sum of unit prices for all added products | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 11808 | 13394 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › clicking ADD TO CART twice for the same product is a no-op on the second click | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 11871 | 13671 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › proceeding to checkout with an empty cart still navigates without crashing | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 12222 | 16887 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › clicking Submit Order without a phone number still attempts submission | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 12755 | 13887 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › phone field accepts numeric input but does not coerce non-numeric to empty | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 11594 | 13282 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › special characters in shipping fields are accepted as plain text | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 11899 | 13189 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › selecting a second file replaces the first before submit | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1558 | 2116 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a file with a very long (200+ char) filename | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1611 | 2741 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a filename with unicode + special characters | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1659 | 2418 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a zero-byte file | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1596 | 2007 |
| e2e/file-upload.spec.ts › File upload › exposes the uploaded filename verbatim in the success response | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1485 | 1911 |
| e2e/file-upload.spec.ts › File upload › site bug: submit with no file shows success with empty filename | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1431 | 1615 |
| e2e/file-upload.spec.ts › File upload › uploads a large (~5MB) binary file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1441 | 1745 |
| e2e/file-upload.spec.ts › File upload › uploads a PDF file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1565 | 2313 |
| e2e/file-upload.spec.ts › File upload › uploads a text file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1511 | 2663 |
| e2e/healing-demo.spec.ts › Self-healing demonstration › heals a deliberately broken submit-button selector | `tests/e2e/healing-demo.spec.ts` | chromium | 10 | 0 | 0 |
| e2e/security-smoke.spec.ts › Security — smoke checks › login form does not reflect the typed email back into the DOM as HTML | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 2509 | 8827 |
| e2e/security-smoke.spec.ts › Security — smoke checks › SQL-style injection in password field returns the same generic error | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 2565 | 6923 |
| e2e/security-smoke.spec.ts › Security — smoke checks › XSS payload in email field is treated as plain text | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 2078 | 24687 |
| e2e/session-edge-cases.spec.ts › Session — edge cases › direct navigation to /auth_ecommerce while logged out lands on login form | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 1792 | 9025 |
| network/error-handling.spec.ts › Network — error handling › app survives a 500 from an intercepted asset request | `tests/network/error-handling.spec.ts` | chromium | 10 | 2252 | 3547 |
| network/error-handling.spec.ts › Network — error handling › offline mid-flow: action after going offline does not corrupt UI state | `tests/network/error-handling.spec.ts` | chromium | 10 | 12720 | 18056 |
| network/error-handling.spec.ts › Network — error handling › slow network: login still completes when responses are throttled | `tests/network/error-handling.spec.ts` | chromium | 10 | 12582 | 13556 |

</details>
