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
      "0 0 0 1px rgba(10,186,181,0.14), 0 14px 40px -20px rgba(45,212,191,0.08), 0 30px 70px -30px rgba(0,0,0,0.82)",
    hoverShadow:
      "0 0 0 1px rgba(94,234,212,0.22), 0 16px 44px -18px rgba(45,212,191,0.14), 0 32px 74px -28px rgba(0,0,0,0.88)",
    topBar:
      "linear-gradient(90deg,rgba(167,243,228,0.58) 0%,rgba(10,186,181,0.42) 22%,rgba(45,212,191,0.18) 50%,transparent 72%)",
    leftAccent:
      "linear-gradient(180deg,rgba(167,243,228,0.55) 0%,rgba(10,186,181,0.30) 44%,rgba(10,186,181,0.06) 100%)",
    rankStroke: "rgba(110,231,213,0.52)",
    rankFilter:
      "drop-shadow(0 1px 11px rgba(10,186,181,0.20))",
  },
  {
    // #2 — Argento / cromo (ombre più leggere)
    border: "rgba(236,242,255,0.36)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.10), 0 14px 40px -20px rgba(200,215,245,0.07), 0 28px 64px -28px rgba(0,0,0,0.80)",
    hoverShadow:
      "0 0 0 1px rgba(255,255,255,0.16), 0 16px 44px -18px rgba(200,215,245,0.13), 0 30px 68px -26px rgba(0,0,0,0.86)",
    topBar:
      "linear-gradient(90deg,rgba(230,238,255,0.52) 0%,rgba(198,212,245,0.36) 22%,rgba(175,195,230,0.16) 50%,transparent 72%)",
    leftAccent:
      "linear-gradient(180deg,rgba(214,224,248,0.52) 0%,rgba(180,198,235,0.34) 38%,rgba(175,195,230,0.10) 100%)",
    rankStroke: "rgba(236,242,252,0.48)",
    rankFilter:
      "drop-shadow(0 1px 11px rgba(200,215,245,0.16))",
  },
  {
    // #3 — Bronzo ultra premium (rame luminoso + alone riccio)
    border: "rgba(230,160,95,0.38)",
    boxShadow:
      "0 0 0 1px rgba(205,127,50,0.15), 0 14px 42px -20px rgba(205,127,50,0.09), 0 30px 70px -30px rgba(0,0,0,0.82)",
    hoverShadow:
      "0 0 0 1px rgba(245,180,110,0.24), 0 16px 46px -18px rgba(205,127,50,0.15), 0 32px 74px -28px rgba(0,0,0,0.88)",
    topBar:
      "linear-gradient(90deg,rgba(255,200,140,0.56) 0%,rgba(205,127,50,0.42) 22%,rgba(180,95,45,0.20) 50%,transparent 72%)",
    leftAccent:
      "linear-gradient(180deg,rgba(255,190,130,0.55) 0%,rgba(205,127,50,0.36) 42%,rgba(160,85,35,0.09) 100%)",
    rankStroke: "rgba(235,165,105,0.49)",
    rankFilter:
      "drop-shadow(0 1px 11px rgba(205,127,50,0.18))",
  },
  {
    // #4 — Perla / grafite ultra premium (alone freddo stratificato)
    border: "rgba(220,226,238,0.30)",
    boxShadow:
      "0 0 0 1px rgba(190,200,220,0.10), 0 10px 34px -18px rgba(190,200,220,0.07), 0 28px 64px -28px rgba(0,0,0,0.78)",
    hoverShadow:
      "0 0 0 1px rgba(210,220,240,0.16), 0 14px 40px -18px rgba(190,200,220,0.12), 0 30px 68px -26px rgba(0,0,0,0.84)",
    topBar:
      "linear-gradient(90deg,rgba(210,218,235,0.42) 0%,rgba(160,175,200,0.26) 32%,rgba(130,145,170,0.12) 56%,transparent 72%)",
    leftAccent:
      "linear-gradient(180deg,rgba(200,210,228,0.42) 0%,rgba(160,175,200,0.26) 40%,rgba(150,162,185,0.09) 100%)",
    rankStroke: "rgba(228,234,245,0.36)",
    rankFilter:
      "drop-shadow(0 1px 10px rgba(190,205,230,0.13))",
  },
  {
    // #5 — Grafite soft ultra premium (leggermente più attenuato del #4)
    border: "rgba(200,210,225,0.24)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.06), 0 10px 32px -18px rgba(175,188,210,0.06), 0 26px 60px -26px rgba(0,0,0,0.76)",
    hoverShadow:
      "0 0 0 1px rgba(255,255,255,0.11), 0 14px 38px -18px rgba(175,188,210,0.11), 0 28px 64px -24px rgba(0,0,0,0.82)",
    topBar:
      "linear-gradient(90deg,rgba(195,205,220,0.34) 0%,rgba(160,172,195,0.20) 38%,rgba(130,145,170,0.10) 58%,transparent 72%)",
    leftAccent:
      "linear-gradient(180deg,rgba(185,195,215,0.34) 0%,rgba(160,172,195,0.22) 45%,rgba(130,142,165,0.07) 100%)",
    rankStroke: "rgba(212,220,234,0.27)",
    rankFilter:
      "drop-shadow(0 1px 10px rgba(175,192,215,0.10))",
  },
];

