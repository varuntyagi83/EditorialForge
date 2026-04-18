# Editorial Forge

AI-powered editorial image generation tool. Generates 4K scenes from structured creative briefs using Gemini Pro and Seedream.

## Stack

- Next.js 15 (App Router), TypeScript strict, Tailwind v4, shadcn/ui
- Railway Postgres via Prisma
- Auth.js v5 with magic link (Resend)
- Google Cloud Storage for image assets
- Hosted on Railway

## Local Setup

1. Copy `.env.example` to `.env.local` and fill in all variables
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma migrate dev`
5. Start dev server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for all required variables with descriptions.

## Deployment

See Session 8 of `EDITORIAL_FORGE_BUILD_PLAN.md`.
