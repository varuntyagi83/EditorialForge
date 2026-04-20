import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { UpdateBriefSchema } from "@/lib/validation/brief";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const brief = await prisma.brief.findUnique({
    where: { id },
    include: {
      culturalContext: true,
      scenes: {
        orderBy: { createdAt: "asc" },
        include: {
          compositions: { orderBy: { createdAt: "desc" } },
          feedback: true,
        },
      },
    },
  });

  if (!brief) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const serialized = {
    ...brief,
    scenes: brief.scenes.map((s) => ({ ...s, seed: s.seed !== null ? Number(s.seed) : null })),
  };
  return NextResponse.json(serialized);
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = UpdateBriefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const brief = await prisma.brief
    .update({ where: { id }, data: parsed.data })
    .catch(() => null);

  if (!brief) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(brief);
}
