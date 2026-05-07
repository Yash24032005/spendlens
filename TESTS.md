# TESTS — SpendLens

## How to Run

```bash
npm test
```

All tests use Jest + ts-jest. No external services required — the audit engine is a pure function.

---

## Test File

**File:** `__tests__/audit-engine.test.ts`
**Command:** `npm test`
**Coverage:** Core audit engine logic — all major rule paths

---

## Test Cases

| # | Test Name | What it covers | File |
|---|---|---|---|
| 1 | Cursor Business with ≤3 seats recommends downgrade to Pro | `auditCursor` — Business → Pro downgrade rule for small teams | audit-engine.test.ts |
| 2 | Claude Team with <5 seats recommends downgrade due to forced minimum | `auditClaude` — Team plan minimum-seat billing rule | audit-engine.test.ts |
| 3 | Cursor Pro with small team returns keep with zero savings | `auditCursor` — already-optimal case, no false positives | audit-engine.test.ts |
| 4 | Cursor + GitHub Copilot together flags Copilot as redundant | `applyCrossToolRules` — cross-tool redundancy detection | audit-engine.test.ts |
| 5 | Total monthly savings equals sum of individual tool savings | `runAudit` — savings totals are computed correctly | audit-engine.test.ts |
| 6 | Annual savings equals 12x monthly savings | `runAudit` — annual savings math | audit-engine.test.ts |
| 7 | Anthropic API spend >$200/mo recommends credits | `auditAnthropicAPI` — high-spend credits path + credexNote | audit-engine.test.ts |
| 8 | Anthropic API spend <$200/mo keeps current plan | `auditAnthropicAPI` — low-spend keep path | audit-engine.test.ts |
| 9 | Audit result includes id, createdAt, and input | `runAudit` — result shape / required fields | audit-engine.test.ts |
| 10 | ChatGPT Pro plan for writing use case recommends downgrade | `auditChatGPT` — Pro → Team downgrade for non-power-users | audit-engine.test.ts |

---

## CI

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`.
