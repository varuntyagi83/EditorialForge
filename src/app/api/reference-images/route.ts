import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { CreateReferenceImageSchema } from "@/lib/validation/reference-image";
import { uploadImage } from "@/lib/storage/gcs";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const culturalContextId = searchParams.get("culturalContextId");

  const images = await prisma.referenceImage.findMany({
    where: {
      userId: user.id,
      ...(culturalContextId ? { culturalContextId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(images);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 422 });
  }

  const meta = CreateReferenceImageSchema.safeParse({
    culturalContextId: formData.get("culturalContextId") ?? undefined,
    tags: formData.getAll("tags"),
    sourceUrl: formData.get("sourceUrl") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });
  if (!meta.success) {
    return NextResponse.json({ error: meta.error.flatten() }, { status: 422 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split(".").pop() ?? "jpg";
  const gcsPath = `reference-images/${user.id}/${Date.now()}.${ext}`;
  const gcsUrl = await uploadImage(buffer, gcsPath, file.type || "image/jpeg");

  const image = await prisma.referenceImage.create({
    data: {
      userId: user.id,
      gcsPath,
      gcsUrl,
      culturalContextId: meta.data.culturalContextId ?? null,
      tags: meta.data.tags,
      sourceUrl: meta.data.sourceUrl ?? null,
      notes: meta.data.notes ?? null,
    },
  });

  return NextResponse.json(image, { status: 201 });
}
