import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/edge";
import { AppShell } from "@/components/layout/app-shell";

export default async function LogosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AppShell user={session.user}>
      <div className="p-8">
        <h1 className="text-lg font-semibold text-white mb-2">Logos</h1>
        <p className="text-sm text-neutral-500">
          Logo asset management coming in a future session.
        </p>
      </div>
    </AppShell>
  );
}