const RANK_FONT_SIZES = ["4.875rem", "4.5rem", "4.25rem", "3.875rem", "3.5rem"];
// Desktop (lg+): box più piccolo ma numero classifica leggermente più grande,
// così il numero resta proporzionalmente più presente sulla card più snella.
const RANK_FONT_SIZES_LG = ["5.5rem", "5.1rem", "4.8rem", "4.4rem", "4rem"];

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
  const rankFontSizeLg = RANK_FONT_SIZES_LG[rank - 1] ?? RANK_FONT_SIZES_LG[4];
  const { leadingPct } = getBinaryLeadingDisplay(event.yesPct);

  return (
    <div
      className="top5-card-enter flex items-end gap-0"
      style={{ animationDelay: `${(rank - 1) * 90}ms` }}
    >
      {/* Rank numeral — oversized, rank-color matched, bleeds toward card */}
      <div className="flex w-10 lg:w-[3.75rem] shrink-0 justify-center items-end pb-2.5">
        <span
          aria-hidden
          className="top5-rank-num select-none block leading-[0.82]"
          style={
            {
              fontFamily: "Oswald, sans-serif",
              "--rank-fs": rankFontSize,
              "--rank-fs-lg": rankFontSizeLg,
              fontWeight: 900,
              color: "transparent",
              WebkitTextStroke: `1.5px ${cfg.rankStroke}`,
              filter: cfg.rankFilter,
            } as CSSProperties
          }
        >
          {rank}
        </span>
      </div>

      {/* Card */}
      <Link
        href={`/events/${event.id}`}
        onClick={onNavigate}
        aria-label={`#${rank} ${event.title}`}
        className="top5-card group relative flex-1 overflow-hidden rounded-2xl aspect-[16/7] sm:aspect-[5.2/2] lg:aspect-[4.8/1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
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

        {/* TOP ROW */}
        <div className="absolute inset-x-3.5 top-2.5 flex items-center justify-end">
          <ProbabilityBadge topRank={rank} pct={leadingPct} size="elevated" />
        </div>

        {/* BOTTOM CONTENT */}
        <div className="absolute inset-x-3.5 bottom-2.5 sm:inset-x-4 sm:bottom-3">
          <p className="line-clamp-2 font-kalshi font-semibold leading-snug tracking-wide text-[1.0625rem] sm:text-[1.125rem] text-white/90 antialiased drop-shadow-[0_1px_7px_rgba(0,0,0,0.8)]">
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

      <div className="flex flex-col gap-4">
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
