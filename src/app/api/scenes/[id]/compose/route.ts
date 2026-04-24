import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { ComposeSchema } from "@/lib/validation/scene";
import { compose } from "@/lib/compositor";
import { getSignedUrl } from "@/lib/storage/gcs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const scene = await prisma.scene.findUnique({ where: { id } });
  if (!scene) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (scene.status !== "READY" || !scene.gcsPath) {
    return NextResponse.json({ error: "Scene not ready" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ComposeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { layoutTemplateId, headlineText, subheadText, ctaText, logoAssetId } = parsed.data;

  const layoutTemplate = await prisma.layoutTemplate.findUnique({ where: { id: layoutTemplateId } });
  if (!layoutTemplate) return NextResponse.json({ error: "Layout template not found" }, { status: 404 });

  const logoAsset = logoAssetId
    ? await prisma.logoAsset.findUnique({ where: { id: logoAssetId } })
    : null;

  // Sign source URLs for Python compositor — 600s is enough, download happens immediately
  const [sceneUrl, logoUrl] = await Promise.all([
    getSignedUrl(scene.gcsPath, 600),
    logoAsset?.gcsPath ? getSignedUrl(logoAsset.gcsPath, 600) : Promise.resolve(null),
  ]);

  const { gcsPath } = await compose({
    sceneId: id,
    sceneUrl,
    layoutTemplate,
    headlineText,
    subheadText: subheadText ?? null,
    ctaText: ctaText ?? null,
    logoUrl,
  });

  const composition = await prisma.composition.create({
    data: {
      sceneId: id,
      layoutTemplateId,
      headlineText,
      subheadText: subheadText ?? null,
      ctaText: ctaText ?? null,
      logoAssetId: logoAssetId ?? null,
      gcsPath,
      gcsUrl: gcsPath, // placeholder — Phase C migration drops this column
    },
  });

  const signedUrl = await getSignedUrl(gcsPath, 3600);

  return NextResponse.json({
    id: composition.id,
    sceneId: composition.sceneId,
    layoutTemplateId: composition.layoutTemplateId,
    headlineText: composition.headlineText,
    subheadText: composition.subheadText,
    ctaText: composition.ctaText,
    gcsPath: composition.gcsPath,
    signedUrl,
    createdAt: composition.createdAt,
  }, { status: 201 });
}
