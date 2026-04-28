"use client";

import { useState, useId } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

type RankConfig = {
  border: string;
  boxShadow: string;
  hoverShadow: string;
  topBar: string;
  leftAccent: string;
  rankStroke: string;
  rankFilter: string;
};

const RANK_CONFIGS: RankConfig[] = [
  {
    // #1 — Gold
    border: "rgba(255,215,0,0.30)",
    boxShadow:
      "0 0 0 1px rgba(255,215,0,0.16), 0 24px 64px -14px rgba(255,215,0,0.22), 0 48px 96px -24px rgba(0,0,0,0.90)",
    hoverShadow:
      "0 0 0 1px rgba(255,215,0,0.34), 0 28px 72px -12px rgba(255,215,0,0.38), 0 -4px 40px -10px rgba(255,215,0,0.10), 0 48px 96px -24px rgba(0,0,0,0.94)",
    topBar:
      "linear-gradient(90deg,rgba(255,215,0,1.00) 0%,rgba(255,215,0,0.52) 42%,transparent 100%)",
    leftAccent:
      "linear-gradient(180deg,rgba(255,215,0,0.90) 0%,rgba(255,215,0,0.10) 100%)",
    rankStroke: "rgba(255,215,0,0.52)",
    rankFilter:
      "drop-shadow(0 0 14px rgba(255,215,0,0.42)) drop-shadow(0 0 36px rgba(255,215,0,0.18))",
  },
  {
    // #2 — Silver
    border: "rgba(208,215,240,0.20)",
    boxShadow:
      "0 0 0 1px rgba(208,215,240,0.12), 0 18px 52px -12px rgba(208,215,240,0.10), 0 36px 72px -20px rgba(0,0,0,0.84)",
    hoverShadow:
      "0 0 0 1px rgba(208,215,240,0.26), 0 22px 60px -10px rgba(208,215,240,0.20), 0 36px 72px -20px rgba(0,0,0,0.88)",
    topBar:
      "linear-gradient(90deg,rgba(222,228,250,0.84) 0%,rgba(210,216,240,0.30) 45%,transparent 100%)",
    leftAccent:
      "linear-gradient(180deg,rgba(214,220,244,0.70) 0%,rgba(214,220,244,0.06) 100%)",
    rankStroke: "rgba(208,215,240,0.42)",
    rankFilter:
      "drop-shadow(0 0 12px rgba(208,215,240,0.28)) drop-shadow(0 0 30px rgba(208,215,240,0.12))",
  },
  {
    // #3 — Bronze
    border: "rgba(205,127,50,0.22)",
    boxShadow:
      "0 0 0 1px rgba(205,127,50,0.12), 0 14px 42px -10px rgba(205,127,50,0.12), 0 30px 62px -18px rgba(0,0,0,0.80)",
    hoverShadow:
      "0 0 0 1px rgba(205,127,50,0.26), 0 18px 50px -8px rgba(205,127,50,0.22), 0 30px 62px -18px rgba(0,0,0,0.84)",
    topBar:
      "linear-gradient(90deg,rgba(205,127,50,0.80) 0%,rgba(205,127,50,0.26) 45%,transparent 100%)",
    leftAccent:
      "linear-gradient(180deg,rgba(205,127,50,0.72) 0%,rgba(205,127,50,0.07) 100%)",
    rankStroke: "rgba(205,127,50,0.42)",
    rankFilter:
      "drop-shadow(0 0 12px rgba(205,127,50,0.32)) drop-shadow(0 0 28px rgba(205,127,50,0.14))",
  },
  {
    // #4
    border: "rgba(255,255,255,0.09)",
    boxShadow: "0 8px 28px -8px rgba(0,0,0,0.64)",
    hoverShadow:
      "0 0 0 1px rgba(255,255,255,0.13), 0 12px 36px -6px rgba(0,0,0,0.72)",
    topBar:
      "linear-gradient(90deg,rgba(255,255,255,0.28) 0%,transparent 60%)",
    leftAccent:
      "linear-gradient(180deg,rgba(255,255,255,0.32) 0%,rgba(255,255,255,0.04) 100%)",
    rankStroke: "rgba(255,255,255,0.20)",
    rankFilter: "drop-shadow(0 0 8px rgba(255,255,255,0.10))",
  },
  {
    // #5
    border: "rgba(255,255,255,0.07)",
    boxShadow: "0 6px 20px -6px rgba(0,0,0,0.58)",
    hoverShadow:
      "0 0 0 1px rgba(255,255,255,0.10), 0 10px 28px -4px rgba(0,0,0,0.66)",
    topBar:
      "linear-gradient(90deg,rgba(255,255,255,0.16) 0%,transparent 55%)",
    leftAccent:
      "linear-gradient(180deg,rgba(255,255,255,0.20) 0%,rgba(255,255,255,0.02) 100%)",
    rankStroke: "rgba(255,255,255,0.14)",
    rankFilter: "drop-shadow(0 0 6px rgba(255,255,255,0.08))",
  },
];

