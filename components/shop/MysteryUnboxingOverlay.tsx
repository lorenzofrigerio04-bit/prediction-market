"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  BRONZE_MYSTERY_PRIZE_TIERS,
  BRONZE_MYSTERY_RAIL_RARITY_CYCLE,
} from "@/lib/shop-bronze-mystery-prizes";
import {
  SILVER_MYSTERY_PRIZE_TIERS,
  SILVER_MYSTERY_RAIL_RARITY_CYCLE,
} from "@/lib/shop-silver-mystery-prizes";
import {
  GOLD_MYSTERY_PRIZE_TIERS,
  GOLD_MYSTERY_RAIL_RARITY_CYCLE,
} from "@/lib/shop-gold-mystery-prizes";
import { MysteryRailPremiumFx, mysteryRailPremiumMotion } from "./MysteryRailPremiumFx";
import type { MysteryTier } from "@/lib/shop-display-config";

type Rarity = "comune" | "raro" | "epico" | "leggendario";
type Phase = "opening" | "ready" | "spinning" | "result" | "closing";

const CARD_W = 176;
const CARD_GAP = 32;                      // wider gap → prizes feel distinct
const CARD_PITCH = CARD_W + CARD_GAP;     // 208 px
const CARD_HALF = CARD_W / 2;             // 88 px
const TRACK_REPEATS = 7;                  // 7 × 20 = 140 cards
const START_CARD = 8;
const WINNER_MIN = 72;
const WINNER_MAX = 118;
const SPIN_MS = 5800;
const PREVIEW_CARDS = 36;
const PREVIEW_S = 42;
const SPOTLIGHT_START_T = 0.70;           // fraction of SPIN_MS when spotlight begins

const RARITY_OUTLINE: Record<Rarity, string> = {
  comune:     "bg-gradient-to-br from-white via-zinc-100 to-zinc-400",
  raro:       "bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-700",
  epico:      "bg-gradient-to-br from-violet-300 via-fuchsia-400 to-violet-900",
  leggendario:"bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700",
};

const RARITY_GLOW: Record<Rarity, string> = {
  comune:     "255,255,255",
  raro:       "56,189,248",
  epico:      "192,132,252",
  leggendario:"251,191,36",
};

const RARITY_TEXT: Record<Rarity, string> = {
  comune:     "text-zinc-200",
  raro:       "text-sky-400",
  epico:      "text-violet-400",
  leggendario:"text-amber-400",
};

const RARITY_BADGE: Record<Rarity, string> = {
  comune:     "Comune",
  raro:       "Raro",
  epico:      "Epico",
  leggendario:"⭐ Leggendario",
};

const TIER_IMAGES: Record<MysteryTier, Record<Rarity, string>> = {
  bronze: {
    comune:     "/shop/bronze-mystery-comuni-1000.png",
    raro:       "/shop/bronze-mystery-rari-5000.png",
    epico:      "/shop/bronze-mystery-epici-10000.png",
    leggendario:"/shop/bronze-mystery-leggendari-20000.png",
  },
  silver: {
    comune:     "/shop/silver-mystery-comuni-20000.png",
    raro:       "/shop/silver-mystery-rari-50000.png",
    epico:      "/shop/silver-mystery-epici-100000.png",
    leggendario:"/shop/silver-mystery-leggendari-giftcard.png",
  },
  gold: {
    comune:     "/shop/gold-box-rail-comune.png",
    raro:       "/shop/gold-box-rail-raro.png",
    epico:      "/shop/gold-box-rail-epico.png",
    leggendario:"/shop/gold-box-rail-giftcard-100eur-leggendario.png",
  },
};

const TIER_CYCLE: Record<MysteryTier, Rarity[]> = {
  bronze: BRONZE_MYSTERY_RAIL_RARITY_CYCLE as Rarity[],
  silver: SILVER_MYSTERY_RAIL_RARITY_CYCLE as Rarity[],
  gold:   GOLD_MYSTERY_RAIL_RARITY_CYCLE as Rarity[],
};

