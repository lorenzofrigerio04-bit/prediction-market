"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import SideDrawer from "./SideDrawer";

const BOTTOM_NAV_ITEMS = [
  { href: "/", label: "Home", icon: "📊" },
  { href: "/discover", label: "Scopri", icon: "🔍" },
  { href: "/missions", label: "Missioni", icon: "🎯" },
  { href: "/leaderboard", label: "Classifica", icon: "🏆" },
  { href: "/profile", label: "Profilo", icon: "👤" },
] as const;

const bottomLinkClass =
  "flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] rounded-2xl transition-colors touch-manipulation active:scale-[0.98]";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  const profileHref = session ? "/profile" : "/auth/login";

  return (
    <>
      <header
        className="sticky top-0 z-40 glass border-b border-border dark:border-white/10"
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link
              href="/"
              className="text-lg md:text-xl font-bold text-fg tracking-tight focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-xl min-h-[44px] flex items-center"
            >
              Prediction Market
            </Link>

            {/* Desktop: 5 voci principali inline */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Menu principale">
              {BOTTOM_NAV_ITEMS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href === "/profile" ? profileHref : href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors min-h-[44px] ${
                    isActive(href === "/profile" ? profileHref : href)
                      ? "bg-primary/10 text-primary"
                      : "text-fg-muted hover:bg-surface/50 hover:text-fg"
                  }`}
                >
                  <span className="text-lg" aria-hidden>{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl text-fg-muted hover:bg-surface/50 hover:text-fg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg touch-manipulation"
                aria-label="Apri menu"
                aria-expanded={drawerOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav: solo mobile, 5 voci, accessibili col pollice */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border dark:border-white/10"
        style={{ paddingBottom: "var(--safe-area-inset-bottom)" }}
        aria-label="Navigazione principale"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {BOTTOM_NAV_ITEMS.map(({ href, label, icon }) => {
            const linkHref = href === "/profile" ? profileHref : href;
            const active = isActive(linkHref);
            return (
              <Link
                key={href}
                href={linkHref}
                className={`${bottomLinkClass} ${
                  active ? "text-primary bg-primary/10" : "text-fg-muted hover:text-fg hover:bg-surface/50"
                }`}
              >
                <span className="text-xl" aria-hidden>{icon}</span>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={status === "authenticated" && !!session}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </>
  );
}
