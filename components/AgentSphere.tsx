"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const HOME_SEEN_KEY = "pm_home_seen";
const MESSAGE_DURATION_MS = 5000;

/** Stessi threshold dell'Header per sync con la barra menu */
const SCROLL_HIDE_THRESHOLD = 60;
/** Range di scroll (px) per la "caduta" completa della sfera */
const SCROLL_FALL_RANGE = 380;
/** bottom quando nav visibile (sopra la barra) e quando nav nascosta (landed) */
const BOTTOM_NAV_VISIBLE = 100; /* nav ~56px + safe-area + padding */
const BOTTOM_NAV_HIDDEN = 24;

function capitalizeName(name: string): string {
  if (!name.trim()) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** Ease-in: accelerazione tipo gravità (caduta) */
function easeInFall(t: number): number {
  return t * t;
}
/** Ease-out: decelerazione (risalita stabile) */
function easeOutRise(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export default function AgentSphere() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [welcomeWord, setWelcomeWord] = useState<"Benvenuto" | "Bentornato">("Benvenuto");
  const [messageVisible, setMessageVisible] = useState(false);
  const [scrollBottom, setScrollBottom] = useState(BOTTOM_NAV_VISIBLE);
  const [isBouncing, setIsBouncing] = useState(false);
  const hasShownThisSession = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLanded = useRef(false);
  const rafRef = useRef<number | null>(null);

  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);

  const updateScrollPosition = useCallback(() => {
    const scrollY = Math.max(0, window.scrollY ?? document.documentElement.scrollTop);
    const scrollingUp = scrollY < lastScrollYRef.current;
    lastScrollYRef.current = scrollY;

    // Nav visibile: scroll in alto O scroll < threshold (stesso criterio dell'Header)
    const navVisible = scrollingUp || scrollY < SCROLL_HIDE_THRESHOLD;

    let bottom: number;
    if (navVisible) {
      // Risalita: la sfera torna sopra la barra, ease-out per atterraggio stabile
      const progress = Math.min(1, scrollY / SCROLL_FALL_RANGE);
      const eased = easeOutRise(1 - progress);
      bottom = BOTTOM_NAV_HIDDEN + eased * (BOTTOM_NAV_VISIBLE - BOTTOM_NAV_HIDDEN);
    } else {
      // Caduta: la sfera scende con lo scroll, ease-in tipo gravità
      const progress = Math.min(1, scrollY / SCROLL_FALL_RANGE);
      const eased = easeInFall(progress);
      bottom = BOTTOM_NAV_VISIBLE - eased * (BOTTOM_NAV_VISIBLE - BOTTOM_NAV_HIDDEN);
    }

    setScrollBottom(bottom);

    if (!navVisible && bottom <= BOTTOM_NAV_HIDDEN + 8 && !hasLanded.current) {
      hasLanded.current = true;
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
      setIsBouncing(true);
      bounceTimerRef.current = setTimeout(() => {
        setIsBouncing(false);
        bounceTimerRef.current = null;
      }, 680);
    }
    if (navVisible) hasLanded.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateScrollPosition();
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollPosition();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    };
  }, [updateScrollPosition]);

  // Al cambio pagina la nav ricompare (Header): aggiorna posizione sfera
  useEffect(() => {
    updateScrollPosition();
  }, [pathname, updateScrollPosition]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(HOME_SEEN_KEY);
    if (seen) {
      queueMicrotask(() => setWelcomeWord("Bentornato"));
    } else {
      localStorage.setItem(HOME_SEEN_KEY, "1");
    }
  }, []);

  // Mostra messaggio per 5 secondi all'ingresso; nascondi al cambio pagina
  useEffect(() => {
    if (status !== "authenticated") return;

    if (!hasShownThisSession.current) {
      hasShownThisSession.current = true;
      setMessageVisible(true);

      timerRef.current = setTimeout(() => {
        setMessageVisible(false);
        timerRef.current = null;
      }, MESSAGE_DURATION_MS);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setMessageVisible(false);
    };
  }, [status, pathname]);

  if (pathname === "/exchange") return null;
  if (status !== "authenticated") return null;

  const displayName = session?.user?.name || session?.user?.email || "utente";
  const nameCapitalized = capitalizeName(displayName);
  const isReturning = welcomeWord === "Bentornato";
  const messageLine1 = isReturning ? `Bentornato, ${nameCapitalized}.` : `Benvenuto, ${nameCapitalized}.`;
  const messageLine2 = isReturning
    ? "Clicca per Exchange e le previsioni."
    : "Clicca per Exchange e le previsioni.";

  return (
    <>
      {/* Overlay leggero quando il messaggio è visibile: focus sul contenuto */}
      {messageVisible && (
        <div
          className="agent-message-overlay fixed inset-0 z-[45] bg-black/25 pointer-events-none transition-opacity duration-300"
          aria-hidden
        />
      )}

      <div
        className={`agent-sphere-wrapper fixed z-50 right-4 md:right-6 flex flex-col items-end gap-2 ${isBouncing ? "agent-sphere-bounce" : ""}`}
        style={{
          bottom: `${scrollBottom}px`,
          transition: isBouncing
            ? "none"
            : "bottom 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {messageVisible && (
          <div
            className="agent-message-box"
            role="status"
            aria-live="polite"
            aria-label={`${messageLine1} ${messageLine2}`}
          >
            <p className="agent-message-line1">{messageLine1}</p>
            <p className="agent-message-line2">{messageLine2}</p>
            <span className="agent-message-tail" aria-hidden />
          </div>
        )}
        <Link
          href="/exchange"
          className="agent-sphere agent-sphere-chill block touch-manipulation active:scale-[0.98] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-full"
          aria-label="Exchange"
        />
      </div>
    </>
  );
}
