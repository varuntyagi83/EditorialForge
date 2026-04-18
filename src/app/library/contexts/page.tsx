import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/edge";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { ContextsClient } from "./contexts-client";

export default async function ContextsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const contexts = await prisma.culturalContext.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { briefs: true, referenceImages: true } } },
  });

  const data = contexts.map((c) => ({
    id: c.id,
    name: c.name,
    region: c.region,
    category: c.category,
    visualAnchors: c.visualAnchors,
    fabricAndColor: c.fabricAndColor,
    typicalProtagonists: c.typicalProtagonists,
    atmosphericSignatures: c.atmosphericSignatures,
    forbiddenCombinations: c.forbiddenCombinations,
    briefCount: c._count.briefs,
    referenceCount: c._count.referenceImages,
  }));

  return (
    <AppShell user={session.user}>
      <ContextsClient contexts={data} />
    </AppShell>
  );
}
