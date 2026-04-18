import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/server";
import { UpdateCulturalContextSchema } from "@/lib/validation/cultural-context";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = UpdateCulturalContextSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  const j = (v: unknown) => v as Prisma.InputJsonValue;
  const context = await prisma.culturalContext
    .update({
      where: { id },
      data: {
        ...(d.name !== undefined && { name: d.name }),
        ...(d.region !== undefined && { region: d.region }),
        ...(d.category !== undefined && { category: d.category }),
        ...(d.referenceImageUrls !== undefined && { referenceImageUrls: d.referenceImageUrls }),
        ...(d.visualAnchors !== undefined && { visualAnchors: j(d.visualAnchors) }),
        ...(d.fabricAndColor !== undefined && { fabricAndColor: j(d.fabricAndColor) }),
        ...(d.typicalProtagonists !== undefined && { typicalProtagonists: j(d.typicalProtagonists) }),
        ...(d.atmosphericSignatures !== undefined && { atmosphericSignatures: j(d.atmosphericSignatures) }),
        ...(d.forbiddenCombinations !== undefined && { forbiddenCombinations: j(d.forbiddenCombinations) }),
      },
    })
    .catch(() => null);

  if (!context) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(context);
}
