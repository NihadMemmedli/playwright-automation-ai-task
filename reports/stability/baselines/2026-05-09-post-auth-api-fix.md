# Stability Report

_Generated: 2026-05-09T14:15:19.546Z_

## Summary

| Metric | Value |
|---|---|
| Tests observed | 7 |
| Total runs | 70 |
| Passed | 68 |
| Failed | 2 |
| Overall flake rate | **2.9%** |
| Threshold | 0.0% |
| Verdict | ❌ Flaky tests detected |
| Duration | 129.9s |

## Flaky tests (1)

| Test | File | Project | Runs | Passed | Failed | Flake rate | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|---|---|---|
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › logs in, adds 2 products, completes checkout, and logs out | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 10 | 8 | 2 | **20.0%** | 13774 | 22300 |

### Failure samples

**e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › logs in, adds 2 products, completes checkout, and logs out** (`tests/e2e/auth-ecommerce.spec.ts`)

- Error: expect(received).toBeGreaterThan(expected)

<details><summary>Stable tests (6)</summary>

| Test | File | Project | Runs | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|
| api/auth-api.spec.ts › Auth — API & network layer › direct POST to login endpoint with bad credentials does not 5xx | `tests/api/auth-api.spec.ts` | chromium | 10 | 93 | 430 |
| api/auth-api.spec.ts › Auth — API & network layer › login page is reachable and serves HTML | `tests/api/auth-api.spec.ts` | chromium | 10 | 366 | 1153 |
| api/auth-api.spec.ts › Auth — captured network traffic › captures all network requests during a successful login | `tests/api/auth-api.spec.ts` | chromium | 10 | 11525 | 12644 |
| api/auth-api.spec.ts › Auth — captured network traffic › credentials shown on the page are accepted by login flow | `tests/api/auth-api.spec.ts` | chromium | 10 | 11660 | 14700 |
| api/auth-api.spec.ts › Auth — captured network traffic › logout via UI ends the authenticated session locally | `tests/api/auth-api.spec.ts` | chromium | 10 | 19715 | 56486 |
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › credentials displayed on the page match what we use | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 10 | 1453 | 2623 |

</details>
