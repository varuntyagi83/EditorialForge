import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/edge";
import { prisma } from "@/lib/db";
import { getSignedUrl } from "@/lib/storage/gcs";
import { AppShell } from "@/components/layout/app-shell";
import { BriefDetail } from "./brief-detail";

type Params = { params: Promise<{ id: string }> };

export default async function BriefPage({ params }: Params) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const [brief, contexts] = await Promise.all([
    prisma.brief.findUnique({
      where: { id },
      include: {
        scenes: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.culturalContext.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true },
    }),
  ]);

  if (!brief) notFound();

  const scenes = await Promise.all(
    brief.scenes.map(async (s) => ({
      id: s.id,
      status: s.status,
      signedUrl: s.gcsPath ? await getSignedUrl(s.gcsPath, 3600) : null,
      errorMessage: s.errorMessage,
      createdAt: s.createdAt.toISOString(),
    }))
  );

  const briefData = {
    id: brief.id,
    title: brief.title,
    category: brief.category,
    culturalContextId: brief.culturalContextId,
    protagonistArchetype: brief.protagonistArchetype,
    environment: brief.environment,
    productFamily: brief.productFamily,
    productIntegration: brief.productIntegration,
    headline: brief.headline,
    subhead: brief.subhead,
    cta: brief.cta,
    notes: brief.notes,
  };

  return (
    <AppShell user={session.user}>
      <BriefDetail brief={briefData} scenes={scenes} contexts={contexts} />
    </AppShell>
  );
}
