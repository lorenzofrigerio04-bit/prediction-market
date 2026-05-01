"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { getBinaryLeadingDisplay } from "@/lib/home-event-binary-layout";
import { SectionHeader } from "./premium/SectionHeader";
import { ProbabilityBadge, type Top5Rank } from "./premium/ProbabilityBadge";

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
    // #1 — Tiffany ultra premium (ombre più leggere)
    border: "rgba(94,234,212,0.38)",
    boxShadow:
      "0 0 0 1px rgba(10,186,181,0.20), 0 0 28px -10px rgba(10,186,181,0.22), 0 18px 52px -18px rgba(45,212,191,0.12), 0 40px 84px -28px rgba(0,0,0,0.86)",
    hoverShadow:
      "0 0 0 1px rgba(153,246,228,0.34), 0 0 36px -8px rgba(10,186,181,0.34), 0 0 62px -18px rgba(94,234,212,0.16), 0 26px 72px -16px rgba(0,0,0,0.90)",
    topBar:
      "linear-gradient(90deg,rgba(204,251,241,0.98) 0%,rgba(10,186,181,0.78) 20%,rgba(45,212,191,0.40) 48%,transparent 100%)",
    leftAccent:
      "linear-gradient(180deg,rgba(167,243,228,0.96) 0%,rgba(10,186,181,0.48) 44%,rgba(10,186,181,0.09) 100%)",
    rankStroke: "rgba(110,231,213,0.64)",
    rankFilter:
      "drop-shadow(0 0 18px rgba(10,186,181,0.58)) drop-shadow(0 0 42px rgba(45,212,191,0.30)) drop-shadow(0 0 78px rgba(94,234,212,0.14))",
  },
  {
    // #2 — Argento / cromo (ombre più leggere)
    border: "rgba(236,242,255,0.36)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.16), 0 0 34px -12px rgba(216,228,255,0.24), 0 16px 52px -16px rgba(180,198,235,0.10), 0 36px 76px -24px rgba(0,0,0,0.84)",
    hoverShadow:
      "0 0 0 1px rgba(255,255,255,0.30), 0 0 48px -10px rgba(232,242,255,0.32), 0 0 72px -20px rgba(200,215,245,0.18), 0 24px 68px -14px rgba(0,0,0,0.88)",
    topBar:
      "linear-gradient(90deg,rgba(255,255,255,0.94) 0%,rgba(230,238,255,0.78) 16%,rgba(198,212,245,0.44) 42%,transparent 100%)",
    leftAccent:
      "linear-gradient(180deg,rgba(250,252,255,0.94) 0%,rgba(214,224,248,0.58) 38%,rgba(175,195,230,0.14) 100%)",
    rankStroke: "rgba(236,242,252,0.60)",
    rankFilter:
      "drop-shadow(0 0 16px rgba(255,255,255,0.38)) drop-shadow(0 0 36px rgba(200,215,245,0.34)) drop-shadow(0 0 58px rgba(165,185,225,0.16))",
  },
  {
    // #3 — Bronzo ultra premium (rame luminoso + alone riccio)
    border: "rgba(230,160,95,0.38)",
    boxShadow:
      "0 0 0 1px rgba(205,127,50,0.22), 0 0 40px -8px rgba(205,127,50,0.28), 0 20px 64px -12px rgba(180,95,40,0.18), 0 40px 88px -20px rgba(0,0,0,0.86)",
    hoverShadow:
      "0 0 0 1px rgba(245,180,110,0.36), 0 0 58px -6px rgba(205,127,50,0.42), 0 0 82px -14px rgba(220,140,70,0.22), 0 28px 76px -10px rgba(0,0,0,0.90)",
    topBar:
      "linear-gradient(90deg,rgba(255,200,140,0.92) 0%,rgba(205,127,50,0.74) 22%,rgba(180,95,45,0.36) 48%,transparent 100%)",
    leftAccent:
      "linear-gradient(180deg,rgba(255,190,130,0.88) 0%,rgba(205,127,50,0.52) 42%,rgba(160,85,35,0.12) 100%)",
    rankStroke: "rgba(235,165,105,0.58)",
    rankFilter:
      "drop-shadow(0 0 16px rgba(205,127,50,0.45)) drop-shadow(0 0 38px rgba(220,140,70,0.26)) drop-shadow(0 0 64px rgba(180,95,40,0.12))",
  },
  {
    // #4 — Perla / grafite ultra premium (alone freddo stratificato)
    border: "rgba(220,226,238,0.30)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.10), 0 0 44px -10px rgba(190,200,220,0.30), 0 18px 56px -12px rgba(255,255,255,0.07), 0 38px 82px -18px rgba(0,0,0,0.82)",
    hoverShadow:
      "0 0 0 1px rgba(255,255,255,0.22), 0 0 62px -8px rgba(210,220,240,0.36), 0 0 86px -14px rgba(255,255,255,0.11), 0 26px 70px -8px rgba(0,0,0,0.88)",
    topBar:
      "linear-gradient(90deg,rgba(255,255,255,0.58) 0%,rgba(210,218,235,0.42) 32%,rgba(160,175,200,0.20) 54%,transparent 100%)",
    leftAccent:
      "linear-gradient(180deg,rgba(255,255,255,0.50) 0%,rgba(200,210,228,0.34) 40%,rgba(150,162,185,0.12) 100%)",
    rankStroke: "rgba(228,234,245,0.40)",
    rankFilter:
      "drop-shadow(0 0 14px rgba(255,255,255,0.30)) drop-shadow(0 0 34px rgba(190,205,230,0.24)) drop-shadow(0 0 54px rgba(140,155,180,0.13))",
  },
  {
    // #5 — Grafite soft ultra premium (leggermente più attenuato del #4)
    border: "rgba(200,210,225,0.24)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.08), 0 0 38px -10px rgba(175,188,210,0.24), 0 16px 50px -10px rgba(255,255,255,0.05), 0 32px 74px -16px rgba(0,0,0,0.80)",
    hoverShadow:
      "0 0 0 1px rgba(255,255,255,0.18), 0 0 54px -8px rgba(195,208,228,0.30), 0 0 74px -14px rgba(255,255,255,0.09), 0 22px 62px -8px rgba(0,0,0,0.86)",
    topBar:
      "linear-gradient(90deg,rgba(255,255,255,0.45) 0%,rgba(195,205,220,0.30) 38%,rgba(130,145,170,0.14) 58%,transparent 100%)",
    leftAccent:
      "linear-gradient(180deg,rgba(255,255,255,0.38) 0%,rgba(185,195,215,0.26) 45%,rgba(130,142,165,0.09) 100%)",
    rankStroke: "rgba(212,220,234,0.32)",
    rankFilter:
      "drop-shadow(0 0 12px rgba(255,255,255,0.24)) drop-shadow(0 0 28px rgba(175,192,215,0.19)) drop-shadow(0 0 48px rgba(125,140,165,0.11))",
  },
];

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
  rank: Top5Rank;
  onNavigate?: () => void;
}) {
  const cfg = RANK_CONFIGS[rank - 1] ?? RANK_CONFIGS[4];
  const [imgFailed, setImgFailed] = useState(false);
  const aiUrl = event.aiImageUrl?.trim() || null;
  const fallbackUrl = RANK_FALLBACK_IMAGES[rank - 1] ?? RANK_FALLBACK_IMAGES[4];
  const coverUrl = (imgFailed || !aiUrl) ? fallbackUrl : aiUrl;
  const hasCover = !!coverUrl;
  const rankFontSize = RANK_FONT_SIZES[rank - 1] ?? RANK_FONT_SIZES[4];
  const { leadingPct } = getBinaryLeadingDisplay(event.yesPct);

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
          } as CSSProperties
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
          <ProbabilityBadge topRank={rank} pct={leadingPct} size="elevated" />
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
    <section aria-label="Top 5 Oggi">
      <SectionHeader
        title="Top 5 Oggi"
        accent="tiffany"
        articleHeadlineTitle
      />

      <div className="flex flex-col gap-3.5">
        {events.slice(0, 5).map((event, i) => (
          <RankedEventCard
            key={event.id}
            event={event}
            rank={(i + 1) as Top5Rank}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
