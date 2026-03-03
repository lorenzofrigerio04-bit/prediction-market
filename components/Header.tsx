"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SideDrawer from "./SideDrawer";
import { PredictionMasterLogoCompact } from "./PredictionMasterMark";
import {
  IconMenu,
  IconNavHome,
  IconNavDiscover,
  IconBell,
  IconUser,
} from "@/components/ui/Icons";

// Bottom bar: Home, Lente, [Crystal Ball center], Campanella, Profilo
const BOTTOM_NAV_LEFT = [
  { href: "/", label: "Home", NavIcon: IconNavHome },
  { href: "/discover", label: "Post", NavIcon: IconNavDiscover },
] as const;
const BOTTOM_NAV_RIGHT = [
  { href: "/notifications", label: "Notifiche", NavIcon: IconBell },
  { href: "/profile", label: "Profilo", NavIcon: IconUser },
] as const;

const bottomLinkClass =
  "flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] rounded-xl transition-colors duration-200 touch-manipulation active:scale-[0.97]";

const SCROLL_TOP_THRESHOLD = 16;
const SCROLL_HIDE_THRESHOLD = 60;

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      setScrolled(scrollY > SCROLL_TOP_THRESHOLD);
      if (scrollY < SCROLL_TOP_THRESHOLD) {
        setHeaderVisible(true);
      } else if (scrollY > lastScrollY.current && scrollY > SCROLL_HIDE_THRESHOLD) {
        setHeaderVisible(false);
      } else if (scrollY < lastScrollY.current) {
        setHeaderVisible(true);
      }
      lastScrollY.current = scrollY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Al ritorno sulla home (o su qualsiasi sezione) mostra sempre header e nav,
  // così le icone non spariscono dopo navigazione + ripristino scroll
  useEffect(() => {
    setHeaderVisible(true);
  }, [pathname]);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  const profileHref = session
    ? "/profile"
    : `/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;
  const notificationsHref = session
    ? "/notifications"
    : `/auth/login?callbackUrl=${encodeURIComponent("/notifications")}`;
  const oracleHref = session
    ? "/oracle"
    : `/auth/login?callbackUrl=${encodeURIComponent("/oracle")}`;

  return (
    <>
      <header
        className={`header-neon fixed top-0 left-0 right-0 z-40 transition-[transform,background,backdrop-filter,border-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
          scrolled ? "header-neon-scrolled" : ""
        } ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16 relative">
            {/* Sinistra: hamburger menu (tre stanghette) */}
            <div className="flex-shrink-0 w-12 flex items-center justify-start">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-fg-muted hover:text-fg hover:bg-white/10 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg touch-manipulation active:scale-[0.96]"
                aria-label="Apri menu"
                aria-expanded={drawerOpen}
              >
                <IconMenu className="w-6 h-6" />
              </button>
            </div>

            {/* Centro: P.m. logo stile X */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <PredictionMasterLogoCompact />
            </div>

            {/* Destra: immagine profilo in cerchio */}
            <div className="flex-shrink-0 w-12 flex items-center justify-end">
              <Link
                href={profileHref}
                className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-white/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.96]"
                aria-label={session ? "Vai al profilo" : "Accedi"}
              >
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-white/10 text-fg-muted">
                    <IconUser className="w-5 h-5" />
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer per evitare che il contenuto finisca sotto l'header fixed */}
      <div
        className="header-spacer shrink-0"
        aria-hidden
      />

      {/* Bottom nav mobile: Apple/X style, sfera cristallo centrale a scomparsa */}
      <nav
        className={`nav-bottom-neon md:hidden transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
          headerVisible ? "translate-y-0" : "translate-y-full"
        }`}
        aria-label="Navigazione principale"
      >
        <div className="nav-bottom-neon-inner flex items-center justify-between px-3 relative z-[1]">
          {/* Sinistra: Home, Lente */}
          <div className="flex items-center justify-center gap-2 flex-1 min-w-0">
            {BOTTOM_NAV_LEFT.map(({ href, label, NavIcon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${bottomLinkClass} ${
                    active ? "nav-item-neon-active" : "opacity-90 hover:opacity-100"
                  }`}
                  aria-label={label}
                >
                  <NavIcon className="w-6 h-6 shrink-0" strokeWidth={1.8} />
                </Link>
              );
            })}
          </div>

          {/* Spacer centro per la sfera (la sfera è position absolute, 48px) */}
          <div className="w-[52px] shrink-0" aria-hidden />

          {/* Centro: sfera cristallo grossa, mezza luna sul contorno */}
          <Link
            href={oracleHref}
            className="nav-crystal-ball block touch-manipulation active:scale-[0.98] transition-transform duration-200"
            aria-label="Oracle Assistant"
          />

          {/* Destra: Campanella, Profilo */}
          <div className="flex items-center justify-center gap-2 flex-1 min-w-0">
            {BOTTOM_NAV_RIGHT.map(({ href, label, NavIcon }) => {
              const linkHref =
                href === "/profile" ? profileHref : href === "/notifications" ? notificationsHref : href;
              const active = isActive(linkHref);
              const isProfile = href === "/profile";
              return (
                <Link
                  key={href}
                  href={linkHref}
                  className={`${bottomLinkClass} ${
                    active ? "nav-item-neon-active" : "opacity-90 hover:opacity-100"
                  }`}
                  aria-label={label}
                >
                  {isProfile && session?.user?.image ? (
                    <span
                      className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 ring-2 ${
                        active ? "ring-primary" : "ring-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </span>
                  ) : (
                    <NavIcon className="w-6 h-6 shrink-0" strokeWidth={1.8} />
                  )}
                </Link>
              );
            })}
          </div>
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
