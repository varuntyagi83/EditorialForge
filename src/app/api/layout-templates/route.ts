import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.layoutTemplate.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, aspectRatio: true },
  });

  return NextResponse.json(templates);
}
