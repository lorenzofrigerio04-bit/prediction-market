"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Eventi", icon: "📋" },
  { href: "/admin/resolve", label: "Risoluzione eventi", icon: "✅" },
  { href: "/admin/simulate", label: "Simulazione bot", icon: "🤖" },
  { href: "/admin/users", label: "Utenti", icon: "👤" },
  { href: "/admin/moderation", label: "Moderazione", icon: "💬" },
  { href: "/admin/disputes", label: "Dispute", icon: "⚠️" },
  { href: "/admin/audit", label: "Audit", icon: "📜" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link
          href="/admin"
          className="text-lg font-bold text-gray-900 dark:text-white"
        >
          Admin
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Pannello operativo
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin" || (pathname.startsWith("/admin/events") && !pathname.startsWith("/admin/resolve"))
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Torna al sito
        </Link>
      </div>
    </aside>
  );
}
