import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { FeedbackSchema } from "@/lib/validation/scene";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const scene = await prisma.scene.findUnique({ where: { id } });
  if (!scene) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: user.id,
      targetType: "SCENE",
      targetId: id,
      sceneId: id,
      verdict: parsed.data.verdict,
      comment: parsed.data.comment ?? null,
    },
  });

  return NextResponse.json(feedback, { status: 201 });
}