const TIER_NAME:   Record<MysteryTier, string> = { bronze:"Bronze Box", silver:"Silver Box", gold:"Gold Box" };
const TIER_ACCENT: Record<MysteryTier, string> = { bronze:"#cd7f32",   silver:"#c0c0c0",   gold:"#fbbf24"  };

function pickRarity(tier: MysteryTier): Rarity {
  const r = Math.random() * 100;
  if (tier === "silver") {
    if (r < 60) return "comune"; if (r < 80) return "raro"; if (r < 90) return "epico"; return "leggendario";
  }
  if (r < 60) return "comune"; if (r < 80) return "raro"; if (r < 95) return "epico"; return "leggendario";
}

const creditsFmt = new Intl.NumberFormat("it-IT");

function getPrizeLabel(tier: MysteryTier, rarity: Rarity): string {
  if (tier === "bronze") return `${creditsFmt.format(BRONZE_MYSTERY_PRIZE_TIERS[rarity].credits)} crediti`;
  if (tier === "silver") {
    const t = SILVER_MYSTERY_PRIZE_TIERS[rarity];
    return t.kind === "credits" ? `${creditsFmt.format(t.credits)} crediti` : t.rewardLabel;
  }
  return GOLD_MYSTERY_PRIZE_TIERS[rarity].rewardLabel;
}

/** 3-phase easing: cubic ease-in → linear → quart ease-out */
function spinEasing(t: number): number {
  if (t < 0.08) { const u = t / 0.08; return u * u * u * 0.06; }
  if (t < 0.78) { return 0.06 + ((t - 0.08) / 0.70) * 0.84; }
  const u = (t - 0.78) / 0.22;
  return 0.90 + (1 - Math.pow(1 - u, 4)) * 0.10;
}

interface Props { tier: MysteryTier; isOpen: boolean; onClose: () => void; }

