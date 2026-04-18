import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/server";
import { CreateCulturalContextSchema } from "@/lib/validation/cultural-context";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contexts = await prisma.culturalContext.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { referenceImages: true, briefs: true } } },
  });

  return NextResponse.json(contexts);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = CreateCulturalContextSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  const context = await prisma.culturalContext.create({
    data: {
      ...d,
      visualAnchors: d.visualAnchors as Prisma.InputJsonValue,
      fabricAndColor: d.fabricAndColor as Prisma.InputJsonValue,
      typicalProtagonists: d.typicalProtagonists as Prisma.InputJsonValue,
      atmosphericSignatures: d.atmosphericSignatures as Prisma.InputJsonValue,
      forbiddenCombinations: d.forbiddenCombinations as Prisma.InputJsonValue,
    },
  });
  return NextResponse.json(context, { status: 201 });
}
