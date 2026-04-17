# CLAUDE.md — Editorial Forge Operating Manual

This file is read automatically by Claude Code at the start of every session. It is the source of truth for how this project is built, what the rules are, and what NOT to do.

---

## Project identity

**Editorial Forge** is a personal tool for Varun Tyagi to produce editorial-grade campaign imagery (Liquid Death / Coke / Oatly class output) for pitching brand ideas to agencies, clients, and internal stakeholders.

- **Users:** Exactly two. Varun and Renuka. Hardcoded whitelist, not a scalable auth system.
- **Not a product.** No billing, no tenants, no teams, no invites, no marketing pages. If you find yourself building any of those, stop and re-read this file.
- **Sibling app:** AdForge (product-photography pipeline, separate repo). Do NOT import AdForge's product/angled-shot/composite code. Editorial Forge has no concept of "products."

---

## Stack (non-negotiable)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript strict, Tailwind v4, shadcn/ui |
| Database | Railway Postgres |
| ORM | Prisma |
| Auth | Auth.js v5 with Resend magic-link provider |
| Image storage | Google Cloud Storage |
| Hosting | Railway (Docker) |
| Image model (primary) | `gemini-3.1-pro-image-preview` (Nano Banana **Pro**, not Flash) |
| Image model (secondary) | Seedream 4 via fal.ai (`fal-ai/bytedance/seedream-v4`) — for south-asia / east-asia regions |
| Text model | GPT-4o for brief expansion |
| Compositor | Python 3.11 + Pillow + fonttools (ported from AdForge, product logic stripped) |

Do not substitute any of these without explicit permission from Varun. If a library or service is unavailable, stop and ask — do not silently pick an alternative.

---

## Build methodology: Compound Engineering

This project is built in **8 discrete sessions** defined in `EDITORIAL_FORGE_BUILD_PLAN.md`. The rules are:

1. **Execute exactly one session at a time.** Never execute Session N+1 during a Session N conversation, even if Session N finishes early.
2. **Stop and wait for review** after each session completes. Do not self-declare a session "done enough" and proceed.
3. **Commit at the end of every session.** Each session must end with a clean git commit.
4. **If asked to "build the app" or "continue the plan" without specifying a session, stop and ask which session.** Do not assume.

The sessions (refer to build plan for details):
1. Scaffold and infrastructure
2. Prisma schema and migrations + seed data
3. Brief expander (CRITICAL — do not rush)
4. Scene generator (Nano Banana Pro + Seedream)
5. API routes
6. Compositor port from AdForge
7. Web UI
8. Railway deployment

Sessions 1+2 MAY be batched. Sessions 5+6 MAY be batched. Session 3 must NEVER be batched with anything.

---

## Session hygiene (IMPORTANT — read every time)

Each session runs in a **fresh conversation**. This is not optional.

**Before starting a session:**
- Open a new Claude Code conversation, OR run `/clear` in the current one
- Do not carry context from the previous session forward
- Read CLAUDE.md and EDITORIAL_FORGE_BUILD_PLAN.md fresh

**Why fresh sessions matter:**
- Context from earlier sessions makes later sessions less sharp (too much irrelevant history)
- Fresh context means the anti-scope rules and session-specific instructions land with full weight
- Token costs are slightly higher (re-reading plan files) but output quality is meaningfully better

**When to clear mid-session:**
- If Claude Code starts drifting off-scope (e.g. adding features not in the current session)
- If a debugging rabbit hole has produced 10+ failed attempts in a row
- If you notice the responses getting vague or circular
- After fixing a significant bug, before moving on to new features

**How to clear:**
- In Claude Code: `/clear` resets the conversation while keeping the working directory
- Or: close the conversation and open a new one in the same directory

**What NOT to do:**
- Do not run all 8 sessions in one long conversation. You will end up with a 200k-token context window full of stale scaffolding work, and Session 8 will be noticeably worse than Session 1.
- Do not skip the clear between sessions "because it's faster." It's not faster. Debugging a confused Claude Code session takes longer than re-reading a plan file.

---

## Session 3 is special — read this before touching it

Session 3 implements `src/lib/ai/brief-expander.ts` and its few-shot examples at `src/lib/ai/prompts/brief-expander.examples.ts`. These examples encode Varun's taste into the system. They are the single highest-leverage artifact in the codebase.

Rules for Session 3:
- The three few-shot examples MUST be 250+ words each.
- They MUST include concrete detail in all 9 layers (cultural anchor, protagonist, environment, product integration, light, camera, material, atmospheric, negative prompt).
- Camera specification MUST name a specific lens (e.g. "35mm f/2") and, where applicable, a specific film stock (e.g. "Kodak Portra 400").
- If your first draft is generic, rewrite it. Do not ask Varun "is this okay?" if you have not already made it as specific as possible.
- Do not write placeholder text like "[specific details go here]". Either write the detail or stop and ask Varun for the reference material.

When Session 3 output is ready, present the three examples to Varun for review BEFORE running tests or committing.

---

## What NOT to build (anti-scope)

Stop immediately if you find yourself doing any of these:

- Multi-tenancy, organizations, workspaces
- Billing, subscription, pricing UI
- Teams, roles, invites, permissions beyond the two-user whitelist
- A canvas editor for layouts (layouts are JSON, edit the JSON)
- Mobile responsive design (desktop only)
- Sora-2 video integration (Phase 5 if ever)
- Integrations with Meta Ads Manager, Figma, or any ad platform
- Public marketing pages, landing pages, SEO
- Analytics or usage dashboards
- Any auth provider other than Resend magic link
- Importing AdForge's product/angled-shot/composite pipeline code
- In-image text rendering via the image model (typography is composited separately by Python)
- BullMQ, Redis, or any external queue (use an in-process Map)

