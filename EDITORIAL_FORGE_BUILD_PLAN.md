# Editorial Forge — Build Plan (Compound Engineering, Railway Stack)

**Who this is for:** Varun Tyagi, building a tool for himself. Used solo, reviewed with Renuka. Not a product (yet).

**Methodology:** Compound engineering. 8 sessions. Human-in-loop between each session. Do not batch sessions into one Claude Code prompt.

**Stack (decided):**
- Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui
- **Railway Postgres** (via Railway's internal networking)
- **Auth.js (NextAuth v5)** with magic link email provider (Resend)
- Google Cloud Storage for image assets
- Hosting: Railway (Docker)
- Image model (primary): `gemini-3.1-pro-image-preview` — Nano Banana Pro
- Image model (secondary): Seedream 4 via fal.ai — for South Asian and East Asian faces
- Text model: GPT-4o for brief expansion
- Compositor: Python + Pillow + fonttools (port from AdForge, strip product logic)
- ORM: Prisma (clean Postgres workflow, better than raw SQL for this scale)

---

## Prerequisites Before Session 1

Do these by hand, before asking Claude Code anything:

1. **Create Railway project** named `editorial-forge`. Provision a Postgres database through Railway's "Add Service → Database → Postgres."
2. **Copy the DATABASE_URL** from Railway's Postgres service variables. Use `DATABASE_PUBLIC_URL` for local dev, `DATABASE_URL` for the deployed app (internal networking).
3. **Create GCS bucket** called `editorial-forge-assets` in the same project you use for AdForge. Create a service account with Object Admin role. Download the JSON key. Base64-encode it:
   ```bash
   cat gcs-key.json | base64 | tr -d '\n' > gcs-key.b64
   ```
4. **Sign up for Resend** (free tier: 3000 emails/month, plenty for a two-person app). Create an API key.
5. **Have ready:** OpenAI API key, Google Gemini API key, fal.ai API key.

---

## The 8-Session Build Plan

### Session 1 — Scaffold and infrastructure

Paste this verbatim into Claude Code:

> Scaffold a new Next.js 16 app called `editorial-forge` in the current directory. Requirements:
>
> - App Router, TypeScript strict mode, Tailwind v4, shadcn/ui configured
> - Prisma ORM installed and initialized; `prisma/schema.prisma` created with Postgres provider
> - Google Cloud Storage adapter at `src/lib/storage/gcs.ts` exposing: `uploadImage(buffer, path, contentType)`, `getSignedUrl(path, ttl)`, `deleteImage(path)`. Use `@google-cloud/storage`. Load the service account from env var `GCS_SERVICE_ACCOUNT_KEY_B64` (base64-encoded JSON — decode it in code and pass to the Storage constructor's `credentials` option).
> - Auth.js v5 configured at `src/lib/auth/config.ts` with:
>   - Email provider using Resend (`RESEND_API_KEY`, `EMAIL_FROM` env vars)
>   - PostgreSQL adapter (`@auth/prisma-adapter`)
>   - JWT session strategy (simpler than database sessions for this scale)
>   - Allowed email whitelist: hardcode two emails in `src/lib/auth/allowed-emails.ts`. The signIn callback rejects any email not on the list.
> - `/login` page with a single email input and "Send magic link" button. Use shadcn Form components.
> - `/api/auth/[...nextauth]/route.ts` wired to Auth.js
> - Middleware at `src/middleware.ts` that protects all routes except `/login`, `/api/auth/*`, and static assets — redirects unauthenticated requests to `/login`
> - Environment validation with zod at `src/lib/env.ts`. Required vars: `DATABASE_URL`, `GCS_SERVICE_ACCOUNT_KEY_B64`, `GCS_BUCKET_NAME`, `OPENAI_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `FAL_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `AUTH_SECRET`, `NEXTAUTH_URL`. Fail fast at startup.
> - Dockerfile that installs Node 20 + Python 3.11 (for the compositor later), runs `npx prisma generate` during build, runs as non-root user. Port 3000.
> - `.env.example` with every variable listed and commented
> - Root `CLAUDE.md` documenting the stack and model choices verbatim from this plan's header
> - Root `README.md` with setup instructions
>
> Do not port any AdForge product/angled-shot/composite code. This app has no concept of "products."
>
> Commit when `npm run dev` serves the login page at localhost:3000 and env validation fails cleanly if a variable is missing.

**Inspect after:** Start the dev server. Confirm login page loads. Confirm env validation blocks startup if you rename one of the required env vars. Send yourself a magic link and confirm you can log in. Do not proceed until all three work.

---

### Session 2 — Prisma schema and migrations

> Define the Prisma schema at `prisma/schema.prisma`. Include these models:
>
> ```prisma
> model User {
>   id            String    @id @default(uuid())
>   email         String    @unique
>   name          String?
>   emailVerified DateTime?
>   image         String?
>   createdAt     DateTime  @default(now())
>   accounts      Account[]
>   sessions      Session[]
>   briefs        Brief[]
>   referenceImages ReferenceImage[]
>   logoAssets    LogoAsset[]
>   feedback      Feedback[]
> }
>
> // Auth.js required models: Account, Session, VerificationToken
> // Follow the standard Auth.js Prisma adapter schema exactly
>
> model Brief {
>   id                    String    @id @default(uuid())
>   userId                String
>   user                  User      @relation(fields: [userId], references: [id])
>   title                 String
>   culturalContextId     String?
>   culturalContext       CulturalContext? @relation(fields: [culturalContextId], references: [id])
>   category              Category
>   protagonistArchetype  String
>   environment           String
>   productFamily         String?
>   productIntegration    ProductIntegration
>   headline              String
>   subhead               String?
>   cta                   String?
>   notes                 String?
>   status                BriefStatus @default(DRAFT)
>   createdAt             DateTime  @default(now())
>   updatedAt             DateTime  @updatedAt
>   scenes                Scene[]
>   @@index([createdAt(sort: Desc)])
>   @@index([userId])
> }
>
> model Scene {
>   id              String    @id @default(uuid())
>   briefId         String
>   brief           Brief     @relation(fields: [briefId], references: [id], onDelete: Cascade)
>   promptExpanded  String    @db.Text
>   negativePrompt  String    @db.Text
>   model           String
>   seed            BigInt?
>   gcsPath         String?
>   gcsUrl          String?
>   width           Int?
>   height          Int?
>   aspectRatio     String
>   status          SceneStatus @default(PENDING)
>   errorMessage    String?
>   createdAt       DateTime  @default(now())
>   compositions    Composition[]
>   feedback        Feedback[]
>   @@index([briefId])
>   @@index([createdAt(sort: Desc)])
> }
>
> model Composition {
>   id                String    @id @default(uuid())
>   sceneId           String
>   scene             Scene     @relation(fields: [sceneId], references: [id], onDelete: Cascade)
>   layoutTemplateId  String
>   layoutTemplate    LayoutTemplate @relation(fields: [layoutTemplateId], references: [id])
>   headlineText      String
>   subheadText       String?
>   ctaText           String?
>   logoAssetId       String?
>   logoAsset         LogoAsset? @relation(fields: [logoAssetId], references: [id])
>   gcsPath           String
>   gcsUrl            String
>   createdAt         DateTime  @default(now())
>   @@index([sceneId])
> }
>
> model LayoutTemplate {
>   id             String    @id @default(uuid())
>   name           String
>   aspectRatio    String
>   headlineZone   Json
>   subheadZone    Json?
>   ctaZone        Json?
>   logoZone       Json?
>   typography     Json
>   createdAt      DateTime  @default(now())
>   compositions   Composition[]
> }
>
> model CulturalContext {
>   id                     String    @id @default(uuid())
>   name                   String
>   region                 String
>   category               Category
>   visualAnchors          Json
>   fabricAndColor         Json
>   typicalProtagonists    Json
>   atmosphericSignatures  Json
>   forbiddenCombinations  Json
>   referenceImageUrls     String[]
>   createdAt              DateTime  @default(now())
>   briefs                 Brief[]
>   referenceImages        ReferenceImage[]
> }
>
> model ReferenceImage {
>   id                String    @id @default(uuid())
>   userId            String
>   user              User      @relation(fields: [userId], references: [id])
>   culturalContextId String?
>   culturalContext   CulturalContext? @relation(fields: [culturalContextId], references: [id])
>   gcsPath           String
>   gcsUrl            String
>   tags              String[]
>   sourceUrl         String?
>   notes             String?
>   createdAt         DateTime  @default(now())
>   @@index([culturalContextId])
>   @@index([userId])
> }
>
> model LogoAsset {
>   id           String    @id @default(uuid())
>   userId       String
>   user         User      @relation(fields: [userId], references: [id])
>   brandName    String
>   variant      String
>   gcsPath      String
>   gcsUrl       String
>   createdAt    DateTime  @default(now())
>   compositions Composition[]
>   @@index([userId])
> }
>
> model Feedback {
>   id         String    @id @default(uuid())
>   userId     String
>   user       User      @relation(fields: [userId], references: [id])
>   targetType FeedbackTargetType
>   targetId   String
>   verdict    FeedbackVerdict
>   comment    String?
>   createdAt  DateTime  @default(now())
>   sceneId    String?
>   scene      Scene?    @relation(fields: [sceneId], references: [id])
>   @@index([targetId])
> }
>
> enum Category {
>   INDIAN_FESTIVAL
>   ABSURDIST_WESTERN
>   PREMIUM_LIFESTYLE
>   OTHER
> }
>
> enum ProductIntegration {
>   HELD
>   PLACED
>   CONSUMED
>   CENTRAL
>   ABSENT
> }
>
> enum BriefStatus { DRAFT GENERATING READY ARCHIVED }
> enum SceneStatus { PENDING GENERATING READY FAILED }
> enum FeedbackTargetType { SCENE COMPOSITION }
> enum FeedbackVerdict { LOVE GOOD MEH REJECT }
> ```
>
> After writing the schema, run `npx prisma migrate dev --name init`. Then create a seed script at `prisma/seed.ts` that inserts:
>
> - 3 LayoutTemplate rows: 1:1, 16:9, 4:5. Zone coordinates in percentage (0-100) of canvas. Typography JSON includes font family, size, weight, color, letter spacing.
> - 3 CulturalContext rows, one per main Category enum value. Populate JSONB fields with rich, specific content — not placeholders.
>
> For INDIAN_FESTIVAL seed "Pujo Bengal" with:
> - visualAnchors: specific pandal architecture details, Durga idol positioning, dhaak drummer details, marigold garland positioning, specific Kolkata street geometry
> - fabricAndColor: white and red saree with red border specifics, kurta-pyjama white with zari work, specific gold jewelry types, palette references
> - typicalProtagonists: age ranges, body language, gaze direction patterns, group composition norms
> - atmosphericSignatures: evening light at 6pm, incense haze, dhaak drum rhythm visualized as crowd movement, marigold petals in air
> - forbiddenCombinations: explicit list — no mixing with Diwali/Holi visuals, no Western Christmas elements
>
> For ABSURDIST_WESTERN seed "Suburban Americana" with similar specificity. For PREMIUM_LIFESTYLE seed "Kinfolk Nordic" likewise.
>
> Wire up the seed script in package.json under `"prisma": { "seed": "tsx prisma/seed.ts" }`. Run `npx prisma db seed` to populate.
>
> Commit.

**Inspect after:** Open the database (Railway's data browser, TablePlus, or `npx prisma studio`). Read the three cultural context rows. If any feel generic, send it back with "make these 3x more specific and concrete." This table is the single most important asset in the app.

---

### Session 3 — The brief expander (CRITICAL — do not batch with anything else)

This is the highest-leverage component. Everything downstream depends on what this produces. Budget a full day.

> Implement `src/lib/ai/brief-expander.ts`.
>
> Function signature:
> ```typescript
> export async function expandBrief(params: {
>   brief: Brief;
>   culturalContext: CulturalContext | null;
>   referenceImages: ReferenceImage[];
>   variationIndex: number;  // 0-7, biases toward different framings
> }): Promise<ExpandedPrompt>;
>
> export type ExpandedPrompt = {
>   imagePrompt: string;
>   negativePrompt: string;
>   referenceImageUrls: string[];  // max 3
>   systemFingerprint: string;     // hash of prompt template version
> };
> ```
>
> Implementation:
>
> - Call GPT-4o via `openai` npm package, temperature 0.4
> - System prompt lives in `src/lib/ai/prompts/brief-expander.system.ts` as a versioned constant — export `VERSION` alongside `PROMPT`
> - User message includes the brief, the full cultural context JSONB, and the variation index
>
> The system prompt instructs GPT-4o to produce an image prompt structured in exactly these 9 layers in priority order:
>
> 1. **Cultural anchor** — specific concrete visual signifiers from the cultural context JSONB
> 2. **Protagonist specification** — age, ethnicity, attire with fabric detail, posture, expression, skin with texture detail
> 3. **Environment** — architecture, time of day, weather, specific location detail
> 4. **Product integration** — held / placed / consumed / central / absent
> 5. **Light specification** — source, quality, direction, color temperature, shadow character
> 6. **Camera specification** — lens mm, aperture, distance, angle, film stock if applicable
> 7. **Material detail** — fabric weave, skin pores, surface imperfections, weathering
> 8. **Atmospheric detail** — particulate, haze, ambient dust, light bloom
> 9. **Negative prompt clause** — must forbid: rendered text, watermarks, logos as overlay, UI elements, AI artifacts, melted hands, warped anatomy
>
> Include 3 few-shot examples in `src/lib/ai/prompts/brief-expander.examples.ts`. Write them at 250+ words each with concrete detail in every layer:
>
> **Example 1 (INDIAN_FESTIVAL):**
> Short brief: "Liquid Death at the Maut Ka Kua at a Rajasthan mela"
> Expanded: [write 250+ words covering silodrome wood texture, dust quality, rider leather-and-denim, oblique afternoon light through boards, 35mm lens, Kodak Portra 800 film stock, diesel smoke in air, specific crowd composition above, etc.]
>
> **Example 2 (ABSURDIST_WESTERN):**
> Short brief: "Suburban dad knight defending the grocery store aisle"
> Expanded: [write 250+ words: fluorescent ceiling lights, specific aisle geometry and shelving, armor-over-cargo-shorts, documentary lens 28mm, deadpan expression, cereal boxes in background with readable but invented brand names, etc.]
>
> **Example 3 (PREMIUM_LIFESTYLE):**
> Short brief: "Japanese whisky at a mid-century Tokyo bar at golden hour"
> Expanded: [write 250+ words: teak bar grain, Hario glassware specifics, 85mm prime at f/1.4, Kodak Portra 400 film, humidity condensation on glass, specific bar light temperature 2800K, etc.]
>
> **The 3 few-shot examples are where your taste becomes the system's taste.** If the first draft feels generic, iterate until it reads like a cinematographer briefed it.
>
> Write Vitest tests at `src/lib/ai/__tests__/brief-expander.test.ts`:
> - Expanded prompt between 800 and 1800 characters
> - Negative prompt includes: "no rendered text", "no watermark", "no overlay logo"
> - variationIndex=0 and variationIndex=3 for the same brief produce different outputs
>
> Commit when tests pass.

**Inspect after:** Manually run the expander on 5 briefs you make up. Read each output prompt slowly. Ask: would I give this prompt to a human photographer and expect Image 3 or Image 4 quality back? If no, iterate. Do not move to Session 4 until the output makes you nod.

---

### Session 4 — Scene generator (Nano Banana Pro + Seedream fallback)

> Implement `src/lib/ai/scene-generator.ts`.
>
> Port from adforge-railway's `generateBackgrounds` function:
> - `fetchGeminiWithRetry` — exponential backoff on 429 and 503
> - `x-goog-api-key` header authentication
> - AbortController with 180-second timeout
>
> Differences from AdForge:
> - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-image-preview:generateContent` (**PRO, not FLASH**)
> - `temperature: 0.7` — editorial wants more creative latitude
> - `imageSize: '4K'`, `responseModalities: ['IMAGE']`
> - Accept up to 3 reference images. Download from GCS signed URLs, convert to base64, pass as `inline_data` parts BEFORE the text prompt.
> - No product cutout step. Single call, single image out.
>
> Signature:
> ```typescript
> export async function generateScene(params: {
>   expandedPrompt: ExpandedPrompt;
>   aspectRatio: '1:1' | '16:9' | '4:5' | '9:16';
>   variationSeed?: number;
> }): Promise<{
>   imageBuffer: Buffer;
>   mimeType: string;
>   seed: number;
>   promptUsed: string;
> }>;
> ```
>
> Also implement `src/lib/ai/seedream-generator.ts` using the fal.ai client:
> - Endpoint: `fal-ai/bytedance/seedream-v4`
> - Same signature as generateScene
> - Supports same aspect ratios
>
> Add a dispatcher at `src/lib/ai/scene-dispatcher.ts` that picks Nano Banana Pro by default but routes to Seedream when `culturalContext.region` is in `['south-asia', 'east-asia']`. Log which model was used for each generation.
>
> After generating the buffer, upload to GCS at path `scenes/{briefId}/{sceneId}.{ext}`. Update the Scene row with `gcsPath`, `gcsUrl`, `width`, `height`, `status: READY`.
>
> On failure, update Scene with `status: FAILED` and `errorMessage`.
>
> Commit when you can generate a scene end-to-end via a test script and open the GCS URL in a browser.

**Inspect after:** Generate 3 scenes from 3 briefs across different categories. If quality is at 60%+ you're on track. If it's 40% or worse, the brief expander is the problem, not the scene generator. Go back to Session 3.

---

### Session 5 — API routes

> Implement these API routes under `src/app/api/`. All use Auth.js session check via middleware. Whitelisted email enforcement via `src/lib/auth/allowed-emails.ts`.
>
> - `POST /api/briefs` — create brief
> - `GET /api/briefs` — list all briefs (yours + Renuka's)
> - `GET /api/briefs/[id]` — brief with scenes and compositions
> - `PATCH /api/briefs/[id]` — update brief fields
> - `POST /api/briefs/[id]/generate` — fan out N variations (default 4, max 8). Create N Scene rows with status PENDING, kick off background generation, return scene IDs immediately.
> - `GET /api/scenes/[id]` — fetch scene status and URL
> - `POST /api/scenes/[id]/feedback` — record verdict + comment
> - `POST /api/scenes/[id]/compose` — run compositor, create Composition row
> - `GET /api/compositions/[id]` — fetch composition
> - `GET /api/cultural-contexts` — list all
> - `POST /api/cultural-contexts` — create new
> - `PATCH /api/cultural-contexts/[id]` — update JSONB fields
> - `POST /api/reference-images` — upload image to GCS, create DB row with tags + optional cultural_context link
> - `GET /api/reference-images` — list with filters
>
> Every route: zod validation on body (schemas in `src/lib/validation/`).
>
> Background generation queue: use a simple in-process `Map<string, Promise<void>>` keyed by scene ID at `src/lib/queue/scene-queue.ts`. No BullMQ, no Redis. This is a 2-person app. Map is fine.
>
> The generation worker:
> 1. Load scene, brief, cultural context, reference images from DB
> 2. Expand brief with variationIndex (the nth scene in the fan-out gets variation n)
> 3. Dispatch to scene generator (Nano Banana Pro or Seedream based on context region)
> 4. Upload buffer to GCS
> 5. Update scene row to READY
>
> Commit.

**Inspect after:** Hit each route via curl or REST client. Confirm non-whitelisted email gets 401 on every route. Confirm you can create a brief, generate 4 variations, poll until ready.

---

### Session 6 — Compositor

> Port `scripts/composite_final_asset.py` from adforge-railway to `scripts/compose_editorial.py`. Strip:
> - Product safe zones
> - Product positioning logic
> - Any function signature that takes product references
>
> Keep and simplify:
> - Typography rendering (headline, subhead, CTA)
> - Logo placement
> - Layout template JSON parsing
> - Safe zone awareness for text only
>
> Add: drop-shadow on text when placed over busy background regions. Detect by sampling pixel variance under each text zone. If variance exceeds a threshold, render a subtle 2px shadow offset at 40% opacity.
>
> Input contract (stdin JSON):
> ```json
> {
>   "scene_url": "https://storage.googleapis.com/...",
>   "layout_template": { /* full JSON from DB */ },
>   "headline_text": "Hydrate like you're already dead",
>   "subhead_text": "Gravity is optional. Hydration is mandatory." | null,
>   "cta_text": "Murder your thirst" | null,
>   "logo_url": "https://storage.googleapis.com/..." | null,
>   "output_path": "/tmp/composition-xyz.png"
> }
> ```
>
> Output: writes PNG to output_path, prints `{"success": true, "path": "..."}` to stdout.
>
> Node wrapper at `src/lib/compositor/index.ts`:
> - Download scene from GCS to temp file
> - Download logo (if provided) from GCS to temp file
> - Build input JSON with local file paths
> - Spawn `python3 scripts/compose_editorial.py` with stdin piped
> - Read output file, upload to GCS at `compositions/{compositionId}.png`
> - Return GCS URL
>
> Commit when you can compose a test scene with typography and see the PNG in GCS.

**Inspect after:** Compose 2 scenes with different layouts. Check typography at 4K — sharp, no pixelation. Check drop-shadow kicks in on busy backgrounds. Check logo alignment is pixel-correct.

---

### Session 7 — Web UI

> Build the UI. Desktop-first, shadcn/ui throughout, no mobile optimization.
>
> Routes:
> - `/login` — already built in Session 1
> - `/` — brief gallery: yours + Renuka's, most recent first, thumbnail grid showing best scene per brief
> - `/briefs/new` — brief creation form
> - `/briefs/[id]` — brief detail: editable fields on left (sticky), scenes gallery on right in 2x2 grid per variation batch, click to enlarge
> - `/briefs/[id]/scenes/[sceneId]` — single scene view: large preview, feedback buttons (Love / Good / Meh / Reject), comment field, "Compose" action revealing layout picker + editable copy fields
> - `/compositions/[id]` — final composition with download button (PNG at 4K)
> - `/library/contexts` — list of cultural contexts with category filter. Click to open JSONB editor (use a Monaco or CodeMirror component)
> - `/library/references` — reference image library: upload, tag, filter by tag or cultural context
>
> Brief form fields:
> - Title (text)
> - Category (select enum)
> - Cultural context (select, filtered by category)
> - Protagonist archetype (text)
> - Environment (textarea, 3 rows)
> - Product family (text, optional)
> - Product integration (select enum)
> - Headline (text)
> - Subhead (text, optional)
> - CTA (text, optional)
> - Notes (textarea, 5 rows)
>
> On brief save, show a "Generate 4 variations" button. Clicking calls `POST /api/briefs/[id]/generate`, shows 4 skeleton cards, polls `/api/scenes/[id]` every 3 seconds until all 4 are READY or FAILED.
>
> Also build: global nav with sidebar links to Briefs, Library → Contexts, Library → References, Logos. User avatar in top-right with sign-out.
>
> Commit.

**Inspect after:** Use the app end-to-end. Create a brief. Generate. Give feedback. Compose with a layout template. Download PNG. If anything feels clunky, fix it now before Renuka sees it.

---

### Session 8 — Railway deployment

> Deploy to the Railway project created in the prerequisites step.
>
> Steps:
> 1. Link the local repo to the Railway project via `railway link`
> 2. Configure the existing Postgres service. Verify `DATABASE_URL` reference variable is set.
> 3. Add environment variables via Railway CLI or dashboard: `GCS_SERVICE_ACCOUNT_KEY_B64`, `GCS_BUCKET_NAME`, `OPENAI_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `FAL_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `AUTH_SECRET`, `NEXTAUTH_URL` (set to the Railway domain)
> 4. Configure a build command: `npx prisma migrate deploy && npm run build`
> 5. Configure a start command: `npm start`
> 6. Deploy: `railway up`
> 7. Run the seed script once in production: `railway run npx prisma db seed`
> 8. Configure a custom domain if desired: `editorial.raygency.com` or `editorial.meetvaruntyagi.com`
>
> Verify end-to-end:
> - Login works (magic link arrives via Resend)
> - Brief creation persists
> - Generation completes and returns a visible scene
> - Composition generates and is downloadable
>
> Share the URL with Renuka.
>
> Commit.

**Inspect after:** Send Renuka the URL. Have her create one real brief from her perspective. Watch her use the app. The friction points you observe in her first 10 minutes are your Phase 2 backlog.

---

## What you have after Session 8

A working tool. Hosted on Railway. Postgres on Railway. GCS for images. Accessible to you and Renuka only. Generates 4 scenes per brief at 4K, composes typography deterministically, stores feedback.

Quality on first generation will be 60–75% of the Image 3 / Image 4 target. The best variation out of 4 will frequently land at 85%. The last 10% closes through curation and prompt iteration, not code.

---

## Phase 2: Hand-tuning before Ralph

Do this for one week before running Ralph:

1. Generate 20 briefs across all three categories
2. Note which 5 produced the best output and which 5 produced the worst
3. Read the expanded prompts for all 10. Patterns will emerge.
4. Edit `brief-expander.system.ts` and `brief-expander.examples.ts` based on the patterns
5. Regenerate the worst 5 and see if they improved

This manual loop usually closes more of the quality gap than Ralph does, because you're encoding real observation rather than gradient-descending against a rubric.

---

## Phase 3: Ralph loop (after manual tuning plateaus)

Only once manual tuning stops producing improvements, set up Ralph:

```
ralph/
  briefs.jsonl       # 15-20 test briefs
  rubric.md          # 5-axis rubric: culture / protagonist / light / integration / AI-tells
  judge.py           # GPT-4o as judge, 0-10 per axis
  mutate.py          # Mutations of brief-expander system prompt
  loop.sh            # generate → judge → mutate → repeat
  results/           # per-iteration artifacts
```

Budget: ~$200 per overnight run. 30-40 iterations. Accept the winner if mean score improves meaningfully; else try different mutation strategies.

---

## Anti-scope

Do not build in Phase 1:
- Multi-tenant anything
- Billing
- Teams / roles / invites
- A canvas editor for layouts
- Mobile responsive design
- Sora-2 video
- Integrations with Meta / Figma / ad platforms
- Public marketing pages
- Analytics dashboards
- A second auth provider beyond magic link

---

## The emphasis that matters

Session 3 is where this tool earns its identity. The three few-shot examples in `brief-expander.examples.ts` are your taste encoded into a system. Write them carefully. Rewrite them twice. Everything downstream is replaceable; those examples are not.
