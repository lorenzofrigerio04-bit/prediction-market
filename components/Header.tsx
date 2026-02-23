"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SideDrawer from "./SideDrawer";
import { PredictionMasterLogo } from "./PredictionMasterMark";
import {
  IconChart,
  IconSearch,
  IconTrophy,
  IconUser,
  IconPlus,
  IconMenu,
  IconNavHome,
  IconNavDiscover,
  IconNavCreate,
  IconNavTrophy,
  IconNavProfile,
} from "@/components/ui/Icons";

// Navigazione principale: Icon per desktop, NavIcon (minimali) per bottom bar mobile
const MAIN_NAV_ITEMS = [
  { href: "/", label: "Home", Icon: IconChart, NavIcon: IconNavHome },
  { href: "/discover", label: "Eventi", Icon: IconSearch, NavIcon: IconNavDiscover },
  { href: "/crea", label: "Crea", Icon: IconPlus, NavIcon: IconNavCreate },
  { href: "/leaderboard", label: "Classifica", Icon: IconTrophy, NavIcon: IconNavTrophy },
  { href: "/profile", label: "Profilo", Icon: IconUser, NavIcon: IconNavProfile },
] as const;

const bottomLinkClass =
  "flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] rounded-2xl transition-colors touch-manipulation active:scale-[0.98]";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  // Dopo il login: Profilo riporta alla pagina corrente (es. Eventi)
  const profileHref = session
    ? "/profile"
    : `/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;
  const creaHref = session
    ? "/crea"
    : `/auth/login?callbackUrl=${encodeURIComponent("/crea")}`;

  return (
    <>
      <header
        className="header-neon sticky top-0 z-40"
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            <PredictionMasterLogo />

            {/* Desktop: 5 voci principali (navigazione core) */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Menu principale">
              {MAIN_NAV_ITEMS.map(({ href, label, Icon }) => {
                const linkHref = href === "/profile" ? profileHref : href === "/crea" ? creaHref : href;
                return (
                <Link
                  key={href}
                  href={linkHref}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] border ${
                    isActive(linkHref)
                      ? "nav-item-neon-active"
                      : "text-fg-muted hover:text-fg border-transparent hover:bg-white/5 dark:hover:bg-white/5 hover:border-primary/20"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
              })}
            </nav>

            <div className="flex items-center gap-2">
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

      {/* Bottom nav mobile: stesse 5 voci, touch-friendly (min 44px) */}
      <nav
        className="nav-bottom-neon md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ paddingBottom: "var(--safe-area-inset-bottom)" }}
        aria-label="Navigazione principale"
      >
        <div className="flex items-center justify-around h-16 px-1">
          {MAIN_NAV_ITEMS.map(({ href, label, NavIcon }) => {
            const linkHref = href === "/profile" ? profileHref : href === "/crea" ? creaHref : href;
            const active = isActive(linkHref);
            return (
              <Link
                key={href}
                href={linkHref}
                className={`${bottomLinkClass} rounded-xl mx-0.5 border transition-all ${
                  active ? "nav-item-neon-active" : "text-fg-muted hover:text-fg border-transparent hover:bg-white/5 dark:hover:bg-white/5 hover:border-primary/15"
                }`}
              >
                <NavIcon className="w-6 h-6" />
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
