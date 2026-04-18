"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FileText, Globe, ImageIcon, Layers, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type User = { name?: string | null; email?: string | null };

function navItem(
  href: string,
  label: string,
  Icon: React.ComponentType<{ className?: string }>,
  pathname: string,
  exact = false
) {
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-neutral-800 text-white"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const initials = (user.name ?? user.email ?? "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <aside className="w-56 shrink-0 flex flex-col border-r border-neutral-800 bg-neutral-900 fixed inset-y-0 left-0 z-10">
        <div className="px-4 py-5 border-b border-neutral-800">
          <span className="text-xs font-semibold tracking-widest text-neutral-300 uppercase">
            Editorial Forge
          </span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItem("/", "Briefs", FileText, pathname, true)}
          <Link
            href="/briefs/new"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Plus className="size-4 shrink-0" />
            New Brief
          </Link>

          <div className="h-px bg-neutral-800 my-3" />
          <p className="px-3 pb-1 text-[10px] font-medium text-neutral-600 uppercase tracking-widest">
            Library
          </p>
          {navItem("/library/contexts", "Contexts", Globe, pathname)}
          {navItem("/library/references", "References", ImageIcon, pathname)}
          {navItem("/library/logos", "Logos", Layers, pathname)}
        </nav>

        <div className="border-t border-neutral-800 p-3">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {initials}
            </div>
            <p className="flex-1 min-w-0 text-xs text-neutral-300 truncate">
              {user.email}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-neutral-500 hover:text-white transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-56 flex-1 min-h-screen">{children}</main>
    </div>
  );
}
