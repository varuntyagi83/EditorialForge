import { auth } from "./edge";
import { prisma } from "../db";

export async function getSessionUser(): Promise<{ id: string; email: string } | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });
}
