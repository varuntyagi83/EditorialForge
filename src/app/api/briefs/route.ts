import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
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
        select: { gcsUrl: true, id: true },
      },
    },
  });

  return NextResponse.json(briefs);
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
