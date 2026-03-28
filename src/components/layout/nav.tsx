"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/transactions", label: "Transaktionen" },
  { href: "/subscriptions", label: "Abos" },
  { href: "/stats", label: "Stats" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-48 shrink-0 border-r border-zinc-800 px-4 py-6 gap-1">
        <span className="text-sm font-semibold text-zinc-100 mb-4 px-2">Finanza</span>
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-2 py-1.5 rounded transition-colors ${
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </aside>

      {/* Mobile bottom nav — pb accounts for iOS home indicator safe area */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-zinc-800 bg-zinc-950"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 py-3 text-center text-xs transition-colors ${
                active ? "text-zinc-100" : "text-zinc-500"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
