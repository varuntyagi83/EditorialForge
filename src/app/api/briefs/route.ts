import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { getSignedUrl } from "@/lib/storage/gcs";
import { CreateBriefSchema } from "@/lib/validation/brief";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const briefs = await prisma.brief.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { scenes: true } },
      scenes: {
        where: { status: "READY" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { gcsPath: true, id: true },
      },
    },
  });

  const signed = await Promise.all(
    briefs.map(async (brief) => {
      const thumbPath = brief.scenes[0]?.gcsPath ?? null;
      return {
        id: brief.id,
        title: brief.title,
        category: brief.category,
        status: brief.status,
        createdAt: brief.createdAt,
        _count: brief._count,
        thumbSignedUrl: thumbPath ? await getSignedUrl(thumbPath, 3600) : null,
      };
    })
  );

  return NextResponse.json(signed);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = CreateBriefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const brief = await prisma.brief.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json(brief, { status: 201 });
}
