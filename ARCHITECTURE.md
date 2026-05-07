# Architecture — SpendLens

## System Diagram

```mermaid
graph TD
    A[User Browser] -->|Form Submit| B[Next.js App Router]
    B -->|POST /api/audit| C[Audit Engine]
    C -->|Deterministic rules| D[AuditResult]
    D -->|Store| E[(Supabase DB)]
    D -->|Return JSON| A
    A -->|POST /api/summary| F[Summary API]
    F -->|Prompt| G[Anthropic claude-opus-4-5]
    G -->|~100 word summary| F
    F -->|Fallback if API down| H[Template Summary]
    F -->|Summary text| A
    A -->|POST /api/lead| I[Lead Capture API]
    I -->|Insert lead| E
    I -->|Send email| J[Resend Email]
    A -->|Share URL| K[/audit/id page]
    K -->|Read localStorage| A
```

## Data Flow: Input → Audit Result

```
1. User fills form (tools, plans, spend, seats, team size, use case)
   └─ Form state persisted to localStorage on every keystroke

2. POST /api/audit
   ├─ Rate limit check (IP-based, in-memory)
   ├─ Input validation (zod schema)
   ├─ runAudit(input) — pure function, no I/O
   │   ├─ Per-tool audit functions (cursor, copilot, claude, etc.)
   │   ├─ Cross-tool analysis (redundancy detection)
   │   └─ Returns AuditResult with recommendations + savings totals
   ├─ Supabase insert (non-fatal if fails)
   └─ Return AuditResult JSON

3. Client stores AuditResult in localStorage[`audit_${id}`]
   └─ router.push(`/audit/${id}`)

4. /audit/[id] page
   ├─ Read from localStorage (instant, no loading)
   ├─ Render results immediately
   └─ POST /api/summary (async, non-blocking)
       ├─ Build prompt from AuditResult
       ├─ Call Anthropic API
       └─ Stream summary into UI (or use template fallback)
```

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + API routes in one repo, Vercel-native |
| Language | TypeScript | Type safety on audit logic is critical |
| Styling | Tailwind CSS | Utility-first, no build step complexity |
| Database | Supabase (Postgres) | Free tier, auto REST API, no ORM needed |
| Email | Resend | Best DX, free tier covers early leads |
| AI | Anthropic claude-opus-4-5 | On-brand for Credex; falls back to template |
| Deploy | Vercel | Zero-config Next.js, edge network |
| Rate limiting | In-memory Map | Zero deps, sufficient for single instance |
| Abuse prevention | Honeypot field | Catches dumb bots without friction |

## What Changes at 10k Audits/Day

1. **Rate limiting** → Replace in-memory Map with Upstash Redis. Current approach loses state on restart and doesn't share across instances.

2. **DB writes** → Add a write queue (BullMQ or Upstash QStash). Direct Supabase writes from API routes will hit connection limits under high concurrency.

3. **Audit result storage** → Move from localStorage to server-side storage with short-lived signed URLs. localStorage breaks cross-device sharing.

4. **AI summaries** → Add response caching (Redis) keyed on a hash of the audit input. Many users will have similar stacks — avoid redundant API calls.

5. **Pricing data** → Replace static `pricing.ts` file with a DB table + admin UI. Vendor pricing changes and manual deploys don't scale.

6. **Analytics** → Add Posthog or Mixpanel to track funnel: tool_selected → audit_completed → email_captured → consultation_booked.
