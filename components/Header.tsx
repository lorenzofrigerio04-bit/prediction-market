"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SideDrawer from "./SideDrawer";
import { PredictionMasterLogoCompact } from "./PredictionMasterMark";
import {
  IconMenu,
  IconNavHome,
  IconNavLive,
  IconNavStarcks,
  IconUser,
} from "@/components/ui/Icons";
import { MARKET_CATEGORIES, type MarketCategoryId } from "@/lib/market-categories";

// Bottom bar: Home, Live, Starcks, Profilo
const BOTTOM_NAV_ITEMS = [
  { href: "/", label: "Home", NavIcon: IconNavHome },
  { href: "/live", label: "Live", NavIcon: IconNavLive },
  { href: "/starcks", label: "Starcks", NavIcon: IconNavStarcks },
  { href: "/profile", label: "Profilo", NavIcon: IconUser },
] as const;

const bottomLinkClass =
  "flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] py-1 px-2 rounded-full transition-all duration-250 touch-manipulation active:scale-[0.96] opacity-100";

const SCROLL_TOP_THRESHOLD = 16;
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

type HeaderProps = {
  showCategoryStrip?: boolean;
};

export default function Header({ showCategoryStrip = true }: HeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
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
    setActiveCategoryId(getCategoryFromRoute(pathname ?? "/", null));
  }, [pathname]);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  /* Solo "unauthenticated" → login. Con loading o sessione non ancora idratata, link a /profile evita di mostrare login con cookie già valido. */
  const profileHref =
    status === "unauthenticated"
      ? `/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`
      : "/profile";

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

        {showCategoryStrip && (
          <div
            className="market-categories-strip"
            aria-label="Categorie mercati"
          >
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex h-9 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
                {MARKET_CATEGORIES.map((category, index) => {
                  const isActive = activeCategoryId === category.id;
                  return (
                    <span key={category.id} className="inline-flex items-center">
                      {index > 0 && (
                        <span className="mx-2 text-white/25 text-[10px]" aria-hidden>
                          &bull;
                        </span>
                      )}
                      <Link
                        href={category.href}
                        className={`relative inline-flex items-center rounded-full border px-2 py-0.5 text-[13px] font-medium tracking-[0.01em] transition-all duration-200 ${
                          isActive
                            ? "border-white/25 bg-white/10 text-white shadow-[0_6px_16px_-10px_rgba(128,250,255,0.5)]"
                            : "border-transparent bg-transparent text-white/60 hover:border-white/15 hover:bg-white/5 hover:text-white/85"
                        }`}
                        aria-current={isActive ? "true" : undefined}
                      >
                        {category.label}
                      </Link>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer per evitare che il contenuto finisca sotto l'header fixed */}
      <div
        className={`header-spacer shrink-0 ${showCategoryStrip ? "" : "header-spacer--compact"}`}
        aria-hidden
      />

      {/* Bottom nav: Home, Sport, Exchange, Notifiche, Profilo (visibile su mobile e desktop) */}
      <nav
        className="nav-bottom-neon transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform translate-y-0"
        aria-label="Navigazione principale"
      >
        <div className="nav-bottom-neon-inner grid grid-cols-4 items-center gap-1 px-2 md:gap-2 md:px-3 relative z-[1]">
          {BOTTOM_NAV_ITEMS.map(({ href, label, NavIcon }) => {
            const linkHref = href === "/profile" ? profileHref : href;
            const active = isActive(linkHref);
            const isStarcks = href === "/starcks";
            return (
              <Link
                key={href}
                href={linkHref}
                className={`${bottomLinkClass} w-full ${active ? "nav-item-neon-active" : ""} ${isStarcks ? "nav-item-starcks" : ""}`}
                aria-label={label}
              >
                <span
                  className="relative inline-flex shrink-0 overflow-visible items-center justify-center w-[22px] h-[22px] min-w-[22px] min-h-[22px] aspect-square"
                  style={isStarcks ? { color: '#50f5fc', filter: 'drop-shadow(0 0 4px rgba(80,245,252,0.55))' } : undefined}
                >
                  <NavIcon className="w-[22px] h-[22px] min-w-[22px] min-h-[22px] flex-shrink-0 aspect-square" strokeWidth={1.7} />
                  {isStarcks && (
                    <span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-18px',
                        fontSize: '6px',
                        fontWeight: 800,
                        letterSpacing: '0.2em',
                        lineHeight: 1,
                        padding: '3px 6px',
                        borderRadius: '3px',
                        color: '#fff',
                        background: 'linear-gradient(135deg, #e8201a 0%, #c0100b 100%)',
                        border: '0.5px solid rgba(255,120,110,0.35)',
                        boxShadow: '0 2px 12px rgba(220,30,20,0.55), 0 1px 0 rgba(255,150,140,0.18) inset',
                        transform: 'rotate(22deg)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        textTransform: 'uppercase',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      }}
                    >
                      NOVITÀ
                    </span>
                  )}
                </span>
                <span
                  className="nav-bottom-label shrink-0 opacity-100"
                  data-nav-label
                  style={{
                    display: 'block',
                    visibility: 'visible',
                    opacity: 1,
                    color: isStarcks ? '#50f5fc' : '#ffffff',
                    WebkitTextFillColor: isStarcks ? '#50f5fc' : '#ffffff',
                    fontSize: 9,
                    lineHeight: 1.2,
                    fontWeight: isStarcks ? 700 : undefined,
                    letterSpacing: isStarcks ? '0.05em' : undefined,
                    filter: isStarcks ? 'drop-shadow(0 0 3px rgba(80,245,252,0.6))' : undefined,
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
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