function getPctZone(pct: number): "bull" | "bear" | "neutral" {
  if (pct > 50) return "bull";
  if (pct < 50) return "bear";
  return "neutral";
}

const PCT_COLORS: Record<
  "bull" | "bear" | "neutral",
  { arc: string; text: string; glow: string }
> = {
  bull: {
    arc: "#10b981",
    text: "#34d399",
    glow: "rgba(16,185,129,0.55)",
  },
  bear: {
    arc: "#f43f5e",
    text: "#fb7185",
    glow: "rgba(244,63,94,0.55)",
  },
  neutral: {
    arc: "#fbbf24",
    text: "#fde68a",
    glow: "rgba(251,191,36,0.55)",
  },
};

/** Ultra-premium probability gauge — glassmorphism backdrop, layered glow arc, animated tip dot */
function ProbabilityBadge({ pct }: { pct: number }) {
  const uid = useId().replace(/:/g, "");
  const zone = getPctZone(pct);
  const c = PCT_COLORS[zone];
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = circ * (pct / 100);
  const empty = circ - filled;

  const tipRad = ((pct / 100) * 360 - 90) * (Math.PI / 180);
  const dotX = 50 + r * Math.cos(tipRad);
  const dotY = 50 + r * Math.sin(tipRad);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: "3.5rem", height: "3.5rem" }}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          {/* Frosted-glass radial fill */}
          <radialGradient id={`bg-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(8,8,12,0.72)" />
            <stop offset="100%" stopColor="rgba(8,8,12,0.42)" />
          </radialGradient>
          {/* Blur filter for the glow copy of the arc */}
          <filter id={`blur-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>

        {/* ── Glass backdrop ── */}
        <circle
          cx="50" cy="50" r="33"
          fill={`url(#bg-${uid})`}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="0.75"
        />

        {/* ── Subtle outer ring ── */}
        <circle
          cx="50" cy="50" r={r + 5}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.8"
        />

        {/* ── Track ── */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="3"
        />

        {/* ── Arc glow layer (blurred, pulsing) ── */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={c.arc}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${empty}`}
          filter={`url(#blur-${uid})`}
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.62;0.3"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </circle>

        {/* ── Main arc ── */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={c.arc}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${empty}`}
          style={{ filter: `drop-shadow(0 0 3.5px ${c.glow})` }}
        />

        {/* ── Tip dot (animated pulse) ── */}
        {pct > 3 && pct < 98 && (
          <circle cx={dotX} cy={dotY} r="3.6" fill={c.arc} opacity="0.95">
            <animate
              attributeName="r"
              values="3;4.6;3"
              dur="2.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.75;1;0.75"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>

      {/* ── Number ── */}
      <span
        className="relative z-[1] select-none leading-none antialiased"
        style={{
          color: "#ffffff",
          fontFamily: "Impact, 'Arial Narrow', sans-serif",
          fontSize: "1.1rem",
          textShadow: `0 0 10px ${c.glow}, 0 0 22px ${c.glow}, 0 1px 3px rgba(0,0,0,0.9)`,
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

const RANK_FONT_SIZES = ["5.5rem", "5rem", "4.75rem", "4.375rem", "4rem"];

const RANK_FALLBACK_IMAGES = [
  "/top5/rank1.jpg",
  "/top5/rank2.jpg",
  "/top5/rank3.jpg",
  "/top5/rank4.jpg",
  "/top5/rank5.jpg",
];

function RankedEventCard({
  event,
  rank,
  onNavigate,
}: {
  event: FootballEvent;
  rank: number;
  onNavigate?: () => void;
}) {
  const cfg = RANK_CONFIGS[rank - 1] ?? RANK_CONFIGS[4];
  const [imgFailed, setImgFailed] = useState(false);
  const aiUrl = event.aiImageUrl?.trim() || null;
  const fallbackUrl = RANK_FALLBACK_IMAGES[rank - 1] ?? RANK_FALLBACK_IMAGES[4];
  const coverUrl = (imgFailed || !aiUrl) ? fallbackUrl : aiUrl;
  const hasCover = !!coverUrl;
  const label = event.sportLeague?.trim() || event.category?.trim() || null;
  const rankFontSize = RANK_FONT_SIZES[rank - 1] ?? RANK_FONT_SIZES[4];

  return (
    <div
      className="top5-card-enter flex items-end gap-0"
      style={{ animationDelay: `${(rank - 1) * 90}ms` }}
    >
      {/* Rank numeral — oversized, rank-color matched, bleeds toward card */}
      <div className="flex w-11 shrink-0 justify-center items-end pb-2.5">
        <span
          aria-hidden
          className="select-none block leading-[0.82]"
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: rankFontSize,
            fontWeight: 900,
            color: "transparent",
            WebkitTextStroke: `1.8px ${cfg.rankStroke}`,
            filter: cfg.rankFilter,
          }}
        >
          {rank}
        </span>
      </div>

      {/* Card */}
      <Link
        href={`/events/${event.id}`}
        onClick={onNavigate}
        aria-label={`#${rank} ${event.title}`}
        className="top5-card group relative flex-1 overflow-hidden rounded-2xl aspect-[16/7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        style={
          {
            border: `1px solid ${cfg.border}`,
            "--shadow-default": cfg.boxShadow,
            "--shadow-hover": cfg.hoverShadow,
            boxShadow: cfg.boxShadow,
            backgroundColor: "#050b18",
          } as React.CSSProperties
        }
      >
        {/* Cover image */}
        {hasCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.042]"
          />
        )}

        {/* Cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/38 to-black/10" />

        {/* Left rank-color accent stripe */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl"
          style={{ background: cfg.leftAccent }}
        />

        {/* Top metallic shimmer bar */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: cfg.topBar }}
        />

        {/* Hover shine sweep */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-[38%] -left-[38%] group-hover:left-[130%] bg-gradient-to-r from-transparent via-white/[0.055] to-transparent"
          style={{ transition: "left 0.72s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />

        {/* TOP ROW */}
        <div className="absolute inset-x-3.5 top-2.5 flex items-center justify-end">
          <ProbabilityBadge pct={event.yesPct} />
        </div>

        {/* BOTTOM CONTENT */}
        <div className="absolute inset-x-3.5 bottom-2.5 sm:inset-x-4 sm:bottom-3">
          <p className="line-clamp-2 font-kalshi font-semibold leading-snug tracking-wide text-[1.0625rem] sm:text-[1.125rem] text-white antialiased drop-shadow-[0_1px_12px_rgba(0,0,0,0.95)]">
            {event.title}
          </p>
        </div>
      </Link>
    </div>
  );
}

export function Top24hSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Top 5 eventi delle ultime 24h">
      <SectionHeader
        eyebrow="Ultime 24 ore"
        title="Top 5 Oggi"
        accent="gold"
        articleHeadlineTitle
      />

      <div className="flex flex-col gap-3.5">
        {events.slice(0, 5).map((event, i) => (
          <RankedEventCard
            key={event.id}
            event={event}
            rank={i + 1}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
