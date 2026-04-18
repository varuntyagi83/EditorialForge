import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/edge";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-neutral-400">Editorial Forge — Session 1 scaffold complete.</p>
    </main>
  );
}
