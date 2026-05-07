# SpendLens — AI Spend Audit for Startups

**SpendLens is a free web tool that audits your team's AI tool spend — Cursor, Claude, ChatGPT, GitHub Copilot, and others — and tells you exactly where you're overpaying and what to do about it.** Built as a lead-generation asset for [Credex](https://credex.rocks), the discounted AI credits marketplace.
<!-- 
---

## Screenshots

> See `/public/screenshots/` or the Loom walkthrough below

**[30-second screen recording (Loom)](https://loom.com/share/placeholder)**

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Install & Run Locally

```bash
git clone https://github.com/yourusername/spendlens
cd spendlens
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```

The app works without any env vars — falls back gracefully.

### Deploy to Vercel

```bash
npx vercel --prod
```

### Supabase Schema

```sql
create table audits (
  id uuid primary key,
  input jsonb,
  recommendations jsonb,
  total_monthly_spend numeric,
  total_monthly_savings numeric,
  total_annual_savings numeric,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references audits(id),
  email text not null,
  company_name text,
  role text,
  team_size int,
  created_at timestamptz default now()
);
```

---

## Decisions

1. **Next.js App Router over Vite/SPA** — Server components + API routes in one repo beats a separate Express backend for a project this size. Built-in routing, metadata, and Vercel deployment are all first-class.

2. **Hardcoded audit rules, not AI** — AI for deterministic math is non-debuggable and expensive per-audit. Rules are transparent, testable, and defensible to a finance person. AI used only for the narrative summary.

3. **localStorage for audit state** — No DB reads on the results page. Audit result stored in localStorage by ID right after creation. Fast, works offline, resilient to DB downtime.

4. **Supabase over custom Postgres** — Free tier covers MVP volumes. Auto-generated REST API saved ~4 hours vs Prisma + Render Postgres.

5. **In-memory rate limiter over Redis** — Map-based rate limiter is zero-dependency and sufficient for single-instance MVP. Tradeoff: doesn't scale across multiple server instances. Replace with Upstash Redis for production.

---

**Live URL:** https://spendlens.vercel.app -->
