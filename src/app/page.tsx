import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/edge";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { Plus } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  INDIAN_FESTIVAL: "Indian Festival",
  ABSURDIST_WESTERN: "Absurdist Western",
  PREMIUM_LIFESTYLE: "Premium Lifestyle",
  OTHER: "Other",
};

export default async function GalleryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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

  return (
    <AppShell user={session.user}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg font-semibold text-white">Briefs</h1>
          <Link
            href="/briefs/new"
            className="flex items-center gap-2 px-3 py-2 bg-white text-neutral-950 rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <Plus className="size-4" />
            New Brief
          </Link>
        </div>

        {briefs.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-neutral-500 mb-3">No briefs yet.</p>
            <Link
              href="/briefs/new"
              className="text-sm text-neutral-400 underline underline-offset-2 hover:text-white transition-colors"
            >
              Create your first brief
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {briefs.map((brief) => {
              const thumb = brief.scenes[0]?.gcsUrl;
              return (
                <Link
                  key={brief.id}
                  href={`/briefs/${brief.id}`}
                  className="group block bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-colors"
                >
                  <div className="aspect-[4/5] bg-neutral-800 relative overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={brief.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                        No scenes yet
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate">
                      {brief.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-neutral-500">
                        {CATEGORY_LABEL[brief.category] ?? brief.category}
                      </span>
                      <span className="text-xs text-neutral-600">
                        {brief._count.scenes}{" "}
                        {brief._count.scenes === 1 ? "scene" : "scenes"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
