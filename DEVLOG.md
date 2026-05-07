# DEVLOG — SpendLens

## Day 1 — 2026-05-01

**Hours worked:** 4

**What I did:** Read the assignment brief three times, highlighted every constraint. Set up the Next.js project with TypeScript + Tailwind. Created the initial `lib/types.ts` and scaffolded the directory structure. Started researching current pricing for all 8 required tools — opened official pricing pages for Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, and both API products. Took notes in `PRICING_DATA.md` draft.

**What I learned:** Cursor's Business plan doesn't add meaningful features for teams under ~10 seats — it's mostly admin/billing controls. This became the basis for one of the strongest audit rules. Also learned that Claude Team has a hard 5-seat minimum, which means teams of 2-3 buying Team are essentially paying for phantom seats.

**Blockers / what I'm stuck on:** Unsure whether to store audit results server-side (Supabase) or client-side (localStorage). Server-side means the shareable URL works cross-device; localStorage is faster and resilient. Leaning toward localStorage + Supabase write as backup.

**Plan for tomorrow:** Build the audit engine (pure functions, no I/O). Write the core per-tool rules. Start on the input form UI.

---

## Day 2 — 2026-05-02

**Hours worked:** 6

**What I did:** Built `lib/audit-engine.ts` — the full per-tool audit logic for all 8 tools, plus the cross-tool analysis (Cursor + Copilot redundancy, Claude + ChatGPT double-spend). Each rule has a plain-English justification that a finance person would agree with. Started the main landing page form — tool selector grid, plan/seats/spend inputs, team size and use case fields. Form state now persists to localStorage on every change.

**What I learned:** Writing defensible audit logic is harder than it sounds. First draft of the Cursor rule just said "downgrade if Business plan" without explaining why. Had to go back and read Cursor's feature comparison table to articulate the actual difference between Pro and Business (centralized billing, usage analytics — not functionality). The rule is much stronger now.

**Blockers / what I'm stuck on:** The form UI for per-tool spend inputs is getting cluttered. Three fields per tool (plan, seats, monthly spend) across 8 tools is a lot. Need to make it feel light.

**Plan for tomorrow:** Polish the form UI. Build the results page. Get the full happy path working end-to-end (form → API → results).

---

## Day 3 — 2026-05-03

**Hours worked:** 7

**What I did:** Built the audit results page (`/audit/[id]`) with the savings hero, per-tool recommendation cards, and action badges (downgrade / switch / credits / keep). Wired up the `/api/audit` route. Got the full end-to-end flow working: fill form → POST to API → store in localStorage → navigate to results page. Built the AI summary API route with Anthropic SDK + template fallback. Tested fallback path by temporarily unsetting the API key.

**What I learned:** Passing the full audit result through URL query params is ugly and hits URL length limits for large audits. Switched to localStorage as primary store with Supabase as backup. Much cleaner.

**Blockers / what I'm stuck on:** The results page looks flat — the savings hero doesn't pop enough. Need to differentiate visually between high-savings (>$500/mo) and low-savings (already optimal) cases.

**Plan for tomorrow:** Visual polish on results page. Build lead capture form + `/api/lead` route. Wire up Supabase for storing audits and leads.

---

## Day 4 — 2026-05-04

**Hours worked:** 5

**What I did:** Added conditional styling to the results hero — green gradient for high savings, neutral for optimal. Built the lead capture form with email, company, and role fields. Added honeypot field for bot protection. Built `/api/lead` route with Supabase write + Resend email. Set up Supabase project and created the `audits` and `leads` tables. Added in-memory rate limiter to all API routes. Set up `.env.example` with all required vars.

**What I learned:** Resend's free tier sends up to 3,000 emails/month and has a solid React Email library. The API is cleaner than SendGrid. For the confirmation email I kept it dead simple — plain HTML, no fancy template — because plain text emails have better deliverability and look more personal.

**Blockers / what I'm stuck on:** Supabase service role key needs to stay server-side only. Had to make sure the client component never imports from `lib/supabase.ts` directly — only API routes do.

**Plan for tomorrow:** Tests for the audit engine. GitHub Actions CI. Shareable URL polish.

---

## Day 5 — 2026-05-05

**Hours worked:** 6

**What I did:** Wrote all automated tests in `__tests__/audit-engine.test.ts` — 8 tests covering the audit engine. Set up Jest + ts-jest. All tests pass. Created `.github/workflows/ci.yml` — runs `npm run lint` and `npm test` on every push to main. Pushed to GitHub and confirmed green CI checks. Built `PRICING_DATA.md` with every number traced to an official vendor URL (verified same day). Started on `TESTS.md`.

**What I learned:** Writing tests first would have caught a bug in the cross-tool rule for Cursor + Copilot — the rule was mutating the original recommendations array instead of the filtered one. The test exposed it immediately; would have been a subtle bug in production.

**Blockers / what I'm stuck on:** CI job takes ~90 seconds because it runs `npm install`. Added caching for `node_modules` to bring it down to ~30s.

**Plan for tomorrow:** All entrepreneurial markdown files (GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS, REFLECTION). These take real thought.

---

## Day 6 — 2026-05-06

**Hours worked:** 5

**What I did:** Wrote `GTM.md`, `ECONOMICS.md`, `LANDING_COPY.md`, `METRICS.md`. Had three user interviews today — two async via DM (founders I know from X), one sync call. Took structured notes for `USER_INTERVIEWS.md`. The interviews changed my thinking on the results page: one founder said "I don't care about the total savings number, I want to know what to cancel first" — added a priority sort to the recommendations (highest savings first).

**What I learned:** Real user interviews are uncomfortable and useful. The second person I spoke to said the tool sounds like it'll "obviously recommend whatever Credex sells" — that's a real trust problem. I added "You're spending well ✓" messaging for already-optimal stacks specifically to combat this. Honest audits build more trust than manufactured savings.

**Blockers / what I'm stuck on:** `REFLECTION.md` requires specificity I don't fully have yet — the "hardest bug" question. Need to write it after Day 7 cleanup.

**Plan for tomorrow:** Final polish, REFLECTION.md, deploy to Vercel, final smoke test.

---

## Day 7 — 2026-05-07

**Hours worked:** 4

**What I did:** Final UI polish pass — tightened spacing, improved mobile layout, added the "already optimal" case to the results page. Deployed to Vercel. Ran Lighthouse on the deployed URL: Performance 91, Accessibility 92, Best Practices 95. Fixed one accessibility issue (missing label on select element). Wrote `REFLECTION.md`. Ran full end-to-end smoke test on production. Submitted.

**What I learned:** Lighthouse accessibility score will punish you for color contrast on dark themes. My `text-[#555]` labels on `bg-[#0a0a0a]` failed contrast. Fixed by using `text-[#888]` minimum for body copy on dark backgrounds.

**Blockers / what I'm stuck on:** None. Ship day.

**Plan for tomorrow:** N/A — submitted.
