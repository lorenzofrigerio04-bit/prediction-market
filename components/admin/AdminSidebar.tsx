"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Eventi", icon: "📋" },
  { href: "/admin/operations", label: "Operations", icon: "🛠️" },
  { href: "/admin/resolve", label: "Risoluzione eventi", icon: "✅" },
  { href: "/admin/pipeline-metrics", label: "Pipeline metrics", icon: "📊" },
  { href: "/admin/simulate", label: "Simulazione bot", icon: "🤖" },
  { href: "/admin/users", label: "Utenti", icon: "👤" },
  { href: "/admin/moderation", label: "Moderazione", icon: "💬" },
  { href: "/admin/disputes", label: "Dispute", icon: "⚠️" },
  { href: "/admin/audit", label: "Audit", icon: "📜" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-white/[0.06] border-r border-white/10 flex flex-col">
      <div className="p-4 border-b border-border dark:border-white/10">
        <Link
          href="/admin"
          className="text-lg font-bold text-fg"
        >
          Admin
        </Link>
        <p className="text-xs text-fg-subtle mt-1">
          Pannello operativo
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin" || (pathname?.startsWith("/admin/events") && !pathname?.startsWith("/admin/resolve"))
              : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-fg-muted hover:bg-surface/50 hover:text-fg"
              }`}
            >
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border dark:border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-fg-muted hover:text-primary transition-colors"
        >
          ← Torna al sito
        </Link>
      </div>
    </aside>
  );
}
