# Stability Report

_Generated: 2026-05-09T12:46:59.816Z_

## Summary

| Metric | Value |
|---|---|
| Tests observed | 2 |
| Total runs | 40 |
| Passed | 38 |
| Failed | 2 |
| Overall flake rate | **5.0%** |
| Threshold | 0.0% |
| Verdict | ❌ Flaky tests detected |
| Duration | 80.4s |

## Flaky tests (1)

| Test | File | Project | Runs | Passed | Failed | Flake rate | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|---|---|---|
| e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › logs in, adds 2 products, completes checkout, and logs out | `tests/e2e/auth-ecommerce.spec.ts` | chromium | 20 | 18 | 2 | **10.0%** | 13808 | 36849 |

### Failure samples

**e2e/auth-ecommerce.spec.ts › E-commerce auth + order — happy path › logs in, adds 2 products, completes checkout, and logs out** (`tests/e2e/auth-ecommerce.spec.ts`)

- Error: expect(locator).toBeVisible() failed

<details><summary>Stable tests (1)</summary>

| Test | File | Project | Runs | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|
| e2e/file-upload.spec.ts › File upload › uploads a text file successfully | `tests/e2e/file-upload.spec.ts` | chromium | 20 | 1456 | 2226 |

</details>
