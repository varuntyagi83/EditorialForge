import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";
import { CreateReferenceImageSchema } from "@/lib/validation/reference-image";
import { uploadImage, getSignedUrl } from "@/lib/storage/gcs";

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

  const signed = await Promise.all(
    images.map(async (img) => ({
      id: img.id,
      gcsPath: img.gcsPath,
      signedUrl: await getSignedUrl(img.gcsPath, 3600),
      tags: img.tags,
      sourceUrl: img.sourceUrl,
      notes: img.notes,
      culturalContextId: img.culturalContextId,
      createdAt: img.createdAt,
    }))
  );

  return NextResponse.json(signed);
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
  await uploadImage(buffer, gcsPath, file.type || "image/jpeg");

  const image = await prisma.referenceImage.create({
    data: {
      userId: user.id,
      gcsPath,
      gcsUrl: gcsPath, // placeholder — Phase C migration drops this column
      culturalContextId: meta.data.culturalContextId ?? null,
      tags: meta.data.tags,
      sourceUrl: meta.data.sourceUrl ?? null,
      notes: meta.data.notes ?? null,
    },
  });

  const signedUrl = await getSignedUrl(gcsPath, 3600);

  return NextResponse.json({
    id: image.id,
    gcsPath: image.gcsPath,
    signedUrl,
    tags: image.tags,
    sourceUrl: image.sourceUrl,
    notes: image.notes,
    culturalContextId: image.culturalContextId,
    createdAt: image.createdAt,
  }, { status: 201 });
}
