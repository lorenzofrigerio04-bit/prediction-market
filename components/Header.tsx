"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import SideDrawer from "./SideDrawer";
import { PredictionMasterLogoCompact } from "./PredictionMasterMark";
import {
  IconMenu,
  IconNavHome,
  IconNavSport,
  IconNavExchange,
  IconBell,
  IconUser,
} from "@/components/ui/Icons";

// Bottom bar: Home, Sport, Exchange, Notifiche, Profilo
const BOTTOM_NAV_LEFT = [
  { href: "/", label: "Home", NavIcon: IconNavHome },
  { href: "/sport", label: "Sport", NavIcon: IconNavSport },
] as const;
const BOTTOM_NAV_RIGHT = [
  { href: "/notifications", label: "Notifiche", NavIcon: IconBell },
  { href: "/profile", label: "Profilo", NavIcon: IconUser },
] as const;

const bottomLinkClass =
  "flex flex-col items-center justify-center gap-1 min-w-[52px] min-h-[52px] py-1.5 rounded-xl transition-colors duration-200 touch-manipulation active:scale-[0.97] opacity-100";

const SCROLL_TOP_THRESHOLD = 16;
const MARKET_CATEGORIES = [
  { id: "trending", label: "Tendenza", href: "/discover/tutti?sort=popular" },
  { id: "elections", label: "Elezioni", href: "/discover/elezioni" },
  { id: "politics", label: "Politica", href: "/discover/politica" },
  { id: "sports", label: "Sport", href: "/discover/sport" },
  { id: "culture", label: "Cultura", href: "/discover/cultura" },
  { id: "crypto", label: "Cripto", href: "/discover/cripto" },
  { id: "climate", label: "Clima", href: "/discover/clima" },
  { id: "economics", label: "Economia", href: "/discover/economia" },
  { id: "mentions", label: "Menzioni", href: "/discover/menzioni" },
  { id: "companies", label: "Aziende", href: "/discover/aziende" },
  { id: "finance", label: "Finanza", href: "/discover/finanza" },
  { id: "tech-science", label: "Tecnologia e Scienza", href: "/discover/tecnologia-e-scienza" },
] as const;

type MarketCategoryId = (typeof MARKET_CATEGORIES)[number]["id"];

