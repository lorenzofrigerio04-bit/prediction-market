"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const TF       = "10,186,181";   // tiffany #0ABAB5
const OPEN_MS  = 860;
const CLOSE_MS = 400;
const SWIPE_THR = 44;

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
  // halfSpread = 0: pure rotation fan around a sub-card pivot (transformOrigin "50% 108%").
  // The 8% below-bottom pivot creates a natural lateral spread at the base
  // without any explicit translation — exactly like real playing cards in a hand.
  const [lay, setLay] = useState<Layout>({
    cardW: 202, cardH: 304, halfSpread: 0, halfDeg: 64, maxCards: 7,
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 400) {
        setLay({ cardW: 122, cardH: 184, halfSpread: 0, halfDeg: 58, maxCards: 5 });
      } else if (w < 540) {
        setLay({ cardW: 146, cardH: 220, halfSpread: 0, halfDeg: 61, maxCards: 5 });
      } else if (w < 768) {
        setLay({ cardW: 174, cardH: 262, halfSpread: 0, halfDeg: 63, maxCards: 7 });
      } else {
        setLay({ cardW: 202, cardH: 304, halfSpread: 0, halfDeg: 64, maxCards: 7 });
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
  const h1 = h % 360, h2 = (h1 + 48) % 360, h3 = (h1 + 195) % 360;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(150% 100% at 18% 10%, hsl(${h1} 62% 22% / 0.96), transparent 50%),
          radial-gradient(130% 85%  at 85% 92%, hsl(${h2} 62% 18% / 0.92), transparent 48%),
          radial-gradient( 70% 55%  at 50% 50%, hsl(${h3} 28% 12% / 0.45), transparent 68%),
          linear-gradient(165deg, #0d2040 0%, #040c1e 100%)
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

  const npos         = total > 1 ? (posIdx - centerIdx) / centerIdx : 0;
  const isCenter     = posIdx === centerIdx;
  const isHovered    = hoveredIdx === posIdx;
  const isHovering   = hoveredIdx !== null;
  const neighborDist = hoveredIdx !== null ? Math.abs(posIdx - hoveredIdx) : Infinity;
  const isOpen       = phase === "opening" || phase === "open";
  const isClosing    = phase === "closing";
  const distFromCenter = Math.abs(posIdx - centerIdx);

  // ── Proportional typography & spacing ─────────────────────────────────────
  const fs = {
    badge:   Math.max(8,  Math.round(cardW * 0.060)),
    prob:    Math.max(10, Math.round(cardW * 0.075)),
    title:   Math.max(11, Math.round(cardW * 0.088)),
    pad:     Math.max(10, Math.round(cardW * 0.074)),
    barH:    Math.max(4,  Math.round(cardW * 0.022)),
  };

  // ── Fan position ───────────────────────────────────────────────────────────
  // transformOrigin "50% 108%" puts the pivot 8% of cardH below the card bottom.
  // When cards rotate around this sub-card pivot, their bottoms naturally
  // separate laterally — no explicit halfSpread needed.
  const tx  = isOpen ? npos * halfSpread : 0;
  const rot = isOpen ? npos * halfDeg    : 0;

  let vy = 0;
  if (isOpen) {
    if (isCenter && !isHovering)               vy  = -22;
    if (isHovered)                             vy += -100;
    else if (isHovering && neighborDist === 1) vy  = 16;
    else if (isHovering && neighborDist === 2) vy  = 7;
  }

  const scale = !isOpen               ? 1
    : isCenter && !isHovering         ? 1.13
    : isHovered                       ? 1.12
    : isHovering                      ? 0.94
    : 1;

  // Sibling push — adjacent cards spread when neighbour is lifted
  let rotPush = 0;
  if (isOpen && isHovering && !isHovered && hoveredIdx !== null) {
    const dir = posIdx < hoveredIdx ? -1 : 1;
    rotPush   = dir * Math.max(0, (4 - neighborDist) * 4.0);
  }

  // When lifted, card rotates strongly toward vertical so the content is readable.
  // Target ≈ ±6° regardless of starting fan angle — feels like plucking from a hand.
  const targetRot     = isHovered ? Math.sign(npos) * 6 : 0;
  const rotCorrection = isHovered ? -(rot - targetRot) : 0;

  // ── Z-index — intentional natural layering ─────────────────────────────────
  // Left cards (posIdx < center) stack bottom-up: leftmost is deepest.
  // Right cards (posIdx > center) decrease from center outward.
  // Center card sits clearly above all. Hovered card flies to top.
  let zIndex: number;
  if (isCenter) {
    zIndex = total + 4;
  } else if (posIdx < centerIdx) {
    zIndex = posIdx + 1;                         // 1, 2, 3 …
  } else {
    zIndex = total + 3 - (posIdx - centerIdx);   // total+2, total+1, total …
  }
  if (isHovered) zIndex = total * 3;

  // ── Opacity ────────────────────────────────────────────────────────────────
  const opacity = isOpen && Math.abs(npos) > 0.62 ? 0.72 : 1;

  // ── Content visibility hierarchy ──────────────────────────────────────────
  // Edge cards tease content (low opacity); center & hovered reveal fully.
  const contentOpacity = isHovered            ? 1.0
    : isCenter && !isHovering                 ? 0.90
    : 1 - (distFromCenter / (total - 1)) * 0.58;

  // ── Stagger — fan sweeps outward from center ───────────────────────────────
  const fanDelay      = `${distFromCenter * 30}ms`;
  const collapseDelay = `${(centerIdx - distFromCenter) * 18}ms`;
  const staggerDelay  = isClosing ? collapseDelay : fanDelay;
  const animDur       = isClosing ? `${CLOSE_MS}ms` : `${OPEN_MS}ms`;
  // Fan-open: spring-like overshoot then settle — cards snap into the fan.
  // Fan-close: decisive ease-in — the deck snaps back together.
  const animEase = isClosing
    ? "cubic-bezier(0.52,0,0.70,0.48)"
    : "cubic-bezier(0.32,1.22,0.62,1)";

  const baseT    = `transform ${animDur} ${animEase} ${staggerDelay}, opacity 0.35s ease`;
  const hoverT   = "transform 0.44s cubic-bezier(0.06,0,0,1), box-shadow 0.42s cubic-bezier(0.06,0,0,1), border-color 0.26s ease, opacity 0.26s ease";
  const siblingT = "transform 0.38s cubic-bezier(0.06,0,0,1), box-shadow 0.34s ease, opacity 0.26s ease";
  const transition = isHovered                 ? hoverT
    : (isHovering && neighborDist <= 2)        ? siblingT
    : baseT;

  // ── Shadows ────────────────────────────────────────────────────────────────
  const shadow = isHovered
    // Floating: deep cast + tight tiffany rim + atmospheric halo
    ? `0 100px 80px -24px rgba(0,0,0,0.92), 0 48px 96px -16px rgba(0,0,0,0.68), 0 0 0 1.5px rgba(${TF},0.68), 0 0 24px 4px rgba(${TF},0.42), 0 0 72px 24px rgba(${TF},0.17)`
    : isCenter && !isHovering
    ? `0 36px 80px -14px rgba(0,0,0,0.94), 0 0 0 1px rgba(255,255,255,0.11), 0 0 36px 0px rgba(${TF},0.14)`
    : `0 18px 56px -16px rgba(0,0,0,0.88)`;

  const border = isHovered
    ? `1.5px solid rgba(${TF},0.58)`
    : isCenter && !isHovering
    ? `1px solid rgba(255,255,255,0.13)`
    : `1px solid rgba(255,255,255,0.06)`;

  return (
    <div
      style={{
        position:        "absolute",
        bottom:          0,
        left:            "50%",
        width:           cardW,
        height:          cardH,
        marginLeft:      -cardW / 2,
        // Pivot 8% below card bottom: all cards naturally spread at their base,
        // creating the "hand of cards" look without any explicit translation.
        transformOrigin: "50% 108%",
        transform:       `translateX(${tx}px) rotate(${rot + rotPush + rotCorrection}deg) translateY(${vy}px) scale(${scale})`,
        zIndex,
        opacity,
        boxShadow:       shadow,
        border,
        borderRadius:    16,
        overflow:        "hidden",
        transition,
        cursor:          "pointer",
        willChange:      "transform, opacity",
        // Subtle tiffany tint on center card — it glows faintly even at rest
        ...(isCenter && !isHovering && !isHovered && {
          filter: `drop-shadow(0 0 18px rgba(${TF},0.18))`,
        }),
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
        {/* Base gradient */}
        <FallbackGrad seed={event.id + event.title} />

        {/* Cover photo */}
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
              transition: "transform 0.65s ease",
              transform:  (isCenter || isHovered) ? "scale(1.08)" : "scale(1.01)",
            }}
          />
        )}

        {/* Cinematic gradient overlay — darkens bottom for readability */}
        <div style={{
          position:   "absolute",
          inset:      0,
          background: `
            linear-gradient(to top,
              rgba(0,0,0,0.98) 0%,
              rgba(0,0,0,0.55) 28%,
              rgba(0,0,0,0.08) 58%,
              rgba(0,0,0,0.32) 100%
            )
          `,
        }} />

        {/* Premium glass shine — top-left directional light */}
        <div style={{
          position:      "absolute",
          inset:         0,
          background:    "linear-gradient(145deg, rgba(255,255,255,0.17) 0%, rgba(255,255,255,0.04) 32%, transparent 52%)",
          pointerEvents: "none",
        }} />

        {/* Inner frame highlight — subtle top/left rim */}
        <div style={{
          position:      "absolute",
          inset:         0,
          borderRadius:  "inherit",
          boxShadow:     "inset 0 1px 0 rgba(255,255,255,0.14), inset 1px 0 0 rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }} />

        {/* Tiffany inner wash — blooms when hovered */}
        {isHovered && (
          <div style={{
            position:      "absolute",
            inset:         0,
            background:    `
              radial-gradient(ellipse 100% 70% at 50% -10%, rgba(255,255,255,0.18) 0%, transparent 60%),
              radial-gradient(ellipse 75%  60% at 50% 118%, rgba(${TF},0.55) 0%, transparent 56%),
              radial-gradient(ellipse 50%  40% at 50%  52%, rgba(${TF},0.06) 0%, transparent 70%)
            `,
            pointerEvents: "none",
            transition:    "opacity 0.32s ease",
          }} />
        )}

        {/* Shimmer sweep across card face on hover */}
        {isHovered && (
          <div
            className="fan-card-shimmer"
            aria-hidden
            style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 16, overflow: "hidden" }}
          />
        )}

        {/* Category badge */}
        <div style={{ position: "absolute", top: 10, left: 10, opacity: contentOpacity, transition: "opacity 0.28s ease" }}>
          <span style={{
            display:              "inline-flex",
            alignItems:           "center",
            borderRadius:         99,
            background:           "rgba(0,0,0,0.60)",
            backdropFilter:       "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding:              `4px ${Math.round(fs.pad * 0.65)}px`,
            fontSize:             `${fs.badge}px`,
            fontWeight:           700,
            textTransform:        "uppercase",
            letterSpacing:        "0.10em",
            color:                "rgba(255,255,255,0.82)",
            fontFamily:           "Oswald, sans-serif",
            border:               "1px solid rgba(255,255,255,0.10)",
          }}>
            {event.sportLeague || event.category}
          </span>
        </div>

        {/* Bottom content — fades in based on card prominence */}
        <div
          style={{
            position:   "absolute",
            bottom:     0, left: 0, right: 0,
            padding:    `0 ${fs.pad}px ${fs.pad}px`,
            opacity:    contentOpacity,
            transition: "opacity 0.32s ease",
          }}
        >
          {/* Probability bar */}
          <div style={{ marginBottom: Math.round(fs.pad * 0.6) }}>
            <div style={{
              height:       fs.barH,
              background:   "rgba(255,255,255,0.10)",
              borderRadius: fs.barH,
              overflow:     "hidden",
            }}>
              <div style={{
                height:        "100%",
                width:         `${Math.max(8, event.yesPct)}%`,
                background:    `linear-gradient(90deg, rgba(${TF},0.82) 0%, rgba(80,245,252,0.97) 100%)`,
                borderRadius:  fs.barH,
                boxShadow:     isHovered ? `0 0 8px 1px rgba(${TF},0.55)` : "none",
                transition:    "box-shadow 0.3s ease",
              }} />
            </div>
            <div style={{ marginTop: 5 }}>
              <span style={{
                fontSize:      `${fs.prob}px`,
                fontWeight:    700,
                color:         `rgba(${TF},0.96)`,
                fontFamily:    "Oswald, sans-serif",
                letterSpacing: "0.12em",
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
              margin:      0,
              fontSize:    `${fs.title}px`,
              fontWeight:  700,
              color:       "rgba(255,255,255,0.94)",
              lineHeight:  1.24,
              letterSpacing: "-0.01em",
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
  cardAccent?: string; // kept for API compat
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
  const hoverTimer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimers = useCallback(() => {
    clearTimeout(timerA.current);
    clearTimeout(timerB.current);
  }, []);

  const handleCardEnter = useCallback((i: number) => {
    clearTimeout(hoverTimer.current);
    setHoveredIdx(i);
  }, []);

  const handleCardLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoveredIdx(null), 80);
  }, []);

  const handleStageLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoveredIdx(null), 120);
  }, []);

  const openFan = useCallback(() => {
    clearTimers();
    timerA.current = setTimeout(() => {
      setPhase("opening");
      timerB.current = setTimeout(() => setPhase("open"), OPEN_MS + 240);
    }, 80);
  }, [clearTimers]);

  const closeFan = useCallback(() => {
    clearTimers();
    timerA.current = setTimeout(() => {
      setPhase("closing");
      timerB.current = setTimeout(() => setPhase("closed"), CLOSE_MS + 100);
    }, 160);
  }, [clearTimers]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) openFan();
        else                       closeFan();
      },
      { threshold: 0.20 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimers();
      clearTimeout(hoverTimer.current);
    };
  }, [openFan, closeFan, clearTimers]);

  const [swipeOffset, setSwipeOffset] = useState(0);
  const cardCount = Math.min(maxCards, events.length);

  const triggerSwipe = useCallback((dir: 1 | -1) => {
    if (phase !== "open") return;
    setPhase("closing");
    clearTimers();
    timerA.current = setTimeout(() => {
      setSwipeOffset(prev => (prev + dir + events.length) % events.length);
      setPhase("opening");
      timerB.current = setTimeout(() => setPhase("open"), OPEN_MS + 240);
    }, CLOSE_MS + 80);
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

  // Tiffany separator line
  const sepLine = `linear-gradient(90deg,
    transparent  0%,
    rgba(${TF},0.10) 12%,
    rgba(${TF},0.28) 50%,
    rgba(${TF},0.10) 88%,
    transparent  100%)`;

  // Stage height: center card (cardH) + max hover lift (100px) + scale headroom + padding
  const stageH = cardH + 220;

  return (
    <div
      ref={wrapRef}
      // Break out of the px-2/px-4 inner container to the edge of the page padding,
      // so the fan reads as a full-bleed cinematic moment between sections.
      className="relative -mx-2 overflow-hidden sm:-mx-4"
      style={{
        // 6% fade on each edge — partial cards bleed beautifully into the margin
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
        maskImage:       "linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Top separator line */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: sepLine }} />
      {/* Top tiffany fade */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 64,
        background: `linear-gradient(180deg, rgba(${TF},0.05) 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      {/* ── Stage */}
      <div
        style={{
          position:       "relative",
          height:         stageH,
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "center",
          paddingBottom:  36,
        }}
        onMouseLeave={handleStageLeave}
      >
        {/* Wide atmospheric tiffany pool — fans spread above this glow */}
        <div aria-hidden style={{
          position:      "absolute",
          bottom:        0,
          left:          "50%",
          transform:     "translateX(-50%)",
          width:         700,
          height:        200,
          background:    `radial-gradient(ellipse at 50% 100%, rgba(${TF},0.18) 0%, rgba(${TF},0.06) 38%, transparent 68%)`,
          filter:        "blur(52px)",
          pointerEvents: "none",
        }} />

        {/* Focused grip glow — anchors the convergence point of the cards */}
        <div aria-hidden style={{
          position:      "absolute",
          bottom:        28,
          left:          "50%",
          transform:     "translateX(-50%)",
          width:         260,
          height:        52,
          background:    `radial-gradient(ellipse at center, rgba(${TF},0.22) 0%, transparent 70%)`,
          filter:        "blur(18px)",
          pointerEvents: "none",
        }} />

        {/* Table shadow — cards rest on this invisible surface */}
        <div aria-hidden style={{
          position:      "absolute",
          bottom:        24,
          left:          "50%",
          transform:     "translateX(-50%)",
          width:         "78%",
          height:        22,
          background:    "radial-gradient(ellipse at center, rgba(0,0,0,0.70) 0%, transparent 72%)",
          filter:        "blur(12px)",
          pointerEvents: "none",
        }} />

        {/* Cards pivot — breathing CSS animation when fan is open and idle */}
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
              key={event.id}
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

      {/* ── Bottom tiffany fade + separator line */}
      <div aria-hidden style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 64,
        background: `linear-gradient(0deg, rgba(${TF},0.05) 0%, transparent 100%)`,
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: sepLine }} />
    </div>
  );
}
