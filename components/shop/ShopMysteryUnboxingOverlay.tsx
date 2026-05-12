"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  buildMysteryArenaSequence,
  getMysteryPrizeRevealCopy,
  MYSTERY_TIER_RARITY_IMAGE,
  type MysteryUnboxingRarity,
  type MysteryUnboxingTier,
} from "@/lib/shop-mystery-unboxing";
import { BRONZE_MYSTERY_RAIL_RARITY_CYCLE } from "@/lib/shop-bronze-mystery-prizes";
import { SILVER_MYSTERY_RAIL_RARITY_CYCLE } from "@/lib/shop-silver-mystery-prizes";
import { GOLD_MYSTERY_RAIL_RARITY_CYCLE } from "@/lib/shop-gold-mystery-prizes";
import type { MysteryUnboxingSession } from "@/components/shop/ShopMysteryUnboxingProvider";

/* ---------- PRNG deterministico (mulberry32) -------------------------------- */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/* ---------- Dimensioni arena ------------------------------------------------ */
const ARENA_CARD_WIDTH = 160;
const ARENA_CARD_HEIGHT = 192;
const ARENA_CARD_GAP = 48;
const ARENA_CARD_STEP = ARENA_CARD_WIDTH + ARENA_CARD_GAP;
/** Numero di card visibili a sinistra del centro all'apertura del reel. */
const INITIAL_SCROLL_POS = 4 * ARENA_CARD_STEP;

/* ---------- Timeline -------------------------------------------------------- */
/** Allineato a `globals.css` (sipario cinematico). */
const CURTAIN_IN_MS = 820;
const CURTAIN_PAUSE_MS = 700;
const CURTAIN_OUT_MS = 1500;
const PRIMING_MS = 720;

const REEL_MIN_SCROLL = 0;
const WHEEL_SENS = 2.45;
const FLING_VEL_CAP = 36;
const FRICTION_MUL = 0.988;
const STOP_VEL = 0.08;
const SNAP_MIN_MS = 520;
const SNAP_MAX_MS = 2200;
const RUBBER = 0.22;
const MAX_OVERSCROLL = ARENA_CARD_STEP * 0.55;

/* ---------- Lookup palette -------------------------------------------------- */
const RARITY_OUTLINE: Record<string, string> = {
  comune: "bg-gradient-to-br from-white via-zinc-100 to-zinc-400",
  raro: "bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-700",
  epico: "bg-gradient-to-br from-violet-300 via-fuchsia-400 to-violet-900",
  leggendario: "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700",
};
const RARITY_GLOW: Record<string, string> = {
  comune: "rgba(226,232,240,0.55)",
  raro: "rgba(56,189,248,0.65)",
  epico: "rgba(192,132,252,0.7)",
  leggendario: "rgba(250,204,21,0.78)",
};
const RARITY_PARTICLE_COLOR: Record<string, string> = {
  comune: "rgba(255,255,255,0.85)",
  raro: "rgba(125,211,252,0.95)",
  epico: "rgba(216,180,254,0.95)",
  leggendario: "rgba(253,224,71,0.98)",
};
const RARITY_BADGE_CLASS: Record<string, string> = {
  comune: "text-white/80 border-white/25 bg-white/[0.07]",
  raro: "text-sky-200 border-sky-400/35 bg-sky-400/[0.09]",
  epico: "text-fuchsia-200 border-fuchsia-400/35 bg-fuchsia-400/[0.09]",
  leggendario: "text-amber-200 border-amber-400/45 bg-amber-400/[0.12]",
};
const TIER_LABEL: Record<MysteryUnboxingTier, string> = {
  bronze: "Bronze Box",
  silver: "Silver Box",
  gold: "Gold Box",
};

/* ---------- helpers --------------------------------------------------------- */
function getCycle(tier: MysteryUnboxingTier): readonly MysteryUnboxingRarity[] {
  if (tier === "bronze") return BRONZE_MYSTERY_RAIL_RARITY_CYCLE as readonly MysteryUnboxingRarity[];
  if (tier === "silver") return SILVER_MYSTERY_RAIL_RARITY_CYCLE as readonly MysteryUnboxingRarity[];
  return GOLD_MYSTERY_RAIL_RARITY_CYCLE as readonly MysteryUnboxingRarity[];
}