function getCategoryFromRoute(pathname: string, sortParam: string | null): MarketCategoryId {
  if (pathname === "/discover" || pathname === "/") return "trending";
  if (pathname.startsWith("/sport")) return "sports";

  if (pathname.startsWith("/discover/")) {
    const slug = pathname.split("/")[2] ?? "";
    if (slug === "tutti") return sortParam === "popular" ? "trending" : "trending";
    if (slug === "elezioni" || slug === "elections") return "elections";
    if (slug === "politica" || slug === "politics") return "politics";
    if (slug === "sport" || slug === "sports") return "sports";
    if (slug === "cultura" || slug === "culture") return "culture";
    if (slug === "crypto" || slug === "cripto") return "crypto";
    if (slug === "clima" || slug === "climate") return "climate";
    if (slug === "economia" || slug === "economics") return "economics";
    if (slug === "menzioni" || slug === "mentions") return "mentions";
    if (slug === "aziende" || slug === "companies") return "companies";
    if (slug === "finanza" || slug === "financials") return "finance";
    if (
      slug === "tecnologia" ||
      slug === "scienza" ||
      slug === "tecnologia-e-scienza" ||
      slug === "tech-science"
    ) {
      return "tech-science";
    }
  }

  return "trending";
}

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<MarketCategoryId>("trending");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      setScrolled(scrollY > SCROLL_TOP_THRESHOLD);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveCategoryId(getCategoryFromRoute(pathname ?? "/", searchParams.get("sort")));
  }, [pathname, searchParams]);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  /* Solo "unauthenticated" → login. Con loading o sessione non ancora idratata, link a /profile evita di mostrare login con cookie già valido. */
  const profileHref =
    status === "unauthenticated"
      ? `/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`
      : "/profile";
  const notificationsHref =
    status === "unauthenticated"
      ? `/auth/login?callbackUrl=${encodeURIComponent("/notifications")}`
      : "/notifications";

  return (
    <>
      {/* Label sempre visibili anche con cache: selettore univoco data-nav-label */}
      <style dangerouslySetInnerHTML={{
        __html: `[data-nav-label]{display:block!important;visibility:visible!important;opacity:1!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:10px!important;line-height:1.2!important;min-height:14px!important;}.nav-bottom-neon .nav-bottom-neon-inner a svg{opacity:1!important;color:#fff!important;}`,
      }} />
      <header
        className={`header-neon fixed top-0 left-0 right-0 z-40 transition-[transform,background,backdrop-filter,border-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
          scrolled ? "header-neon-scrolled" : ""
        }`}
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Sinistra: PredictionMaster */}
            <div className="flex h-full min-w-0 items-center">
              <PredictionMasterLogoCompact />
            </div>

            {/* Destra: hamburger menu (al posto del profilo) */}
            <div className="flex-shrink-0 w-12 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-fg-muted hover:text-fg hover:bg-surface/70 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg touch-manipulation active:scale-[0.96]"
                aria-label="Apri menu"
                aria-expanded={drawerOpen}
              >
                <IconMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="market-categories-strip border-t border-b border-white/10 bg-[rgb(var(--admin-bg))]/90 backdrop-blur-sm"
          aria-label="Categorie mercati"
        >
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-10 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
              {MARKET_CATEGORIES.map((category, index) => {
                const isActive = activeCategoryId === category.id;
                return (
                <span key={category.id} className="inline-flex items-center">
                  {index > 0 && (
                    <span className="mx-3 text-fg-muted/40" aria-hidden>
                      &bull;
                    </span>
                  )}
                  <Link
                    href={category.href}
                    className={`relative inline-flex items-center px-0.5 py-1 text-[13px] font-medium tracking-[0.01em] transition-colors duration-200 ${
                      isActive ? "text-fg" : "text-fg-muted/85"
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {category.label}
                  </Link>
                </span>
              )})}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer per evitare che il contenuto finisca sotto l'header fixed */}
      <div
        className="header-spacer shrink-0"
        aria-hidden
      />

      {/* Bottom nav: Home, Sport, Exchange, Notifiche, Profilo (visibile su mobile e desktop) */}
      <nav
        className="nav-bottom-neon transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform translate-y-0"
        aria-label="Navigazione principale"
      >
        <div className="nav-bottom-neon-inner flex items-center justify-between px-3 relative z-[1]">
          {/* Sinistra: Home, Sport — icona + label, icona sempre visibile */}
          <div className="flex items-center justify-center gap-2 flex-1 min-w-0">
            {BOTTOM_NAV_LEFT.map(({ href, label, NavIcon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${bottomLinkClass} ${active ? "nav-item-neon-active" : ""}`}
                  aria-label={label}
                >
                  <span className="inline-flex shrink-0 overflow-visible items-center justify-center w-6 h-6 min-w-[24px] min-h-[24px] aspect-square">
                    <NavIcon className="w-6 h-6 min-w-[24px] min-h-[24px] flex-shrink-0 aspect-square" strokeWidth={1.8} />
                  </span>
                  <span className="nav-bottom-label shrink-0 opacity-100" data-nav-label style={{ display: 'block', visibility: 'visible', opacity: 1, color: '#ffffff', fontSize: 10, lineHeight: 1.2 }}>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Centro: Exchange — icona + label */}
          <div className="flex items-center justify-center shrink-0">
            <Link
              href="/exchange"
              className={`${bottomLinkClass} ${isActive("/exchange") ? "nav-item-neon-active" : ""}`}
              aria-label="Exchange"
            >
              <IconNavExchange className="w-6 h-6 shrink-0 flex-shrink-0" strokeWidth={1.8} />
              <span className="nav-bottom-label shrink-0 opacity-100" data-nav-label style={{ display: 'block', visibility: 'visible', opacity: 1, color: '#ffffff', fontSize: 10, lineHeight: 1.2 }}>Exchange</span>
            </Link>
          </div>

          {/* Destra: Notifiche, Profilo — sempre icona + label */}
          <div className="flex items-center justify-center gap-2 flex-1 min-w-0">
            {BOTTOM_NAV_RIGHT.map(({ href, label, NavIcon }) => {
              const linkHref =
                href === "/profile" ? profileHref : href === "/notifications" ? notificationsHref : href;
              const active = isActive(linkHref);
              return (
                <Link
                  key={href}
                  href={linkHref}
                  className={`${bottomLinkClass} ${active ? "nav-item-neon-active" : ""}`}
                  aria-label={label}
                >
                  <NavIcon className="w-6 h-6 shrink-0 flex-shrink-0" strokeWidth={1.8} />
                  <span className="nav-bottom-label shrink-0 opacity-100" data-nav-label style={{ display: 'block', visibility: 'visible', opacity: 1, color: '#ffffff', fontSize: 10, lineHeight: 1.2 }}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={status === "authenticated"}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </>
  );
}
