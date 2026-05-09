# Stability Report

_Generated: 2026-05-09T15:17:38.211Z_

## Summary

| Metric | Value |
|---|---|
| Tests observed | 48 |
| Total runs | 480 |
| Passed | 470 |
| Failed | 0 |
| Overall flake rate | **0.0%** |
| Threshold | 0.0% |
| Verdict | ✅ Stable |
| Duration | 1121.0s |

## Flaky tests

_None detected. ✅_

<details><summary>Stable tests (48)</summary>

| Test | File | Project | Runs | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|
| api/auth-api.spec.ts › Auth — API & network layer › direct POST to login endpoint with bad credentials does not 5xx | `tests/api/auth-api.spec.ts` | chromium | 10 | 110 | 379 |
| api/auth-api.spec.ts › Auth — API & network layer › login page is reachable and serves HTML | `tests/api/auth-api.spec.ts` | chromium | 10 | 367 | 774 |
| api/auth-api.spec.ts › Auth — captured network traffic › captures all network requests during a successful login | `tests/api/auth-api.spec.ts` | chromium | 10 | 6888 | 13034 |
| api/auth-api.spec.ts › Auth — captured network traffic › credentials shown on the page are accepted by login flow | `tests/api/auth-api.spec.ts` | chromium | 10 | 6671 | 10333 |
| api/auth-api.spec.ts › Auth — captured network traffic › logout via UI ends the authenticated session locally | `tests/api/auth-api.spec.ts` | chromium | 10 | 13418 | 17915 |
| api/order-api.spec.ts › Order — captured submission traffic › submitting an order issues network calls or a console signal | `tests/api/order-api.spec.ts` | chromium | 10 | 7838 | 14179 |
| api/order-api.spec.ts › Order — captured submission traffic › upload via UI reflects the uploaded filename in the response | `tests/api/order-api.spec.ts` | chromium | 10 | 1256 | 2268 |
| api/order-api.spec.ts › Order & upload — API & network layer › direct multipart POST to /file-upload does not 5xx | `tests/api/order-api.spec.ts` | chromium | 10 | 89 | 175 |
| api/order-api.spec.ts › Order & upload — API & network layer › file-upload endpoint is reachable | `tests/api/order-api.spec.ts` | chromium | 10 | 122 | 335 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › checkout shipping form has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 8233 | 11943 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › file upload page has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 1754 | 2395 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › login page has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 1946 | 2158 |
| e2e/accessibility.spec.ts › Accessibility (WCAG 2.1 A + AA) › shop page (post-login) has no critical a11y violations | `tests/e2e/accessibility.spec.ts` | chromium | 10 | 9613 | 12513 |
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › credentials displayed on the page match what we use | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 10 | 1430 | 1775 |
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › logs in, adds 2 products, completes checkout, and logs out | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 10 | 10830 | 18450 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › email-only submit (empty password) shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 1312 | 2050 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › empty form submit shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 1366 | 1623 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › logout clears authenticated state — re-navigation lands on login form | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 9445 | 17356 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › rejects invalid password — shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 1433 | 1852 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › rejects unknown email — shows Bad credentials error | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 1552 | 1760 |
| e2e/auth-edge-cases.spec.ts › E-commerce — auth edge cases › removing a cart item updates the total | `tests/e2e/auth-edge-cases.spec.ts` | chromium | 10 | 6731 | 11491 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › cart total equals the sum of unit prices for all added products | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 8504 | 11887 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › clicking ADD TO CART twice for the same product is a no-op on the second click | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 9415 | 11760 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › proceeding to checkout with an empty cart still navigates without crashing | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 11702 | 12278 |
| e2e/cart-edge-cases.spec.ts › Cart — edge cases › removing every item one by one returns the cart total to zero | `tests/e2e/cart-edge-cases.spec.ts` | chromium | 10 | 8036 | 11439 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › changing the country select updates the bound option | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 8064 | 11798 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › clicking Submit Order without a phone number still attempts submission | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 10573 | 12354 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › phone field accepts numeric input but does not coerce non-numeric to empty | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 8568 | 11819 |
| e2e/checkout-edge-cases.spec.ts › Checkout — edge cases › special characters in shipping fields are accepted as plain text | `tests/e2e/checkout-edge-cases.spec.ts` | chromium | 10 | 7036 | 11971 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › selecting a second file replaces the first before submit | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1180 | 1558 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a file with a very long (200+ char) filename | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1342 | 1682 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a filename with unicode + special characters | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1305 | 3347 |
| e2e/file-upload-edge-cases.spec.ts › File upload — edge cases › uploads a zero-byte file | `tests/e2e/file-upload-edge-cases.spec.ts` | chromium | 10 | 1307 | 1623 |
| e2e/file-upload.spec.ts › File upload › exposes the uploaded filename verbatim in the success response | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1262 | 1514 |
| e2e/file-upload.spec.ts › File upload › site bug: submit with no file shows success with empty filename | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1272 | 1403 |
| e2e/file-upload.spec.ts › File upload › uploads a large (~5MB) binary file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1314 | 1546 |
| e2e/file-upload.spec.ts › File upload › uploads a PDF file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1266 | 1506 |
| e2e/file-upload.spec.ts › File upload › uploads a text file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 10 | 1211 | 1469 |
| e2e/healing-demo.spec.ts › Self-healing demonstration › heals a deliberately broken submit-button selector | `tests/e2e/healing-demo.spec.ts` | chromium | 10 | 0 | 0 |
| e2e/security-smoke.spec.ts › Security — smoke checks › login form does not reflect the typed email back into the DOM as HTML | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 1699 | 2636 |
| e2e/security-smoke.spec.ts › Security — smoke checks › SQL-style injection in password field returns the same generic error | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 1517 | 2806 |
| e2e/security-smoke.spec.ts › Security — smoke checks › XSS payload in email field is treated as plain text | `tests/e2e/security-smoke.spec.ts` | chromium | 10 | 1451 | 2129 |
| e2e/session-edge-cases.spec.ts › Session — edge cases › direct navigation to /auth_ecommerce while logged out lands on login form | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 1608 | 2748 |
| e2e/session-edge-cases.spec.ts › Session — edge cases › refresh on shop page returns to login (in-memory session, no persistence) | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 9790 | 23859 |
| e2e/session-edge-cases.spec.ts › Session — edge cases › two-tab login: a fresh tab does not inherit the first tab's session | `tests/e2e/session-edge-cases.spec.ts` | chromium | 10 | 8873 | 17282 |
| network/error-handling.spec.ts › Network — error handling › app survives a 500 from an intercepted asset request | `tests/network/error-handling.spec.ts` | chromium | 10 | 1868 | 2151 |
| network/error-handling.spec.ts › Network — error handling › offline mid-flow: action after going offline does not corrupt UI state | `tests/network/error-handling.spec.ts` | chromium | 10 | 9919 | 11921 |
| network/error-handling.spec.ts › Network — error handling › slow network: login still completes when responses are throttled | `tests/network/error-handling.spec.ts` | chromium | 10 | 7794 | 12504 |

</details>