/* ---------- ArenaCard (rail) ------------------------------------------------ */
function ArenaCard({
  tier,
  rarity,
}: {
  tier: MysteryUnboxingTier;
  rarity: MysteryUnboxingRarity;
}) {
  const src = MYSTERY_TIER_RARITY_IMAGE[tier][rarity] ?? "";
  return (
    <div
      className={[
        "shop-mystery-arena-card shrink-0 rounded-[0.9rem] p-px",
        RARITY_OUTLINE[rarity] ?? RARITY_OUTLINE.comune,
      ].join(" ")}
      style={{
        width: ARENA_CARD_WIDTH,
        height: ARENA_CARD_HEIGHT,
        ["--arena-card-glow" as string]: RARITY_GLOW[rarity] ?? RARITY_GLOW.comune,
      }}
    >
      <div className="relative isolate h-full w-full overflow-hidden rounded-[calc(0.9rem-1px)] bg-black/20">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="160px"
            className="z-0 object-cover object-center"
            draggable={false}
            priority={false}
          />
        ) : null}
      </div>
    </div>
  );
}

/* ---------- WinnerSpotlight — card centrale + celebrazione finale ------------ */
function WinnerSpotlight({
  tier,
  rarity,
  seed,
  showParticles,
  showCopy,
  revealCopy,
  celebrationLayout,
}: {
  tier: MysteryUnboxingTier;
  rarity: MysteryUnboxingRarity;
  seed: string;
  showParticles: boolean;
  showCopy: boolean;
  revealCopy: { title: string; subtitle: string; rarityLabel: string };
  /** Schermata finale: card fluttua, copy “Congratulazioni…”. */
  celebrationLayout?: boolean;
}) {
  const src = MYSTERY_TIER_RARITY_IMAGE[tier][rarity] ?? "";
  const glow = RARITY_GLOW[rarity] ?? RARITY_GLOW.comune;
  const badgeClass = RARITY_BADGE_CLASS[rarity] ?? RARITY_BADGE_CLASS.comune;

  const isLegendary = rarity === "leggendario";
  const particleCount = isLegendary ? 52 : 24;

  const particles = useMemo(() => {
    const rand = mulberry32(seedFromString(seed));
    return Array.from({ length: particleCount }).map((_, i) => ({
      i,
      angle: (i / particleCount) * Math.PI * 2,
      distance: isLegendary ? 160 + rand() * 280 : 140 + rand() * 200,
      delay: rand() * (isLegendary ? 240 : 160),
      duration: (isLegendary ? 1300 : 1100) + rand() * 900,
      size: isLegendary ? 5 + rand() * 9 : 4 + rand() * 6,
    }));
  }, [seed, particleCount, isLegendary]);
  const particleColor = RARITY_PARTICLE_COLOR[rarity] ?? "rgba(255,255,255,0.9)";

  return (
    <div
      className={[
        "shop-mystery-winner-spotlight absolute inset-0 z-[10] flex flex-col items-center justify-center",
        celebrationLayout ? "shop-mystery-winner-spotlight--celebration" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-rarity={rarity}
      style={{ gap: "clamp(12px, 3vh, 24px)" }}
    >
      <div
        className="shop-mystery-winner-halo"
        style={{ ["--winner-glow" as string]: glow }}
        aria-hidden
      />

      {/* Raggi dorati coroforma — solo leggendario */}
      {isLegendary ? (
        <div className="shop-mystery-winner-gold-crown" aria-hidden />
      ) : null}

      <div
        className="shop-mystery-winner-3d-scene"
        style={{ ["--winner-glow" as string]: glow }}
      >
        <div
          className={[
            "shop-mystery-winner-3d-card",
            celebrationLayout ? "shop-mystery-winner-3d-card--celebration-float" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            className={[
              "h-full w-full rounded-[1.15rem] p-[1.5px]",
              RARITY_OUTLINE[rarity] ?? RARITY_OUTLINE.comune,
            ].join(" ")}
          >
            <div className="relative isolate h-full w-full overflow-hidden rounded-[1.08rem] bg-black/20">
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 65vw, 240px"
                  className="z-0 object-cover object-center"
                  draggable={false}
                  priority
                />
              ) : null}
              <div
                className={[
                  "shop-mystery-winner-card-sheen pointer-events-none absolute inset-0 z-[2]",
                  celebrationLayout ? "shop-mystery-winner-card-sheen--loop" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden
              />
              {celebrationLayout ? (
                <span
                  className="shop-mystery-winner-celebration-twinkle pointer-events-none absolute inset-0 z-[4]"
                  aria-hidden
                />
              ) : null}
              {/* Shimmer dorato ripetuto sul fronte della card — solo leggendario */}
              {isLegendary ? (
                <div
                  className="shop-mystery-winner-gold-foil pointer-events-none absolute inset-0 z-[3]"
                  aria-hidden
                />
              ) : null}
            </div>
          </div>
          <div
            className="shop-mystery-winner-card-halo"
            style={{ ["--winner-glow" as string]: glow }}
            aria-hidden
          />
          {/* Anello orbitante dorato — solo leggendario */}
          {isLegendary ? (
            <div className="shop-mystery-winner-gold-ring" aria-hidden />
          ) : null}
        </div>

        {showParticles ? (
          <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
            {particles.map((p) => (
              <span
                key={p.i}
                className={[
                  "shop-mystery-arena-particle",
                  isLegendary ? "shop-mystery-arena-particle--legendary" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  ["--p-x" as string]: `${Math.cos(p.angle) * p.distance}px`,
                  ["--p-y" as string]: `${Math.sin(p.angle) * p.distance}px`,
                  ["--p-color" as string]: particleColor,
                  ["--p-size" as string]: `${p.size}px`,
                  animationDelay: `${p.delay}ms`,
                  animationDuration: `${p.duration}ms`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div
        className={[
          "shop-mystery-winner-copy flex flex-col items-center gap-2 px-5 text-center",
          celebrationLayout ? "" : "transition-all duration-600",
          showCopy
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        ].join(" ")}
        aria-live="polite"
      >
        {celebrationLayout ? (
          <>
            <p className="shop-mystery-winner-celebrate-line font-kalshi font-bold leading-snug tracking-[-0.02em] text-white">
              Congratulazioni, hai vinto {revealCopy.title}!
            </p>
            {revealCopy.subtitle ? (
              <p className="max-w-[20rem] text-[0.86rem] text-white/52">{revealCopy.subtitle}</p>
            ) : null}
            <span
              className={[
                "mt-2 rounded-full border px-3 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.34em]",
                isLegendary ? "shop-mystery-legendary-badge" : badgeClass,
              ].join(" ")}
            >
              {revealCopy.rarityLabel}
            </span>
          </>
        ) : (
          <>
            <span
              className={[
                "rounded-full border px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.3em]",
                isLegendary ? "shop-mystery-legendary-badge" : badgeClass,
              ].join(" ")}
            >
              {revealCopy.rarityLabel}
            </span>
            <p
              className={[
                "font-kalshi font-bold leading-tight tracking-[-0.01em]",
                isLegendary
                  ? "shop-mystery-legendary-title"
                  : "text-[clamp(1.6rem,5vw,2.4rem)] text-white",
              ].join(" ")}
            >
              {revealCopy.title}
            </p>
            {revealCopy.subtitle ? (
              <p className="text-[0.82rem] text-white/50">{revealCopy.subtitle}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Phase type ------------------------------------------------------ */
type Phase =
  | "curtain-in"
  | "curtain-hold"
  | "curtain-out"
  | "priming"
  /** In attesa del primo swipe / rotellina */
  | "await-scroll"
  /** Inerzia + input utente */
  | "reel-active"
  /** Decel cinematico sulla posizione vincitrice deterministica */
  | "snap-landing"
  /** Full celebration (niente rail) */
  | "celebrated";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Card index il cui centro è allineato allo scroll `s`. */
function centerCardIndex(scrollPos: number): number {
  return Math.round(scrollPos / ARENA_CARD_STEP);
}

/* ---------- Main overlay ---------------------------------------------------- */
interface OverlayProps {
  session: MysteryUnboxingSession;
  onClose: () => void;
  onReroll: () => void;
}

export default function ShopMysteryUnboxingOverlay({ session, onClose, onReroll: _onReroll }: OverlayProps) {
  const { tier, winner } = session;

  const cycle = useMemo(() => getCycle(tier), [tier]);
  const sequence = useMemo(
    () => buildMysteryArenaSequence(cycle, winner, { length: 64, winnerIndex: 56 }),
    [cycle, winner]
  );

  const winnerScrollTarget = sequence.winnerIndex * ARENA_CARD_STEP;
  const maxScrollRaw = Math.max(
    REEL_MIN_SCROLL,
    (sequence.cards.length - 1) * ARENA_CARD_STEP
  );

  const [phase, setPhase] = useState<Phase>("curtain-in");
  const [arenaWidth, setArenaWidth] = useState(0);
  const [, forceRender] = useState(0);
  const phaseRef = useRef<Phase>("curtain-in");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const isCurtainPhaseOnly =
    phase === "curtain-in" || phase === "curtain-hold" || phase === "curtain-out";

  const isCelebrated = phase === "celebrated";

  /** Primo ingresso dopo priming → riallinea track a 0. */
  const scrollPosRef = useRef(0);
  const velRef = useRef(0);
  const touchingRef = useRef(false);
  const pointersDownRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragStartClientXRef = useRef(0);
  const physicsRafRef = useRef<number>(0);
  const tickerRafRef = useRef<number>(0);
  const lastPhysicsTsRef = useRef<number | null>(null);
  const tickerLastTickIdxRef = useRef(-9999);
  const snapRafRef = useRef<number>(0);

  const arenaRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tickerTopRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const bump = useCallback(() => {
    forceRender((n) => n + 1);
  }, []);

  const clampScrollHard = useCallback(
    (s: number) => clamp(s, REEL_MIN_SCROLL, maxScrollRaw),
    [maxScrollRaw]
  );

  const clampScrollRubber = useCallback(
    (s: number) => {
      if (s < REEL_MIN_SCROLL) {
        const o = REEL_MIN_SCROLL - s;
        return REEL_MIN_SCROLL - Math.min(o * RUBBER, MAX_OVERSCROLL);
      }
      if (s > maxScrollRaw) {
        const o = s - maxScrollRaw;
        return maxScrollRaw + Math.min(o * RUBBER, MAX_OVERSCROLL);
      }
      return s;
    },
    [maxScrollRaw]
  );

  const applyScrollToTrackDOM = useCallback((s: number) => {
    const tr = trackRef.current;
    if (!tr) return;
    tr.style.transform = `translate3d(${-s}px, 0, 0)`;
  }, []);

  /** Scroll lock + ESC (solo dopo celebrazione). */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "celebrated") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, onClose]);

  /** Misura arena. */
  useLayoutEffect(() => {
    const measure = () => {
      const el = arenaRef.current;
      if (!el) return;
      setArenaWidth(el.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (arenaRef.current) ro.observe(arenaRef.current);
    return () => ro.disconnect();
  }, []);

  /** Quando cambia larghezza arena, preserva centro numerico sulla card più vicina. */
  useLayoutEffect(() => {
    if (
      arenaWidth <= 0 ||
      phase === "curtain-in" ||
      phase === "curtain-hold" ||
      phase === "curtain-out" ||
      phase === "priming" ||
      phase === "celebrated"
    ) {
      return;
    }
    applyScrollToTrackDOM(scrollPosRef.current);
  }, [arenaWidth, phase, applyScrollToTrackDOM]);

  /** Sipario → priming → attesa swipe (skip completo del reel se riduce-motion). */
  useEffect(() => {
    let cancelled = false;

    const goAwait = () => {
      if (cancelled) return;
      setPhase(prefersReducedMotion ? "celebrated" : "await-scroll");
    };

    const t = [
      [CURTAIN_IN_MS, () => void setPhase("curtain-hold")],
      [CURTAIN_IN_MS + CURTAIN_PAUSE_MS, () => void setPhase("curtain-out")],
      [
        CURTAIN_IN_MS + CURTAIN_PAUSE_MS + CURTAIN_OUT_MS,
        () => void setPhase("priming"),
      ],
      [
        CURTAIN_IN_MS + CURTAIN_PAUSE_MS + CURTAIN_OUT_MS + PRIMING_MS,
        () => void goAwait(),
      ],
    ] as const;

    const timers = t.map(([delay, fn]) => window.setTimeout(fn, delay));
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [prefersReducedMotion]);

  /** Reset fisica & track quando cambia arena o ingresso reel. */
  useLayoutEffect(() => {
    if (phase !== "await-scroll") return;
    scrollPosRef.current = INITIAL_SCROLL_POS;
    velRef.current = 0;
    lastPhysicsTsRef.current = null;
    tickerLastTickIdxRef.current = centerCardIndex(INITIAL_SCROLL_POS);
    applyScrollToTrackDOM(INITIAL_SCROLL_POS);
  }, [phase, session.sessionId, applyScrollToTrackDOM]);

  const beginSpinFromUserInput = useCallback(() => {
    setPhase((p) => (p === "await-scroll" ? "reel-active" : p));
    lastPhysicsTsRef.current = performance.now();
  }, []);

  /** Fisica inerzia (solo `reel-active`, touch gestito direttamente sugli handler pointer). */
  useEffect(() => {
    if (phase !== "reel-active") {
      cancelAnimationFrame(physicsRafRef.current);
      return;
    }

    const loop = () => {
      if (touchingRef.current) {
        physicsRafRef.current = requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      const lastTs = lastPhysicsTsRef.current ?? now;
      let dtMs = Math.min(now - lastTs, 48);
      lastPhysicsTsRef.current = now;

      let scroll = scrollPosRef.current;
      let vel = velRef.current;

      scroll += vel * dtMs;
      scroll = clampScrollRubber(scroll);

      const decel = Math.pow(FRICTION_MUL, dtMs / 16.667);
      vel *= decel;

      scrollPosRef.current = scroll;
      velRef.current = vel;
      applyScrollToTrackDOM(scroll);

      if (Math.abs(vel) < STOP_VEL) {
        velRef.current = 0;
        scrollPosRef.current = clampScrollHard(scroll);
        applyScrollToTrackDOM(scrollPosRef.current);
        setPhase("snap-landing");
        return;
      }

      physicsRafRef.current = requestAnimationFrame(loop);
    };

    physicsRafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(physicsRafRef.current);
    };
  }, [phase, clampScrollRubber, clampScrollHard, applyScrollToTrackDOM]);

  /** Passivo ticker durante snap (centratura numerica sulla card vinta). */
  useEffect(() => {
    const runSnap = () => {
      const from = scrollPosRef.current;
      const goal = clampScrollHard(winnerScrollTarget);
      const dist = Math.abs(goal - from);
      const spdHint = clamp(Math.abs(velRef.current) * 520, SNAP_MIN_MS, SNAP_MAX_MS);
      const dur = prefersReducedMotion ? 260 : clamp(680 + Math.sqrt(dist) * 62, SNAP_MIN_MS, spdHint);

      const t0 = performance.now();
      velRef.current = 0;

      const easeOutExpoPow = (t: number) => 1 - Math.pow(1 - t, 3.5);

      const tick = () => {
        const t = clamp((performance.now() - t0) / dur, 0, 1);
        const e = easeOutExpoPow(t);
        scrollPosRef.current = from + (goal - from) * e;
        applyScrollToTrackDOM(scrollPosRef.current);
        if (t < 1) {
          snapRafRef.current = requestAnimationFrame(tick);
        } else {
          scrollPosRef.current = goal;
          applyScrollToTrackDOM(goal);
          setPhase("celebrated");
        }
      };

      snapRafRef.current = requestAnimationFrame(tick);
    };

    if (phase !== "snap-landing") {
      cancelAnimationFrame(snapRafRef.current);
      return () => {};
    }

    runSnap();

    return () => {
      cancelAnimationFrame(snapRafRef.current);
    };
  }, [phase, winnerScrollTarget, clampScrollHard, applyScrollToTrackDOM, prefersReducedMotion]);

  /**
   * Ticker RAF (deflessione bacchettino mentre la sequenza sfreccia anche senza touch,
   * ad esempio durante lo snap cinematografico).
   */
  useEffect(() => {
    if (phase !== "reel-active" && phase !== "snap-landing") return;
    if (prefersReducedMotion) return;

    const topArm = tickerTopRef.current;
    const indic = indicatorRef.current;
    if (!topArm) return;

    let lastX = scrollPosRef.current;
    tickerLastTickIdxRef.current = Math.round(lastX / ARENA_CARD_STEP);

    const tickerLoop = () => {
      const x = scrollPosRef.current;
      const speedPx = Math.abs(x - lastX);
      lastX = x;

      const cardRounded = Math.round(x / ARENA_CARD_STEP);

      if (cardRounded !== tickerLastTickIdxRef.current && speedPx > 0.035) {
        tickerLastTickIdxRef.current = cardRounded;
        const deg = clamp(speedPx * 0.75 + 3, 4, 30);
        const dur = clamp(320 - speedPx * 2.9, 120, 300);
        topArm.style.setProperty("--tick-deg", `${deg}deg`);
        topArm.style.setProperty("--tick-dur", `${dur}ms`);
        topArm.classList.remove("shop-mystery-ticker--active");
        void topArm.offsetWidth;
        topArm.classList.add("shop-mystery-ticker--active");
        if (indic) {
          indic.classList.remove("shop-mystery-indicator--flash");
          void indic.offsetWidth;
          indic.classList.add("shop-mystery-indicator--flash");
        }
      }

      tickerRafRef.current = requestAnimationFrame(tickerLoop);
    };

    tickerRafRef.current = requestAnimationFrame(tickerLoop);
    return () => cancelAnimationFrame(tickerRafRef.current);
  }, [phase, prefersReducedMotion]);

  const onWheelArena = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      if (
        prefersReducedMotion ||
        phase === "celebrated" ||
        phase === "snap-landing" ||
        phase === "priming" ||
        isCurtainPhaseOnly
      ) {
        return;
      }

      /** Blocchi lo scroll della pagina dietro mentre il reel consuma la rotellina */
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const dominant = absX >= absY ? e.deltaX : e.deltaY;
      if (Math.abs(dominant) < 0.5) return;

      e.preventDefault();
      e.stopPropagation();

      if (phase === "await-scroll") beginSpinFromUserInput();

      velRef.current = clamp(
        velRef.current + dominant * 0.031,
        -FLING_VEL_CAP,
        FLING_VEL_CAP
      );

      scrollPosRef.current = clampScrollRubber(
        scrollPosRef.current + dominant * WHEEL_SENS * 0.018
      );
      applyScrollToTrackDOM(scrollPosRef.current);
      lastPhysicsTsRef.current = performance.now();
      bump();
    },
    [
      phase,
      prefersReducedMotion,
      isCurtainPhaseOnly,
      beginSpinFromUserInput,
      clampScrollRubber,
      applyScrollToTrackDOM,
      bump,
    ]
  );

  const pointerDownArena = useCallback(
    (_e: ReactPointerEvent<HTMLDivElement>) => {
      pointersDownRef.current += 1;
      touchingRef.current = true;
      lastPhysicsTsRef.current = performance.now();
      dragStartScrollRef.current = scrollPosRef.current;
      dragStartClientXRef.current = _e.clientX;

      if (prefersReducedMotion) return;

      if (phaseRef.current === "await-scroll") beginSpinFromUserInput();
    },
    [prefersReducedMotion, beginSpinFromUserInput]
  );

  const pointerMoveArena = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      if (
        !touchingRef.current ||
        phaseRef.current === "celebrated" ||
        phaseRef.current === "snap-landing"
      )
        return;
      if (
        phaseRef.current === "await-scroll"
      ) beginSpinFromUserInput();

      const dx = e.clientX - dragStartClientXRef.current;
      const next = clampScrollRubber(dragStartScrollRef.current - dx);
      scrollPosRef.current = next;
      velRef.current = clamp(-e.movementX * 0.38, -FLING_VEL_CAP * 1.55, FLING_VEL_CAP * 1.55);
      applyScrollToTrackDOM(next);
      bump();
    },
    [prefersReducedMotion, clampScrollRubber, applyScrollToTrackDOM, bump, beginSpinFromUserInput]
  );

  const pointerEndArena = useCallback(() => {
    pointersDownRef.current = Math.max(0, pointersDownRef.current - 1);
    touchingRef.current = pointersDownRef.current > 0;
    lastPhysicsTsRef.current = performance.now();
  }, []);

  const attachPointerCapture = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop — vecchi browser */
    }
  }, []);

  const handleBackdropClick = useCallback(() => {
    /* Non chiudibile durante estrazione — solo pulsante finale */
    if (phase === "celebrated") onClose();
  }, [phase, onClose]);

  const handleClaim = useCallback(() => {
    onClose();
  }, [onClose]);

  const reelPhasesReady =
    !isCurtainPhaseOnly &&
    phase !== "priming" &&
    phase !== "celebrated";

  const curtainState =
    phase === "curtain-in" ? "closing" : phase === "curtain-hold" ? "held" : "opening";

  const revealCopy = getMysteryPrizeRevealCopy(tier, winner);

  /** Wheel: serve listener nativo `{ passive:false }` perché React registra passive di default su root. */
  useEffect(() => {
    const el = arenaRef.current;
    const reelOpen =
      (phase === "await-scroll" || phase === "reel-active") && !prefersReducedMotion;
    if (!el || !reelOpen) return;

    const fn = (ev: WheelEvent) => {
      /** Cast su handler React-compatible */
      onWheelArena(ev as unknown as ReactWheelEvent<HTMLDivElement>);
    };
    el.addEventListener("wheel", fn, { passive: false });
    return () => el.removeEventListener("wheel", fn as EventListener);
  }, [phase, prefersReducedMotion, onWheelArena]);

  /** Transizione cursore sulla zona reel */
  const arenaCursor =
    reelPhasesReady && phase !== "snap-landing"
      ? "cursor-grab active:cursor-grabbing"
      : "cursor-default";

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={[
        "shop-mystery-unboxing-overlay fixed inset-0 z-[400]",
        `shop-mystery-unboxing-overlay--${tier}`,
        `shop-mystery-unboxing-overlay--phase-${phase}`,
        `shop-mystery-unboxing-overlay--rarity-${winner}`,
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label={`Apertura ${tier} mystery box`}
    >
      <button
        type="button"
        className="shop-mystery-unboxing-backdrop absolute inset-0 cursor-default"
        aria-label={isCelebrated ? "Chiudi" : "Apertura mystery box"}
        onClick={handleBackdropClick}
        tabIndex={isCelebrated ? 0 : -1}
      />

      <div className="relative z-[1] flex h-full w-full flex-col">
        {/* Cinema bars */}
        <div className="shop-mystery-unboxing-cinema-bars" aria-hidden />

        {/* Sipario */}
        <div
          className="shop-mystery-curtain shop-mystery-curtain--top shop-mystery-curtain-cinematic shop-mystery-curtain--velvet-shift"
          data-state={curtainState}
          aria-hidden
        >
          <span className="shop-mystery-curtain-edge" aria-hidden />
          <span className="shop-mystery-curtain-sweep" aria-hidden />
        </div>
        <div
          className="shop-mystery-curtain shop-mystery-curtain--bottom shop-mystery-curtain-cinematic shop-mystery-curtain--velvet-shift"
          data-state={curtainState}
          aria-hidden
        >
          <span className="shop-mystery-curtain-edge" aria-hidden />
          <span className="shop-mystery-curtain-sweep" aria-hidden />
        </div>

        <div
          className="shop-mystery-curtain-flash shop-mystery-curtain-flash--cinema-v2"
          data-state={curtainState === "held" ? "active" : "idle"}
          aria-hidden
        />

        {phase === "curtain-hold" ? <div className="shop-mystery-curtain-seam shop-mystery-curtain-seam--premium" aria-hidden /> : null}

        <header
          className="shop-mystery-unboxing-header relative z-[3] flex flex-col items-center px-6 pt-8 text-center sm:pt-10"
          data-visible={isCurtainPhaseOnly ? "false" : isCelebrated ? "dim" : "true"}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-white/40">
            {TIER_LABEL[tier]}
          </p>
          <h2 className="mt-1.5 font-kalshi text-[clamp(1.35rem,4.5vw,1.85rem)] font-bold tracking-[-0.01em] text-white">
            {isCurtainPhaseOnly || phase === "priming"
              ? "Apertura in corso…"
              : phase === "await-scroll"
                ? "Tocca o scorri per il premio"
                : phase === "celebrated"
                  ? "Premio garantito"
                  : "Chi vincerà?"}
          </h2>
        </header>

        {/* Arena + scroll hint */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-4 sm:px-6">
          <div
            ref={arenaRef}
            className={[
              "shop-mystery-unboxing-arena relative isolate w-full max-w-3xl overflow-hidden touch-pan-x",
              reelPhasesReady ? "shop-mystery-unboxing-arena--reel-phase" : "",
              arenaCursor,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!isCelebrated}
            role="group"
            aria-label="Rullo premi"
            onPointerDown={(e) => {
              attachPointerCapture(e);
              pointerDownArena(e);
            }}
            onPointerMove={pointerMoveArena}
            onPointerUp={pointerEndArena}
            onPointerCancel={pointerEndArena}
          >
            {reelPhasesReady ? (
              <>
                <div className="shop-mystery-unboxing-arena-spotlight shop-mystery-unboxing-arena-spotlight--subtle" aria-hidden />
                <div className="shop-mystery-arena-rail-shaft" aria-hidden />
              </>
            ) : null}

            {reelPhasesReady ? (
              <>
                <div
                  ref={indicatorRef}
                  className="shop-mystery-unboxing-arena-indicator shop-mystery-wand-indicator"
                  data-phase={phase}
                  aria-hidden
                />
                <div
                  ref={tickerTopRef}
                  className="shop-mystery-arena-ticker shop-mystery-arena-ticker--wand"
                  aria-hidden
                />
              </>
            ) : null}

            {/* Track — transform aggiornata via DOM (smooth + evita reconcile React) */}
            <div
              ref={trackRef}
              className={["shop-mystery-unboxing-arena-track flex items-center"].join(" ")}
              style={
                {
                  gap: `${ARENA_CARD_GAP}px`,
                  paddingInline: arenaWidth > 0 ? `${arenaWidth / 2 - ARENA_CARD_WIDTH / 2}px` : "0px",
                  willChange: "transform",
                } as CSSProperties
              }
            >
              {sequence.cards.map((rarity, i) => (
                <ArenaCard key={`${rarity}-${i}`} tier={tier} rarity={rarity} />
              ))}
            </div>

            {isCelebrated ? (
              <WinnerSpotlight
                tier={tier}
                rarity={winner}
                seed={session.sessionId}
                showParticles
                showCopy
                revealCopy={revealCopy}
                celebrationLayout
              />
            ) : null}

            <div className="shop-mystery-unboxing-arena-edge-fade shop-mystery-unboxing-arena-edge-fade--narrow" aria-hidden />
          </div>

          {/* Scroll hint orizzontale — appare solo in await-scroll, sotto il rail */}
          {phase === "await-scroll" && !prefersReducedMotion ? (
            <div className="shop-mystery-scroll-hint" aria-hidden>
              <svg
                className="shop-mystery-scroll-hint-arrow"
                viewBox="0 0 160 48"
                aria-hidden
              >
                <path
                  className="shop-mystery-scroll-hint-stroke"
                  d="M10 24H128M106 6L146 24M106 42L146 24"
                />
              </svg>
              <p className="shop-mystery-scroll-hint-label">Scorri per iniziare</p>
            </div>
          ) : null}
        </div>

        <footer className="shop-mystery-unboxing-footer relative z-[3] flex flex-col items-center px-6 pb-8 text-center sm:pb-10">
          <div
            className={[
              "flex flex-col items-center justify-center gap-4 transition-all duration-[640ms]",
              isCelebrated
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-4 opacity-0",
            ].join(" ")}
          >
            <button type="button" onClick={handleClaim} className="shop-mystery-unboxing-btn shop-mystery-unboxing-btn--claim">
              Riscatta
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
