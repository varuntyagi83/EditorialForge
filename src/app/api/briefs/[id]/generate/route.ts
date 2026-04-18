import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { GenerateScenesSchema } from "@/lib/validation/brief";
import { enqueueScene } from "@/lib/queue/scene-queue";
import { generateSceneWork } from "@/lib/queue/generation-worker";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = GenerateScenesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { count, aspectRatio } = parsed.data;

  const scenes = await prisma.$transaction(
    Array.from({ length: count }, () =>
      prisma.scene.create({
        data: {
          briefId: id,
          aspectRatio,
          promptExpanded: "",
          negativePrompt: "",
          model: "",
          status: "PENDING",
        },
        select: { id: true },
      })
    )
  );

  for (const scene of scenes) {
    enqueueScene(scene.id, () => generateSceneWork(scene.id));
  }

  return NextResponse.json({ sceneIds: scenes.map((s) => s.id) }, { status: 202 });
}
