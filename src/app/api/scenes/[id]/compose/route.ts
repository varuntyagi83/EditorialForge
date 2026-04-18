import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { ComposeSchema } from "@/lib/validation/scene";
import { compose } from "@/lib/compositor";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const scene = await prisma.scene.findUnique({ where: { id } });
  if (!scene) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (scene.status !== "READY" || !scene.gcsUrl) {
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

  const { gcsPath, gcsUrl } = await compose({
    sceneId: id,
    sceneUrl: scene.gcsUrl,
    layoutTemplate,
    headlineText,
    subheadText: subheadText ?? null,
    ctaText: ctaText ?? null,
    logoUrl: logoAsset?.gcsUrl ?? null,
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
      gcsUrl,
    },
  });

  return NextResponse.json(composition, { status: 201 });
}
