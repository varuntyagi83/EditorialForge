import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/edge";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { ArrowLeft, Download } from "lucide-react";

type Params = { params: Promise<{ id: string }> };

export default async function CompositionPage({ params }: Params) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const composition = await prisma.composition.findUnique({
    where: { id },
    include: { layoutTemplate: true, scene: { select: { briefId: true } } },
  });

  if (!composition) notFound();

  return (
    <AppShell user={session.user}>
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <div className="border-b border-neutral-800 px-6 py-4 flex items-center gap-4">
          <Link
            href={`/briefs/${composition.scene.briefId}/scenes/${composition.sceneId}`}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-white">
              {composition.headlineText}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {composition.layoutTemplate.name} &bull; {composition.layoutTemplate.aspectRatio}
            </p>
          </div>
          <a
            href={composition.gcsUrl}
            download
            className="flex items-center gap-2 px-3 py-2 bg-white text-neutral-950 rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <Download className="size-4" />
            Download PNG
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <img
            src={composition.gcsUrl}
            alt={composition.headlineText}
            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {(composition.subheadText || composition.ctaText) && (
          <div className="border-t border-neutral-800 px-6 py-4 flex gap-8 text-sm">
            {composition.subheadText && (
              <div>
                <p className="text-xs text-neutral-600 mb-1">Subhead</p>
                <p className="text-neutral-300">{composition.subheadText}</p>
              </div>
            )}
            {composition.ctaText && (
              <div>
                <p className="text-xs text-neutral-600 mb-1">CTA</p>
                <p className="text-neutral-300">{composition.ctaText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
