"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import SideDrawer from "./SideDrawer";
import {
  IconChart,
  IconSearch,
  IconTarget,
  IconTrophy,
  IconUser,
  IconMenu,
} from "@/components/ui/Icons";

const BOTTOM_NAV_ITEMS = [
  { href: "/", label: "Home", Icon: IconChart },
  { href: "/discover", label: "Eventi", Icon: IconSearch },
  { href: "/missions", label: "Missioni", Icon: IconTarget },
  { href: "/leaderboard", label: "Classifica", Icon: IconTrophy },
  { href: "/profile", label: "Profilo", Icon: IconUser },
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
        className="header-neon sticky top-0 z-40"
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link
              href="/"
              className="text-ds-h2 font-bold text-fg tracking-headline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-xl min-h-[44px] flex items-center dark:drop-shadow-[0_0_20px_rgba(var(--primary-glow),0.15)]"
            >
              Prediction Market
            </Link>

            {/* Desktop: 5 voci con stile neon */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Menu principale">
              {BOTTOM_NAV_ITEMS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href === "/profile" ? profileHref : href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] border ${
                    isActive(href === "/profile" ? profileHref : href)
                      ? "nav-item-neon-active"
                      : "text-fg-muted hover:text-fg border-transparent hover:bg-white/5 dark:hover:bg-white/5 hover:border-primary/20"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle className="header-icon-btn min-w-[44px] min-h-[44px] text-fg-muted" />
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="header-icon-btn min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-fg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg touch-manipulation active:scale-[0.98]"
                aria-label="Apri menu"
                aria-expanded={drawerOpen}
              >
                <IconMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav: barra neon/glass con angoli arrotondati */}
      <nav
        className="nav-bottom-neon md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ paddingBottom: "var(--safe-area-inset-bottom)" }}
        aria-label="Navigazione principale"
      >
        <div className="flex items-center justify-around h-16 px-1">
          {BOTTOM_NAV_ITEMS.map(({ href, label, Icon }) => {
            const linkHref = href === "/profile" ? profileHref : href;
            const active = isActive(linkHref);
            return (
              <Link
                key={href}
                href={linkHref}
                className={`${bottomLinkClass} rounded-xl mx-0.5 border transition-all ${
                  active ? "nav-item-neon-active" : "text-fg-muted hover:text-fg border-transparent hover:bg-white/5 dark:hover:bg-white/5 hover:border-primary/15"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-ds-micro font-semibold uppercase tracking-label">{label}</span>
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
