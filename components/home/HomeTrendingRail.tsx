"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const TF        = "10,186,181";   // tiffany rgb
const OPEN_MS   = 760;            // fan-out duration
const CLOSE_MS  = 400;            // collapse duration
const SWIPE_THR = 44;             // px to register a swipe

type Phase = "closed" | "opening" | "open" | "closing";

// ─── Responsive layout ─────────────────────────────────────────────────────────
type Layout = {
  cardW:      number;
  cardH:      number;
  halfSpread: number;
  halfDeg:    number;
  maxCards:   number;
};

function useLayout(): Layout {
  const [lay, setLay] = useState<Layout>({
    cardW: 160, cardH: 240, halfSpread: 316, halfDeg: 26, maxCards: 7,
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 400) {
        setLay({ cardW: 96,  cardH: 144, halfSpread: 130, halfDeg: 19, maxCards: 5 });
      } else if (w < 540) {
        setLay({ cardW: 116, cardH: 174, halfSpread: 168, halfDeg: 21, maxCards: 5 });
      } else if (w < 768) {
        setLay({ cardW: 136, cardH: 204, halfSpread: 248, halfDeg: 24, maxCards: 7 });
      } else {
        setLay({ cardW: 160, cardH: 240, halfSpread: 316, halfDeg: 26, maxCards: 7 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return lay;
}

// ─── Deterministic gradient fallback ──────────────────────────────────────────
function FallbackGrad({ seed }: { seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const h1 = h % 360, h2 = (h1 + 55) % 360, h3 = (h1 + 180) % 360;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(140% 95% at 14% 12%, hsl(${h1} 66% 20% / 0.95), transparent 52%),
          radial-gradient(120% 80% at 86% 88%, hsl(${h2} 66% 16% / 0.90), transparent 50%),
          radial-gradient( 80% 60% at 50% 50%, hsl(${h3} 30% 10% / 0.50), transparent 70%),
          linear-gradient(160deg, #0e2244 0%, #050d20 100%)
        `,
      }}
    />
  );
}

// ─── Single fan card ───────────────────────────────────────────────────────────
type FanCardProps = {
  event:      FootballEvent;
  posIdx:     number;
  total:      number;
  centerIdx:  number;
  cardW:      number;
  cardH:      number;
  halfSpread: number;
  halfDeg:    number;
  phase:      Phase;
  hoveredIdx: number | null;
  onHover:    (i: number) => void;
  onLeave:    () => void;
  onNavigate?: () => void;
};

function FanCard({
  event, posIdx, total, centerIdx,
  cardW, cardH, halfSpread, halfDeg,
  phase, hoveredIdx, onHover, onLeave, onNavigate,
}: FanCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const coverUrl = event.aiImageUrl?.trim() || null;
  const hasCover = !!coverUrl && !imgFailed;

  const npos        = total > 1 ? (posIdx - centerIdx) / centerIdx : 0;
  const isCenter    = posIdx === centerIdx;
  const isHovered   = hoveredIdx === posIdx;
  const isHovering  = hoveredIdx !== null;
  const neighborDist = hoveredIdx !== null ? Math.abs(posIdx - hoveredIdx) : Infinity;
  const isOpen      = phase === "opening" || phase === "open";
  const isClosing   = phase === "closing";

  // ── Proportional typography & spacing ─────────────────────────────────────
  const fs = {
    badge:   Math.max(7,  Math.round(cardW * 0.062)),
    prob:    Math.max(8,  Math.round(cardW * 0.072)),
    title:   Math.max(10, Math.round(cardW * 0.086)),
    pad:     Math.max(8,  Math.round(cardW * 0.072)),
    barH:    Math.max(2,  Math.round(cardW * 0.018)),
  };

  // ── Position ───────────────────────────────────────────────────────────────
  const tx  = isOpen ? npos * halfSpread : 0;
  const rot = isOpen ? npos * halfDeg    : 0;

  // Natural fan arc: edge cards curve slightly upward (like held cards)
  const arcY = isOpen ? -(npos * npos * 18) : 0;

  let vy = arcY;
  if (isOpen) {
    if (isCenter && !isHovering)               vy += -20;
    if (isHovered)                             vy += -74;
    else if (isHovering && neighborDist === 1) vy += 10;
    else if (isHovering && neighborDist === 2) vy += 4;
  }

  const scale = !isOpen               ? 1
    : isCenter && !isHovering         ? 1.11
    : isHovered                       ? 1.08
    : isHovering                      ? 0.96
    : 1;

  // Siblings push outward from the hovered card
  let rotPush = 0;
  if (isOpen && isHovering && !isHovered && hoveredIdx !== null) {
    const dir = posIdx < hoveredIdx ? -1 : 1;
    rotPush   = dir * Math.max(0, (4 - neighborDist) * 2.8);
  }

  // When lifted, card counter-rotates toward vertical — simulates pulling free from the hand
  const rotCorrection = isHovered ? -rot * 0.48 : 0;

  // ── Z-index ────────────────────────────────────────────────────────────────
  let zIndex = Math.round(total - Math.abs(posIdx - centerIdx));
  if (isCenter)  zIndex = total + 1;
  if (isHovered) zIndex = total + 6;

  // ── Opacity ────────────────────────────────────────────────────────────────
  const opacity = isOpen && Math.abs(npos) > 0.62 ? 0.72 : 1;

  // ── Stagger: fan opens center-first, collapses edge-first ─────────────────
  const distFromCenter = Math.abs(posIdx - centerIdx);
  // Tighter stagger = single fluid sweep (not sequential pops)
  const fanDelay      = `${distFromCenter * 38}ms`;
  const collapseDelay = `${(centerIdx - distFromCenter) * 20}ms`;
  const staggerDelay  = isClosing ? collapseDelay : fanDelay;
  const animDur        = isClosing ? `${CLOSE_MS}ms` : `${OPEN_MS}ms`;
  // Fan-open: Material decelerate — very fast start, long smooth settle. No overshoot.
  // Fan-close: accelerate-into-stack ease-in.
  const animEase = isClosing
    ? "cubic-bezier(0.55,0,0.72,0.5)"
    : "cubic-bezier(0,0,0.2,1)";

  const baseT = `transform ${animDur} ${animEase} ${staggerDelay}, opacity 0.36s ease`;
  // Hover lift: immediate sharp start, long smooth coast — card visibly reacts
  // within the first 40 ms then glides to final position. No overshoot.
  const hoverT   = "transform 0.44s cubic-bezier(0.1,0,0,1), box-shadow 0.42s cubic-bezier(0.1,0,0,1), border-color 0.28s ease, opacity 0.28s ease";
  // Siblings: same curve, slightly shorter — ripple settles a hair earlier.
  const siblingT = "transform 0.40s cubic-bezier(0.1,0,0,1), box-shadow 0.36s ease, opacity 0.28s ease";
  const transition = isHovered                 ? hoverT
    : (isHovering && neighborDist <= 2)        ? siblingT
    : baseT;

  // ── Shadows & borders ──────────────────────────────────────────────────────
  const shadow = isHovered
    // Lifted card: deep cast shadow below + tiffany halo tight around the card
    ? `0 70px 55px -18px rgba(0,0,0,0.78), 0 36px 72px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(${TF},0.50), 0 0 28px -2px rgba(${TF},0.60)`
    : isCenter && !isHovering
    ? `0 28px 64px -10px rgba(0,0,0,0.88), 0 0 0 1px rgba(255,255,255,0.10)`
    : `0 14px 44px -12px rgba(0,0,0,0.82)`;

  const border = isHovered
    ? `1px solid rgba(${TF},0.48)`
    : isCenter && !isHovering
    ? `1px solid rgba(255,255,255,0.11)`
    : "1px solid rgba(255,255,255,0.06)";

  return (
    <div
      style={{
        position:        "absolute",
        bottom:          0,
        left:            "50%",
        width:           cardW,
        height:          cardH,
        marginLeft:      -cardW / 2,
        transformOrigin: "50% 100%",
        transform:       `translateX(${tx}px) rotate(${rot + rotPush + rotCorrection}deg) translateY(${vy}px) scale(${scale})`,
        zIndex,
        opacity,
        boxShadow:       shadow,
        border,
        borderRadius:    12,
        overflow:        "hidden",
        transition,
        cursor:          "pointer",
        willChange:      "transform, opacity",
      }}
      onMouseEnter={() => onHover(posIdx)}
      onMouseLeave={onLeave}
    >
      <Link
        href={`/events/${event.id}`}
        onClick={onNavigate}
        aria-label={event.title}
        style={{ position: "absolute", inset: 0, display: "block" }}
        tabIndex={0}
      >
        {/* Gradient cover fallback */}
        <FallbackGrad seed={event.id + event.title} />

        {/* Photo cover */}
        {hasCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl!}
            alt=""
            onError={() => setImgFailed(true)}
            style={{
              position:   "absolute",
              inset:      0,
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              transition: "transform 0.6s ease",
              transform:  (isCenter || isHovered) ? "scale(1.07)" : "scale(1)",
            }}
          />
        )}

        {/* Cinematic overlay — rich gradient from bottom */}
        <div style={{
          position:   "absolute",
          inset:      0,
          background: `
            linear-gradient(to top,
              rgba(0,0,0,0.97) 0%,
              rgba(0,0,0,0.60) 30%,
              rgba(0,0,0,0.12) 60%,
              rgba(0,0,0,0.38) 100%
            )
          `,
        }} />

        {/* Top-left card shine */}
        <div style={{
          position:      "absolute",
          inset:         0,
          background:    "linear-gradient(148deg, rgba(255,255,255,0.14) 0%, transparent 38%)",
          pointerEvents: "none",
        }} />

        {/* Spotlight: directional light from top-centre, only when hovered */}
        {isHovered && (
          <div style={{
            position:      "absolute",
            inset:         0,
            background:    `
              radial-gradient(ellipse 80% 55% at 50% -5%,  rgba(255,255,255,0.13) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 50% 108%, rgba(${TF},0.30) 0%, transparent 65%)
            `,
            pointerEvents: "none",
            transition:    "opacity 0.3s ease",
          }} />
        )}

        {/* Category badge */}
        <div style={{ position: "absolute", top: 9, left: 9 }}>
          <span style={{
            display:              "inline-flex",
            alignItems:           "center",
            borderRadius:         99,
            background:           "rgba(0,0,0,0.64)",
            backdropFilter:       "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            padding:              `3px ${fs.pad * 0.6}px`,
            fontSize:             `${fs.badge}px`,
            fontWeight:           700,
            textTransform:        "uppercase",
            letterSpacing:        "0.09em",
            color:                "rgba(255,255,255,0.84)",
            fontFamily:           "Oswald, sans-serif",
          }}>
            {event.sportLeague || event.category}
          </span>
        </div>

        {/* Bottom content */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${fs.pad}px ${fs.pad}px` }}>
          {/* Probability bar */}
          <div style={{ marginBottom: fs.pad * 0.65 }}>
            <div style={{ height: fs.barH, background: "rgba(255,255,255,0.10)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height:       "100%",
                width:        `${Math.max(8, event.yesPct)}%`,
                background:   `linear-gradient(90deg, rgba(${TF},0.84) 0%, rgba(80,245,252,0.96) 100%)`,
                borderRadius: 2,
              }} />
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{
                fontSize:      `${fs.prob}px`,
                fontWeight:    700,
                color:         `rgba(${TF},0.95)`,
                fontFamily:    "Oswald, sans-serif",
                letterSpacing: "0.11em",
                textTransform: "uppercase",
              }}>
                SÌ {event.yesPct}%
              </span>
            </div>
          </div>

          {/* Title */}
          <p
            className="line-clamp-2"
            style={{
              margin:     0,
              fontSize:   `${fs.title}px`,
              fontWeight: 700,
              color:      "rgba(255,255,255,0.93)",
              lineHeight: 1.26,
            }}
          >
            {event.title}
          </p>
        </div>
      </Link>
    </div>
  );
}

// ─── Rail ──────────────────────────────────────────────────────────────────────

interface Props {
  events:      FootballEvent[];
  onNavigate?: () => void;
  cardAccent?: string; // kept for API compat — always tiffany
}

export function HomeTrendingRail({ events, onNavigate }: Props) {
  const { cardW, cardH, halfSpread, halfDeg, maxCards } = useLayout();
  const centerIdx = Math.floor(maxCards / 2);

  const [phase,      setPhase]      = useState<Phase>("closed");
  const [activeOffset]              = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const wrapRef      = useRef<HTMLDivElement>(null);
  const touchStartX  = useRef<number | null>(null);
  const timerA       = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timerB       = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Debounce ref: prevents hover-clear from firing while moving between cards
  const hoverTimer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimers = useCallback(() => {
    clearTimeout(timerA.current);
    clearTimeout(timerB.current);
  }, []);

  // ── Debounced hover handlers ─────────────────────────────────────────────────
  //
  // Rule: ALWAYS clearTimeout(hoverTimer.current) before writing a new timer
  // so only ONE deferred "clear" is ever live. handleCardEnter cancels it on
  // the way in, so cursor A→B never flashes null between cards.

  const handleCardEnter = useCallback((i: number) => {
    clearTimeout(hoverTimer.current);   // cancel any pending clear
    setHoveredIdx(i);                   // lift this card immediately
  }, []);

  // Card-level leave: short window so fast inter-card moves feel instant
  const handleCardLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);   // cancel previous leave timer first
    hoverTimer.current = setTimeout(() => setHoveredIdx(null), 80);
  }, []);

  // Stage leave: longer window — cursor may still be crossing a gap
  const handleStageLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoveredIdx(null), 130);
  }, []);

  // ── Open the fan ────────────────────────────────────────────────────────────
  const openFan = useCallback(() => {
    clearTimers();
    timerA.current = setTimeout(() => {
      setPhase("opening");
      timerB.current = setTimeout(() => setPhase("open"), OPEN_MS + 260);
    }, 80);
  }, [clearTimers]);

  // ── Close the fan ───────────────────────────────────────────────────────────
  const closeFan = useCallback(() => {
    clearTimers();
    // small debounce: avoid closing on tiny scroll bumps
    timerA.current = setTimeout(() => {
      setPhase("closing");
      timerB.current = setTimeout(() => setPhase("closed"), CLOSE_MS + 120);
    }, 180);
  }, [clearTimers]);

  // ── IntersectionObserver: open on enter, close on exit ──────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          openFan();
        } else {
          closeFan();
        }
      },
      { threshold: 0.22 },
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearTimers(); clearTimeout(hoverTimer.current); };
  }, [openFan, closeFan, clearTimers]);

  // ── Swipe to cycle events manually ─────────────────────────────────────────
  const [swipeOffset, setSwipeOffset] = useState(0);
  const cardCount    = Math.min(maxCards, events.length);

  const triggerSwipe = useCallback((dir: 1 | -1) => {
    if (phase !== "open") return;
    setPhase("closing");
    clearTimers();
    timerA.current = setTimeout(() => {
      setSwipeOffset(prev => (prev + dir + events.length) % events.length);
      setPhase("opening");
      timerB.current = setTimeout(() => setPhase("open"), OPEN_MS + 260);
    }, CLOSE_MS + 100);
  }, [phase, events.length, clearTimers]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) >= SWIPE_THR) triggerSwipe(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (events.length < 2) return null;

  const offset       = (activeOffset + swipeOffset) % events.length;
  const displayCards = Array.from(
    { length: cardCount },
    (_, i) => events[(offset + i) % events.length],
  );

  const isHovering = hoveredIdx !== null;

  const sepLine = `linear-gradient(90deg,
    transparent 0%,
    rgba(${TF},0.13) 10%,
    rgba(${TF},0.32) 50%,
    rgba(${TF},0.13) 90%,
    transparent 100%)`;

  return (
    <div
      ref={wrapRef}
      className="relative -mx-2 overflow-hidden sm:-mx-4"
      style={{
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)",
        maskImage:       "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Top separator ─────────────────────────────────────────────────── */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: sepLine }} />
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 56,
        background: `linear-gradient(180deg, rgba(${TF},0.04) 0%, transparent 100%)`,
      }} />

      {/* ── Stage ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position:       "relative",
          // headroom = lift(74) + scale-extra(≈0.08×cardH) + breathing(≈6) + margin(32)
          // → cardH + 160 keeps the fully-lifted card comfortably inside the clipping box
          height:         cardH + 160,
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "center",
          paddingBottom:  28,
        }}
        onMouseLeave={handleStageLeave}
      >
        {/* "Table surface" shadow — cards rest on an invisible surface */}
        <div aria-hidden style={{
          position:      "absolute",
          bottom:        20,
          left:          "50%",
          transform:     "translateX(-50%)",
          width:         "80%",
          height:        24,
          background:    "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 70%)",
          filter:        "blur(10px)",
          pointerEvents: "none",
        }} />

        {/* Minimal tiffany ground — just enough to anchor the fan */}
        <div aria-hidden style={{
          position:      "absolute",
          bottom:        20,
          left:          "50%",
          transform:     "translateX(-50%)",
          width:         400,
          height:        80,
          background:    `radial-gradient(ellipse at center bottom, rgba(${TF},0.08) 0%, transparent 70%)`,
          filter:        "blur(36px)",
          pointerEvents: "none",
        }} />

        {/* Cards pivot — breathing CSS animation when open and idle */}
        <div
          className={phase === "open" && !isHovering ? "fan-deck-breathe" : undefined}
          style={{
            position:           "relative",
            width:              cardW,
            height:             cardH,
            animationPlayState: isHovering ? "paused" : "running",
          }}
        >
          {displayCards.map((event, i) => (
            <FanCard
              key={i}
              event={event}
              posIdx={i}
              total={cardCount}
              centerIdx={centerIdx}
              cardW={cardW}
              cardH={cardH}
              halfSpread={halfSpread}
              halfDeg={halfDeg}
              phase={phase}
              hoveredIdx={hoveredIdx}
              onHover={handleCardEnter}
              onLeave={handleCardLeave}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom separator ──────────────────────────────────────────────── */}
      <div aria-hidden style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 56,
        background: `linear-gradient(0deg, rgba(${TF},0.04) 0%, transparent 100%)`,
      }} />
      <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: sepLine }} />
    </div>
  );
}
