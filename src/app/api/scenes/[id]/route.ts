import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { getSignedUrl } from "@/lib/storage/gcs";
import { isQueued } from "@/lib/queue/scene-queue";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const scene = await prisma.scene.findUnique({
    where: { id },
    include: {
      compositions: { orderBy: { createdAt: "desc" } },
      feedback: true,
    },
  });

  if (!scene) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [signedUrl, signedCompositions] = await Promise.all([
    scene.gcsPath ? getSignedUrl(scene.gcsPath, 3600) : Promise.resolve(null),
    Promise.all(
      scene.compositions.map(async (c) => ({
        id: c.id,
        headlineText: c.headlineText,
        gcsPath: c.gcsPath,
        signedUrl: await getSignedUrl(c.gcsPath, 3600),
        createdAt: c.createdAt,
      }))
    ),
  ]);

  return NextResponse.json({
    id: scene.id,
    briefId: scene.briefId,
    status: scene.status,
    gcsPath: scene.gcsPath,
    signedUrl,
    promptExpanded: scene.promptExpanded,
    negativePrompt: scene.negativePrompt,
    model: scene.model,
    aspectRatio: scene.aspectRatio,
    width: scene.width,
    height: scene.height,
    seed: scene.seed !== null ? Number(scene.seed) : null,
    errorMessage: scene.errorMessage,
    createdAt: scene.createdAt,
    feedback: scene.feedback,
    compositions: signedCompositions,
    queued: isQueued(id),
  });
}
