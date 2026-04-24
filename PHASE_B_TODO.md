# Phase B cleanup checklist

Items left intentionally incomplete in Phase A. Do not start Phase B until
Phase A is verified working on the Railway deployment.

---

## Temporary inline URL construction (must remove in Phase B)

### `src/lib/compositor/index.ts:94`
```ts
// Phase A temporary: public URL stored until Phase B removes gcsUrl column
const gcsUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME!}/${gcsPath}`;
```
Phase B removes `gcsUrl` from `ComposeResult`, stops writing it to the
`Composition` table, and signs `composition.gcsPath` at read time in:
- `src/app/api/scenes/[id]/compose/route.ts` (sign before returning response)
- `src/app/api/compositions/[id]/route.ts` (sign at GET response time)
- The compositor also receives `sceneUrl` and `logoUrl` as raw public URLs
  from `compose/route.ts`; those must become signed URLs (600s TTL) before
  being passed to the Python script.

### `src/app/api/reference-images/route.ts:54`
```ts
// Phase A temporary: public URL stored until Phase B removes gcsUrl column
const gcsUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME!}/${gcsPath}`;
```
Phase B stops writing `gcsUrl` on upload and signs `gcsPath` at response
time in the GET handler instead.

---

## Prop name inconsistency in BriefDetail

`src/app/briefs/[id]/page.tsx` passes scenes to `BriefDetail` with a field
called `gcsUrl` that now carries a signed URL, not a GCS URL. The prop
type in `src/app/briefs/[id]/brief-detail.tsx:40` also says `gcsUrl`.

Phase B rename: `gcsUrl` -> `imageUrl` in the scene prop type and all
reference sites in `brief-detail.tsx`. Low risk, cosmetic only — do it
alongside the other Phase B changes.

---

## Dead code to remove

`src/lib/ai/brief-expander.ts:33` assembles `referenceImageUrls` from
`referenceImages[].gcsUrl` but the value is never passed to GPT-4o and
never consumed by `generation-worker.ts`. Remove the field from
`ExpandedPrompt` and delete line 33.

---

## Phase B scope (write path + APIs)

Change 3: `src/lib/compositor/index.ts` — remove `gcsUrl` from `ComposeResult`  
Change 4: `src/app/api/scenes/[id]/compose/route.ts` — sign `scene.gcsPath`
          (600s) for compositor input; sign composition path (3600s) in response  
Change 5: `src/app/api/reference-images/route.ts` — sign at GET response time  
Change 6: `src/app/api/scenes/[id]/route.ts` — sign `scene.gcsPath` and each
          `composition.gcsPath` in the JSON response  
Change 7: `src/app/api/briefs/route.ts` — sign scene thumbnail in response  

## Migration (last, after Phase B verified)

Drop `gcsUrl` columns from all four tables. All rows have `gcsPath` set —
confirmed by prod query on 2026-04-25 (all five safety checks returned 0).

```sql
ALTER TABLE "Scene" DROP COLUMN "gcsUrl";
ALTER TABLE "Composition" DROP COLUMN "gcsUrl";
ALTER TABLE "ReferenceImage" DROP COLUMN "gcsUrl";
ALTER TABLE "LogoAsset" DROP COLUMN "gcsUrl";
```
