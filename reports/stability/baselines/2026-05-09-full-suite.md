# Stability Report

_Generated: 2026-05-09T13:08:23.465Z_

## Summary

| Metric | Value |
|---|---|
| Tests observed | 48 |
| Total runs | 480 |
| Passed | 461 |
| Failed | 9 |
| Overall flake rate | **1.9%** |
| Threshold | 0.0% |
| Verdict | ❌ Flaky tests detected |
| Duration | 671.2s |

## Flaky tests (4)

| Test | File | Project | Runs | Passed | Failed | Flake rate | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|---|---|---|
| api/auth-api.spec.ts › Auth — captured network traffic › logout via UI ends the authenticated session locally | `tests/api/auth-api.spec.ts` | chromium | 10 | 5 | 5 | **50.0%** | 22666 | 32419 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › removing a cart item updates the total | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 8 | 2 | **20.0%** | 12226 | 21856 |
| api/order-api.spec.ts › Order — captured submission traffic › submitting an order issues network calls or a console signal | `tests/api/order-api.spec.ts` | chromium | 10 | 9 | 1 | **10.0%** | 13377 | 21310 |
| e2e/session-edge-cases.spec.ts › Session — edge cases › two-tab login: a fresh tab does not inherit the first tab's session | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 9 | 1 | **10.0%** | 28912 | 42881 |

### Failure samples

**api/auth-api.spec.ts › Auth — captured network traffic › logout via UI ends the authenticated session locally** (`tests/api/auth-api.spec.ts`)

- Error: expect(locator).toBeVisible() failed

**e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › removing a cart item updates the total** (`tests/e2e/auth-edge-cases.spec.ts`)

- Error: expect(received).toBeGreaterThan(expected)

**api/order-api.spec.ts › Order — captured submission traffic › submitting an order issues network calls or a console signal** (`tests/api/order-api.spec.ts`)

- Error: expect(received).toBeGreaterThan(expected)

**e2e/session-edge-cases.spec.ts › Session — edge cases › two-tab login: a fresh tab does not inherit the first tab's session** (`tests/e2e/session-edge-cases.spec.ts`)

- TimeoutError: page.goto: Timeout 30000ms exceeded.

<details><summary>Stable tests (44)</summary>

| Test | File | Project | Runs | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|
| api/auth-api.spec.ts › Auth — API & network layer › direct POST to login endpoint with bad credentials does not 5xx | `tests/api/auth-api.spec.ts` | chromium | 10 | 87 | 462 |
| api/auth-api.spec.ts › Auth — API & network layer › login page is reachable and serves HTML | `tests/api/auth-api.spec.ts` | chromium | 10 | 348 | 926 |
| api/auth-api.spec.ts › Auth — captured network traffic › captures all network requests during a successful login | `tests/api/auth-api.spec.ts` | chromium | 10 | 11807 | 13065 |
| api/auth-api.spec.ts › Auth — captured network traffic › credentials shown on the page are accepted by login flow | `tests/api/auth-api.spec.ts` | chromium | 10 | 11638 | 12241 |
| api/order-api.spec.ts › Order — captured submission traffic › upload via UI reflects the uploaded filename in the response | `tests/api/order-api.spec.ts` | chromium | 10 | 1663 | 2357 |
| api/order-api.spec.ts › Order & upload — API & network layer › direct multipart POST to /file-upload does not 5xx | `tests/api/order-api.spec.ts` | chromium | 10 | 135 | 368 |
| api/order-api.spec.ts › Order & upload — API & network layer › file-upload endpoint is reachable | `tests/api/order-api.spec.ts` | chromium | 10 | 296 | 988 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › checkout shipping form has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 12513 | 14036 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › file upload page has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 1735 | 3852 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › login page has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 2216 | 4771 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › shop page (post-login) has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 12207 | 13698 |
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › credentials displayed on the page match what we use | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 10 | 1712 | 3127 |
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › logs in, adds 2 products, completes checkout, and logs out | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 10 | 16649 | 22212 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › email-only submit (empty password) shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 2097 | 4715 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › empty form submit shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 2151 | 3210 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › logout clears authenticated state — re-navigation lands on login form | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 21754 | 26801 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › rejects invalid password — shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 2373 | 4539 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › rejects unknown email — shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 1419 | 2482 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › cart total equals the sum of unit prices for all added products | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 11710 | 13752 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › clicking ADD TO CART twice for the same product is a no-op on the second click | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 11871 | 13441 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › proceeding to checkout with an empty cart still navigates without crashing | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 11944 | 16261 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › removing every item one by one returns the cart total to zero | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 11920 | 12616 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › changing the country select updates the bound option | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 11813 | 16124 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › clicking Submit Order without a phone number still attempts submission | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 12526 | 14081 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › phone field accepts numeric input but does not coerce non-numeric to empty | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 11882 | 12756 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › special characters in shipping fields are accepted as plain text | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 11580 | 13137 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › selecting a second file replaces the first before submit | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1325 | 1609 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a file with a very long (200+ char) filename | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1535 | 2770 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a filename with unicode + special characters | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1548 | 2342 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a zero-byte file | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1255 | 2029 |
| e2e/file-upload.spec.ts › File upload › exposes the uploaded filename verbatim in the success response | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1329 | 2352 |
| e2e/file-upload.spec.ts › File upload › site bug: submit with no file shows success with empty filename | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1304 | 4105 |
| e2e/file-upload.spec.ts › File upload › uploads a large (~5MB) binary file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1349 | 2297 |
| e2e/file-upload.spec.ts › File upload › uploads a PDF file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1378 | 1951 |
| e2e/file-upload.spec.ts › File upload › uploads a text file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1539 | 1810 |
| e2e/healing-demo.spec.ts › Self-healing demonstration › heals a deliberately broken submit-button selector | `tests/e2e/healing-demo.spec.ts` | chromium | 10 | 0 | 0 |
| e2e/security-smoke.spec.ts › Security — smoke checks › login form does not reflect the typed email back into the DOM as HTML | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 2168 | 2517 |
| e2e/security-smoke.spec.ts › Security — smoke checks › SQL-style injection in password field returns the same generic error | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 1562 | 7748 |
| e2e/security-smoke.spec.ts › Security — smoke checks › XSS payload in email field is treated as plain text | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 1587 | 2838 |
| e2e/session-edge-cases.spec.ts › Session — edge cases › direct navigation to /auth_ecommerce while logged out lands on login form | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 1898 | 2792 |
| e2e/session-edge-cases.spec.ts › Session — edge cases › refresh on shop page returns to login (in-memory session, no persistence) | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 13011 | 17817 |
| network/error-handling.spec.ts › Network — error handling › app survives a 500 from an intercepted asset request | `tests/network/error-handling.spec.ts` | chromium | 10 | 2335 | 3404 |
| network/error-handling.spec.ts › Network — error handling › offline mid-flow: action after going offline does not corrupt UI state | `tests/network/error-handling.spec.ts` | chromium | 10 | 11709 | 12701 |
| network/error-handling.spec.ts › Network — error handling › slow network: login still completes when responses are throttled | `tests/network/error-handling.spec.ts` | chromium | 10 | 12799 | 16656 |

</details>
