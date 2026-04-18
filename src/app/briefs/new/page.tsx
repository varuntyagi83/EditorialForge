import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/edge";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NewBriefForm } from "./new-brief-form";

export default async function NewBriefPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const contexts = await prisma.culturalContext.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true },
  });

  return (
    <AppShell user={session.user}>
      <div className="p-8 max-w-2xl">
        <h1 className="text-lg font-semibold text-white mb-8">New Brief</h1>
        <NewBriefForm contexts={contexts} />
      </div>
    </AppShell>
  );
}
