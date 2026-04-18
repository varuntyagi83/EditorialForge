import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
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

  return NextResponse.json({ ...scene, queued: isQueued(id) });
}
