"use client";

import { useEffect, useRef, useState } from "react";
import { getSession } from "next-auth/react";
import VirtualCreditsGlyph from "@/components/ui/VirtualCreditsGlyph";
import { INITIAL_CREDITS } from "@/lib/credits-config";

function formatCredits(n: number): string {
  try {
    return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(n)));
  } catch {
    return String(Math.max(0, Math.round(n)));
  }
}

/**
 * Contatore “high premium”: partenza reattiva, corsa centrale viva, frenata lunga e vellutata
 * sugli ultimi importi (ispirato a ease expo-out con ginocchio morbido).
 */
function easeUltraPremiumCounter(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const head = 0.1;
  if (t < head) {
    const u = t / head;
    /* 0 → 0, u=1 → head (attacco continuo al tratto expo-out) */
    return head * u * (0.88 * u + 0.12);
  }
  const u = (t - head) / (1 - head);
  const eased = 1 - Math.pow(1 - u, 4.85);
  return head + (1 - head) * eased;
}

export type SignupWelcomeCreditsRevealProps = {
  embedded?: boolean;
  target?: number;
  /** Ritmo contatore (consigliato ~3.8–4.4s per fluidità premium). */
  countDurationMs?: number;
  /** Hold dopo raggiunto il target prima dell’onda di burst visiva. */
  settleHoldMs?: number;
  /** ms dopo il burst prima di dismiss/navigazione (allineare alle animazioni modale / pagina). */
  burstNavigateDelayMs?: number;
  /** Invocato nello stesso tick del burst (es. avvia chiusura modale “bomba”). */
  onBurstStart?: () => void;
  welcomeNavigateEmbedded?: () => void;
  authSuccessCallbackUrl?: string;
};

export default function SignupWelcomeCreditsReveal({
  embedded = false,
  target = INITIAL_CREDITS,
  countDurationMs = 4120,
  settleHoldMs = 240,
  burstNavigateDelayMs,
  onBurstStart,
  welcomeNavigateEmbedded,
  authSuccessCallbackUrl,
}: SignupWelcomeCreditsRevealProps) {
  const [easedProgress, setEasedProgress] = useState(0);
  const [burst, setBurst] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    let start: number | null = null;
    let raf = 0;
    let settleTimer: number | undefined;
    let burstNavTimer: number | undefined;

    function navigateOut() {
      if (finishedRef.current) return;
      finishedRef.current = true;

      void (async () => {
        try {
          await fetch("/api/user/credits-welcome-dismiss", {
            method: "POST",
            credentials: "same-origin",
          });
        } catch {
          /* non bloccare la navigazione */
        }
        try {
          await getSession();
        } catch {
          /* ignore */
        }

        const okEmbedded = typeof welcomeNavigateEmbedded === "function";
        const dest =
          typeof authSuccessCallbackUrl === "string" &&
          authSuccessCallbackUrl.startsWith("/") &&
          !authSuccessCallbackUrl.startsWith("//")
            ? authSuccessCallbackUrl
            : "/";

        if (okEmbedded) welcomeNavigateEmbedded();
        else window.location.href = `/auth/success?callbackUrl=${encodeURIComponent(dest)}`;
      })();
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveCountMs = reduceMotion ? 1 : countDurationMs;
    const effectiveSettle = reduceMotion ? 0 : settleHoldMs;
    const navDelay =
      burstNavigateDelayMs ?? (embedded ? 880 : 620);

    function frame(now: number) {
      if (start === null) start = now;
      const elapsed = now - start;
      const lin = Math.min(1, elapsed / effectiveCountMs);
      const e = easeUltraPremiumCounter(lin);
      setEasedProgress(e);
      if (lin < 1) {
        raf = requestAnimationFrame(frame);
        return;
      }
      settleTimer = window.setTimeout(() => {
        onBurstStart?.();
        setBurst(true);
        burstNavTimer = window.setTimeout(
          () => navigateOut(),
          reduceMotion ? 200 : navDelay
        );
      }, effectiveSettle);
    }

    if (reduceMotion) {
      setEasedProgress(1);
      settleTimer = window.setTimeout(() => {
        onBurstStart?.();
        setBurst(true);
        burstNavTimer = window.setTimeout(() => navigateOut(), 200);
      }, 120);
    } else {
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      if (settleTimer) window.clearTimeout(settleTimer);
      if (burstNavTimer) window.clearTimeout(burstNavTimer);
    };
  }, [
    authSuccessCallbackUrl,
    burstNavigateDelayMs,
    countDurationMs,
    embedded,
    onBurstStart,
    settleHoldMs,
    welcomeNavigateEmbedded,
  ]);

  const display = Math.round(easedProgress * target);
  const clampedProg = easedProgress >= 1 ? 1 : easedProgress;

  const minGs = embedded ? 12.75 : 14.75;
  const maxGs = embedded ? 19.75 : 24.75;
  const fontPx = minGs + (maxGs - minGs) * clampedProg ** 0.88;
  const glyphPx = embedded ? Math.round(13 + clampedProg * 7) : Math.round(15 + clampedProg * 7);

  return (
    <div
      className={`signup-welcome-reveal-root mx-auto mb-6 mt-6 flex w-full max-w-[272px] flex-col items-center sm:max-w-[300px] ${
        burst ? "signup-welcome-reveal-root--burst pointer-events-none" : ""
      }`}
      aria-live="polite"
    >
      <div
        className={`signup-welcome-credits-shell header-auth-btn header-credits-pill relative flex w-fit max-w-full items-center px-5 py-3 sm:py-3.5 ${
          burst ? "signup-welcome-credits-shell--ring" : ""
        }`}
        style={{
          cursor: burst ? "default" : undefined,
          minHeight: "44px",
        }}
      >
        <span className="header-credits-pill__shine opacity-[0.5]" aria-hidden />
        <span className="relative z-[1] flex min-w-0 items-center gap-2">
          <span className="header-credits-pill__mark header-credits-pill__currency flex-shrink-0" aria-hidden>
            <VirtualCreditsGlyph
              className="block shrink-0 transition-[filter] duration-500 ease-out"
              style={{
                width: glyphPx,
                height: glyphPx,
                filter: burst ? "drop-shadow(0 0 16px rgba(80,245,252,0.65))" : undefined,
              }}
              aria-hidden
            />
          </span>
          <span className="flex min-w-0 items-baseline gap-2 leading-none">
            <span
              className="tabular-nums font-semibold tracking-[-0.02em] text-white transition-colors duration-300 ease-out"
              style={{
                fontSize: `${fontPx}px`,
                textShadow:
                  easedProgress >= 0.995
                    ? "0 0 28px rgba(80,245,252,0.22), 0 1px 0 rgba(255,255,255,0.12)"
                    : "0 0 22px rgba(80,245,252,0.08), 0 1px 0 rgba(255,255,255,0.08)",
                filter: `drop-shadow(0 0 ${8 + easedProgress * 26}px rgba(80,245,252,${0.14 + easedProgress * 0.42}))`,
              }}
            >
              {formatCredits(display)}
            </span>
            <span className="hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-white/52 sm:inline">
              cr
            </span>
          </span>
        </span>
      </div>
      {burst ? (
        <span className="signup-welcome-glare-overlay pointer-events-none" aria-hidden />
      ) : null}
    </div>
  );
}