export default function MysteryUnboxingOverlay({ tier, isOpen, onClose }: Props) {
  const [isMounted, setIsMounted]     = useState(false);
  const [phase, setPhase]             = useState<Phase>("opening");
  const [winnerIdx, setWinnerIdx]     = useState<number | null>(null);
  const [winnerRarity, setWinnerRarity] = useState<Rarity | null>(null);

  const trackRef    = useRef<HTMLDivElement>(null);
  const rafRef      = useRef<number>(0);
  const swipeRef    = useRef<number | null>(null);
  const hasSpunRef  = useRef(false);

  const track = useMemo<Rarity[]>(() => {
    const arr: Rarity[] = [];
    for (let i = 0; i < TRACK_REPEATS; i++) for (const r of TIER_CYCLE[tier]) arr.push(r);
    return arr;
  }, [tier]);

  useEffect(() => { setIsMounted(true); }, []);

  // Reset on open + schedule curtain reveal
  useEffect(() => {
    if (!isOpen) return;
    hasSpunRef.current = false;
    setWinnerIdx(null);
    setWinnerRarity(null);
    setPhase("opening");
    const t = setTimeout(() => setPhase("ready"), 1450);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Start preview auto-scroll when ready
  useEffect(() => {
    if (phase !== "ready") return;
    const el = trackRef.current;
    if (!el) return;
    const vw = window.innerWidth;
    const from = vw / 2 - (START_CARD * CARD_PITCH + CARD_HALF);
    const to   = from - PREVIEW_CARDS * CARD_PITCH;
    el.style.setProperty("--ubx-from", `${from}px`);
    el.style.setProperty("--ubx-to",   `${to}px`);
    el.style.animation = `unboxing-preview-scroll ${PREVIEW_S}s linear forwards`;
  }, [phase]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Remove per-card DOM spotlight styles
  const clearSpotlight = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i] as HTMLElement;
      c.style.transform = "";
      c.style.filter    = "";
      c.style.zIndex    = "";
    }
  }, []);

  // Apply proximity-based scale+brightness to cards near center
  const applySpotlight = useCallback((el: HTMLElement, tx: number, vw: number) => {
    const px = vw / 2;
    const center = (px - tx - CARD_HALF) / CARD_PITCH;
    for (let off = -2; off <= 2; off++) {
      const idx = Math.round(center) + off;
      if (idx < 0 || idx >= track.length) continue;
      const card = el.children[idx] as HTMLElement;
      if (!card) continue;
      const cardX = tx + idx * CARD_PITCH + CARD_HALF;
      const prox  = Math.max(0, 1 - Math.abs(cardX - px) / (CARD_PITCH * 1.1));
      if (prox > 0.02) {
        card.style.transform = `scale(${1 + 0.18 * prox})`;
        card.style.filter    = `brightness(${1 + 0.5 * prox})`;
        card.style.zIndex    = prox > 0.55 ? "5" : "";
      } else {
        card.style.transform = "";
        card.style.filter    = "";
        card.style.zIndex    = "";
      }
    }
  }, [track.length]);

  const triggerSpin = useCallback(() => {
    if (phase !== "ready" || hasSpunRef.current) return;
    hasSpunRef.current = true;

    const rarity = pickRarity(tier);
    const candidates = track
      .map((r, i) => ({ r, i }))
      .filter(({ r, i }) => r === rarity && i >= WINNER_MIN && i <= WINNER_MAX);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    setWinnerIdx(chosen.i);
    setWinnerRarity(rarity);
    setPhase("spinning");

    const el = trackRef.current;
    if (!el) return;

    // Capture current position from the running CSS preview animation
    el.style.animationPlayState = "paused";
    const m = new DOMMatrix(getComputedStyle(el).transform);
    const vw = window.innerWidth;
    const capturedTx = isFinite(m.m41) && m.m41 !== 0
      ? m.m41
      : vw / 2 - (START_CARD * CARD_PITCH + CARD_HALF);
    el.style.animation = "none";
    el.style.transform = `translateX(${capturedTx}px)`;

    const finalTx = vw / 2 - (chosen.i * CARD_PITCH + CARD_HALF);
    const delta   = finalTx - capturedTx;
    const t0      = performance.now();

    const animate = (now: number) => {
      const t  = Math.min((now - t0) / SPIN_MS, 1);
      const tx = capturedTx + spinEasing(t) * delta;
      el.style.transform = `translateX(${tx}px)`;
      if (t > SPOTLIGHT_START_T) applySpotlight(el, tx, vw);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        el.style.transform = `translateX(${finalTx}px)`;
        clearSpotlight();
        setTimeout(() => setPhase("result"), 200);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [phase, tier, track, applySpotlight, clearSpotlight]);

  const handleClose = useCallback(() => {
    setPhase("closing");
    setTimeout(onClose, 350);
  }, [onClose]);

  const onTouchStart = useCallback((e: React.TouchEvent) => { swipeRef.current = e.touches[0].clientX; }, []);
  const onTouchEnd   = useCallback((e: React.TouchEvent) => {
    if (swipeRef.current === null) return;
    const d = Math.abs(e.changedTouches[0].clientX - swipeRef.current);
    swipeRef.current = null;
    if (d > 24) triggerSpin();
  }, [triggerSpin]);
  const onMouseDown = useCallback((e: React.MouseEvent) => { swipeRef.current = e.clientX; }, []);
  const onMouseUp   = useCallback((e: React.MouseEvent) => {
    if (swipeRef.current === null) return;
    const d = Math.abs(e.clientX - swipeRef.current);
    swipeRef.current = null;
    if (d > 12) triggerSpin();
  }, [triggerSpin]);

  const accent   = TIER_ACCENT[tier];
  const images   = TIER_IMAGES[tier];
  const isResult = phase === "result";

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      className={[
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
        phase === "closing" ? "unboxing-overlay-closing" : "unboxing-overlay-opening",
      ].join(" ")}
      role="dialog" aria-modal aria-label={`Apertura ${TIER_NAME[tier]}`}
    >
      {/* Backdrop + vignette */}
      <div className="absolute inset-0 bg-[#02030b]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_130%_130%_at_50%_50%,transparent_30%,rgba(0,0,0,0.78)_100%)]" />

      {/* Curtains */}
      {phase === "opening" && (
        <>
          <div className="unboxing-curtain-l absolute inset-y-0 left-0 z-[30] w-1/2"
            style={{ background:"linear-gradient(to right,#060810 55%,#0e1625 100%)", boxShadow:"inset -6px 0 32px rgba(0,0,0,0.55)" }} />
          <div className="unboxing-curtain-r absolute inset-y-0 right-0 z-[30] w-1/2"
            style={{ background:"linear-gradient(to left,#060810 55%,#0e1625 100%)", boxShadow:"inset 6px 0 32px rgba(0,0,0,0.55)" }} />
        </>
      )}

      {/* Main content */}
      {phase !== "opening" && (
        <div className="relative z-[10] flex w-full flex-col items-center gap-5">

          {/* Header */}
          <div className="flex flex-col items-center gap-1 text-center"
            style={{ animation:"unboxing-content-in 0.5s ease-out both" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-65"
              style={{ color: accent }}>Mystery Box</p>
            <h2 className="font-kalshi text-[2rem] font-bold text-white sm:text-[2.4rem]">
              {TIER_NAME[tier]}
            </h2>
          </div>

          {/* Rail area */}
          <div className="relative w-full"
            style={{ animation:"unboxing-content-in 0.55s 0.07s ease-out both" }}>

            {/* Winner radial burst (result only) */}
            {isResult && winnerRarity && (
              <div className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] -translate-x-1/2"
                style={{
                  width: 520,
                  background: `radial-gradient(ellipse at center, rgba(${RARITY_GLOW[winnerRarity]},0.24) 0%, transparent 68%)`,
                  animation: "unboxing-winner-burst 2.5s ease-in-out infinite",
                }} />
            )}

            {/* Top pointer */}
            <div className="unboxing-pointer pointer-events-none absolute -top-1 left-1/2 z-[20] flex -translate-x-1/2 flex-col items-center"
              style={isResult ? { filter:`drop-shadow(0 0 16px ${accent})` } : undefined}>
              <div style={{ width:0, height:0,
                borderLeft:"12px solid transparent", borderRight:"12px solid transparent",
                borderTop:`20px solid ${accent}`, filter:`drop-shadow(0 0 10px ${accent}cc)` }} />
              <div style={{ width:2, height:24, background:`linear-gradient(to bottom,${accent},transparent)` }} />
            </div>

            {/* Bottom pointer */}
            <div className="unboxing-pointer pointer-events-none absolute -bottom-1 left-1/2 z-[20] flex -translate-x-1/2 flex-col items-center"
              style={isResult ? { filter:`drop-shadow(0 0 16px ${accent})` } : undefined}>
              <div style={{ width:2, height:24, background:`linear-gradient(to top,${accent},transparent)` }} />
              <div style={{ width:0, height:0,
                borderLeft:"12px solid transparent", borderRight:"12px solid transparent",
                borderBottom:`20px solid ${accent}`, filter:`drop-shadow(0 0 10px ${accent}cc)` }} />
            </div>

            {/* Center guide line */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-[19] w-[2px] -translate-x-px"
              style={{ background:`linear-gradient(to bottom,transparent,${accent}44 28%,${accent}99 50%,${accent}44 72%,transparent)` }} />

            {/* Track container — overflow visible in result so winner glow isn't clipped */}
            <div
              className={["relative", !isResult && "overflow-hidden"].filter(Boolean).join(" ")}
              style={{
                maskImage:       isResult ? "none" : "linear-gradient(to right,transparent 0%,black 10%,black 90%,transparent 100%)",
                WebkitMaskImage: isResult ? "none" : "linear-gradient(to right,transparent 0%,black 10%,black 90%,transparent 100%)",
              }}
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}   onMouseUp={onMouseUp}
            >
              <div
                ref={trackRef}
                className="flex flex-row items-stretch py-9"
                style={{ gap:`${CARD_GAP}px`, willChange:"transform", userSelect:"none",
                  cursor: phase === "ready" ? "grab" : "default" }}
              >
                {track.map((rarity, i) => (
                  <UnboxingCard
                    key={i}
                    rarity={rarity}
                    imageSrc={images[rarity]}
                    isWinner={isResult && winnerIdx === i}
                    isEliminated={isResult && winnerIdx !== null && winnerIdx !== i}
                    glowRgb={RARITY_GLOW[rarity]}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Spin CTA */}
          {phase === "ready" && (
            <div className="flex flex-col items-center gap-3"
              style={{ animation:"unboxing-content-in 0.5s 0.14s ease-out both" }}>
              <button
                onClick={triggerSpin}
                className="group relative overflow-hidden rounded-full px-9 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{ background:`linear-gradient(135deg,${accent}22,${accent}55)`,
                  border:`1px solid ${accent}88`, boxShadow:`0 0 28px ${accent}44` }}
              >
                <span className="relative z-[1]">Apri la Box</span>
                <span className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background:`linear-gradient(135deg,${accent}33,transparent)` }} />
              </button>
              <p className="unboxing-swipe-hint flex items-center gap-1.5 text-xs text-white/40">
                <span>←</span><span>o trascina il rail</span><span>→</span>
              </p>
            </div>
          )}

          {/* Result */}
          {isResult && winnerRarity && (
            <div className="flex flex-col items-center gap-4 text-center"
              style={{ animation:"unboxing-result-in 0.65s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-60"
                  style={{ color: accent }}>Hai vinto</p>
                <p className={`font-kalshi text-4xl font-bold sm:text-5xl ${RARITY_TEXT[winnerRarity]}`}
                  style={{ textShadow:`0 0 28px rgba(${RARITY_GLOW[winnerRarity]},0.55)` }}>
                  {getPrizeLabel(tier, winnerRarity)}
                </p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-white/45">
                  {RARITY_BADGE[winnerRarity]}
                </p>
              </div>
              <button onClick={handleClose}
                className="rounded-full px-10 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{ background:`linear-gradient(135deg,${accent}44,${accent}88)`,
                  border:`1px solid ${accent}`, boxShadow:`0 0 36px ${accent}55` }}>
                Fantastico!
              </button>
            </div>
          )}
        </div>
      )}

      {/* Close ✕ */}
      {phase !== "opening" && phase !== "spinning" && (
        <button onClick={handleClose}
          className="absolute right-4 top-4 z-[40] flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition-colors hover:text-white/85"
          style={{ background:"rgba(255,255,255,0.055)", border:"1px solid rgba(255,255,255,0.1)" }}
          aria-label="Chiudi">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>,
    document.body,
  );
}

interface CardProps {
  rarity: Rarity; imageSrc: string;
  isWinner: boolean; isEliminated: boolean; glowRgb: string;
}

function UnboxingCard({ rarity, imageSrc, isWinner, isEliminated, glowRgb }: CardProps) {
  const premium = mysteryRailPremiumMotion(rarity);
  return (
    <div
      className={["w-[176px] min-w-[176px] shrink-0 rounded-[0.9rem] p-px", RARITY_OUTLINE[rarity]].join(" ")}
      style={{
        opacity:    isEliminated ? 0 : 1,
        transition: isEliminated ? "opacity 0.55s ease" : undefined,
        animation:  isWinner
          ? "unboxing-winner-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards, unboxing-winner-glow 2.2s ease-in-out 0.5s infinite"
          : undefined,
        boxShadow: isWinner
          ? `0 0 36px 8px rgba(${glowRgb},0.55), 0 0 72px 24px rgba(${glowRgb},0.3), 0 0 130px 50px rgba(${glowRgb},0.14)`
          : undefined,
        position: isWinner ? "relative" : undefined,
        zIndex:   isWinner ? 10 : undefined,
      }}
    >
      <article className="relative isolate h-[12rem] w-full overflow-hidden rounded-[0.85rem] bg-black/20">
        <Image src={imageSrc} alt={rarity} fill
          className="z-0 object-cover object-center" sizes="176px" draggable={false} />
        {premium && <MysteryRailPremiumFx variant={rarity === "leggendario" ? "legend" : "epic"} />}
      </article>
    </div>
  );
}
