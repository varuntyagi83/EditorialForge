import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { getSignedUrl } from "@/lib/storage/gcs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const composition = await prisma.composition.findUnique({
    where: { id },
    include: { layoutTemplate: true, logoAsset: true },
  });

  if (!composition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const signedUrl = await getSignedUrl(composition.gcsPath, 3600);

  return NextResponse.json({
    id: composition.id,
    sceneId: composition.sceneId,
    layoutTemplateId: composition.layoutTemplateId,
    layoutTemplate: composition.layoutTemplate,
    headlineText: composition.headlineText,
    subheadText: composition.subheadText,
    ctaText: composition.ctaText,
    logoAssetId: composition.logoAssetId,
    logoAsset: composition.logoAsset,
    gcsPath: composition.gcsPath,
    signedUrl,
    createdAt: composition.createdAt,
  });
}