If a feature feels like it belongs in a SaaS product, it does not belong here.

---

## Key paths

```
src/
  app/                   # Next.js App Router
    api/                 # API routes
    (authed)/            # Protected routes under middleware
    login/               # Magic link login
  lib/
    ai/
      brief-expander.ts  # CRITICAL — Session 3
      scene-generator.ts # Nano Banana Pro
      seedream-generator.ts
      scene-dispatcher.ts
      prompts/
        brief-expander.system.ts    # Versioned prompt template
        brief-expander.examples.ts  # The 3 few-shot examples (Varun's taste)
    auth/
      config.ts
      allowed-emails.ts  # Hardcoded whitelist
    storage/
      gcs.ts             # GCS adapter
    compositor/
      index.ts           # Node wrapper around Python
    queue/
      scene-queue.ts     # In-process Map, NOT Redis/BullMQ
    env.ts               # zod validation, fail fast
  middleware.ts          # Auth check on all /app/* routes

scripts/
  compose_editorial.py   # Python + Pillow typography compositor

prisma/
  schema.prisma
  seed.ts                # Seeds LayoutTemplate + CulturalContext rows

ralph/                   # Phase 3 only — do NOT create in Phase 1
```

---

## Environment variables (all required, zod-validated at startup)

```
DATABASE_URL                  # Railway Postgres (use DATABASE_PUBLIC_URL locally)
GCS_SERVICE_ACCOUNT_KEY_B64   # Base64-encoded service account JSON
GCS_BUCKET_NAME               # editorial-forge-assets
OPENAI_API_KEY
GOOGLE_GEMINI_API_KEY
FAL_API_KEY
RESEND_API_KEY
EMAIL_FROM                    # e.g. hello@raygency.com
AUTH_SECRET                   # generate with: openssl rand -base64 32
NEXTAUTH_URL                  # http://localhost:3000 locally, Railway domain in prod
```

Fail fast if any are missing. Do not fall back to defaults.

---

## Coding conventions

- TypeScript strict mode. No `any`. No `@ts-ignore` without an adjacent comment explaining why.
- Prefer Prisma's generated types over hand-rolled interfaces for database rows.
- All API route bodies validated with zod schemas in `src/lib/validation/`.
- All async functions that hit external APIs must have timeout + retry (follow the `fetchGeminiWithRetry` pattern from adforge-railway).
- Commits: conventional commits style (`feat:`, `fix:`, `chore:`). One logical change per commit.
- No comments that narrate what the code does ("// loop over items"). Comments explain WHY when the why isn't obvious from the code.

---

## When something breaks

If a build fails or a runtime error appears:
1. Read the actual error. Do not assume.
2. Diagnose the root cause before writing any fix code.
3. If the root cause is environmental (missing env var, Railway-specific quirk, network issue), stop and tell Varun. Don't write code to work around infrastructure problems.
4. If the fix requires changing the stack or dropping a feature, stop and ask.

Common issues to watch for:
- `DATABASE_URL` vs `DATABASE_PUBLIC_URL` confusion (Railway uses both)
- GCS service account JSON not base64-decoding correctly (check for trailing newlines)
- Auth.js middleware running on `/api/auth/*` routes and causing redirect loops (exclude explicitly)
- Gemini API returning 429 during burst generation (the retry wrapper handles this, don't reimplement)

---

## Quality bar for image output

The target is Liquid Death Maut Ka Kua / Coke Berry Pujo quality. This means:
- Photorealistic, not illustrated
- Culturally specific, not generic "South Asian festival"
- 4K output, not web-preview resolution
- No rendered text in the image itself (text is composited separately)
- No watermarks, UI elements, or AI tells (melted hands, warped anatomy, impossible geometry)

First-generation quality will land at 60–75% of target. The best of 4 variations will usually hit 85%. The last 10% closes through manual prompt iteration (Phase 2) and eventually Ralph loop tuning (Phase 3). Do not expect 95% on first try; that expectation will lead to over-engineering.

---

## How Varun will work with you

- Varun runs each session in a fresh conversation. Assume no prior context.
- Varun inspects output between sessions. If you're told "Session 1 had issues, fix X," fix X specifically. Do not refactor unrelated code.
- Varun will occasionally say "just build it." Even then, execute one session at a time and stop for review. The "just build it" does not override Compound engineering.
- Renuka is the co-reviewer. Her feedback comes through the app's feedback UI, not through Claude Code directly.
- Communication style: direct, structured, no warm filler, no em-dashes or en-dashes or hyphens in prose, no AI lingo.

---

## Phase 2 and 3 (future)

Do not build these in Phase 1. They exist here only so you know they're coming:

**Phase 2 (manual prompt tuning):** After Session 8, Varun runs 20 real briefs, identifies patterns in good vs bad outputs, and hand-edits `brief-expander.system.ts` and `brief-expander.examples.ts`. This is manual; no code changes beyond the prompt files.

**Phase 3 (Ralph loop):** Only if manual tuning plateaus. Creates `ralph/` directory with briefs.jsonl, rubric, judge script, and mutation strategies. Runs overnight. Budget ~$200/run. Do not create the `ralph/` directory during Phase 1.

---

## One final rule

If you are ever unsure whether to proceed or ask, ask. The cost of a clarifying question is seconds. The cost of building the wrong thing is hours.
