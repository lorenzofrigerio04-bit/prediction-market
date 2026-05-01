"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Eventi" },
  { href: "/admin/feedback-review", label: "AI Feedback Review" },
  { href: "/admin/operations", label: "Operations" },
  { href: "/admin/resolve", label: "Risoluzione eventi" },
  { href: "/admin/pipeline-metrics", label: "Pipeline metrics" },
  { href: "/admin/simulate", label: "Simulazione bot" },
  { href: "/admin/users", label: "Utenti" },
  { href: "/admin/moderation", label: "Moderazione" },
  { href: "/admin/disputes", label: "Dispute" },
  { href: "/admin/segnalazioni", label: "Segnalazioni" },
  { href: "/admin/audit", label: "Audit" },
];

const linkBase =
  "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81D8D0]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 min-h-screen bg-admin-bg border-r border-border/70 flex flex-col">
      <div className="p-4 border-b border-border/60">
        <Link
          href="/admin"
          className="font-kalshi text-lg font-bold text-fg tracking-[0.02em] hover:text-fg-muted transition-colors"
        >
          Admin
        </Link>
        <p className="text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle mt-1.5">
          Pannello operativo
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Navigazione admin">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin" ||
                (pathname?.startsWith("/admin/events") && !pathname?.startsWith("/admin/resolve"))
              : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkBase} ${
                isActive
                  ? "border-[#81D8D0]/40 bg-white/[0.04] text-fg shadow-[0_12px_32px_-24px_rgba(129,216,208,0.35)]"
                  : "border-transparent text-fg-muted hover:border-border/60 hover:bg-white/[0.03] hover:text-fg"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? "bg-[#81D8D0]" : "bg-fg-muted/35"}`}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/60">
        <Link
          href="/"
          className={`${linkBase} border-transparent text-fg-muted hover:border-border/60 hover:text-fg`}
        >
          ← Torna al sito
        </Link>
      </div>
    </aside>
  );
}
