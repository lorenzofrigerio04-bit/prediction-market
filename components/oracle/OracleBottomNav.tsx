"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  IconNavHome,
  IconNavDiscover,
  IconBell,
  IconUser,
} from "@/components/ui/Icons";

const SCROLL_UP_THRESHOLD = 20;
const GESTURE_VISIBLE_MS = 1500;
const EASE_FLUID = "cubic-bezier(0.32, 0.72, 0, 1)";

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

export default function OracleBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [navVisible, setNavVisible] = useState(false);
  const [transitionMs, setTransitionMs] = useState(250);
  const gestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isGestureShowRef = useRef(false);

  useEffect(() => {
    const handleOracleScroll = (e: Event) => {
      if (isGestureShowRef.current) return;
      const { scrollTop, scrollingUp } = (e as CustomEvent<{ scrollTop: number; scrollingUp: boolean }>).detail;
      if (scrollingUp && scrollTop > SCROLL_UP_THRESHOLD) {
        setTransitionMs(250);
        setNavVisible(true);
      } else {
        setNavVisible(false);
      }
    };
    const handleShowNav = () => {
      if (gestureTimerRef.current) clearTimeout(gestureTimerRef.current);
      isGestureShowRef.current = true;
      setTransitionMs(250);
      setNavVisible(true);
      gestureTimerRef.current = setTimeout(() => {
        gestureTimerRef.current = null;
        setTransitionMs(450);
        setNavVisible(false);
        isGestureShowRef.current = false;
      }, GESTURE_VISIBLE_MS);
    };
    window.addEventListener("oracle-chat-scroll", handleOracleScroll);
    window.addEventListener("oracle-show-nav", handleShowNav);
    return () => {
      window.removeEventListener("oracle-chat-scroll", handleOracleScroll);
      window.removeEventListener("oracle-show-nav", handleShowNav);
      if (gestureTimerRef.current) clearTimeout(gestureTimerRef.current);
    };
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
    <nav
      className={`nav-bottom-neon fixed bottom-0 left-0 right-0 z-40 ${
        navVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        transition: `transform ${transitionMs}ms ${EASE_FLUID}`,
      }}
      aria-label="Navigazione principale"
    >
      <div className="nav-bottom-neon-inner flex items-center justify-between px-3 relative z-[1]">
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
        <div className="w-[52px] shrink-0" aria-hidden />
        <Link
          href={oracleHref}
          className="nav-crystal-ball block touch-manipulation active:scale-[0.98] transition-transform duration-200"
          aria-label="Oracle Assistant"
        />
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
  );
}
