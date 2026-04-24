# Phase B cleanup checklist

## Status: COMPLETE

All items resolved in Phase B commit. Phase C (migration) is the only
remaining step.

---

## Phase C — Migration (run after Phase B is verified in production)

Drop `gcsUrl` columns from all four tables. All rows have `gcsPath` set —
confirmed by prod query on 2026-04-25 (all five safety checks returned 0).

`gcsUrl` placeholder values in `Composition` and `ReferenceImage` rows
created after Phase B deployment will contain the `gcsPath` string rather
than a URL — this is intentional and safe to drop.

```sql
ALTER TABLE "Scene" DROP COLUMN "gcsUrl";
ALTER TABLE "Composition" DROP COLUMN "gcsUrl";
ALTER TABLE "ReferenceImage" DROP COLUMN "gcsUrl";
ALTER TABLE "LogoAsset" DROP COLUMN "gcsUrl";
```

After running the SQL, remove the `gcsUrl` fields from `prisma/schema.prisma`
and run `npx prisma generate` to update the Prisma client. No `prisma migrate`
needed since the SQL runs directly against prod.

---

## Resolved in Phase B

- [x] `compositor/index.ts` — removed `gcsUrl` from `ComposeResult`; Python
      compositor now receives signed URLs (600s) for `scene_url` and `logo_url`
- [x] `reference-images/route.ts` — POST stores `gcsPath` as `gcsUrl` placeholder;
      GET signs at 3600s and returns `signedUrl`
- [x] `gcsUrl` prop name in `BriefDetail` — renamed to `signedUrl` throughout
- [x] `brief-expander.ts` — `referenceImageUrls` was NOT dead code; `scene-generator.ts`
      uses it for Gemini multimodal. Refactored: `expandBrief` now accepts
      `referenceImageUrls: string[]` directly; `generation-worker.ts` signs the
      reference image paths at 3600s before calling `expandBrief`
- [x] All API routes (`scenes/[id]`, `briefs`, `compositions/[id]`, `compose`)
      return `signedUrl` instead of raw `gcsUrl`
