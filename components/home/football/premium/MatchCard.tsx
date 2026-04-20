"use client";

import { useState } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { parseSportMatchTitle } from "@/lib/sport-match-title";
import { CompetitionBadge } from "./CompetitionBadge";
import { CountdownPill } from "./CountdownPill";
import { OddsBlock } from "./OddsBlock";

interface Props {
  event: FootballEvent;
  onNavigate?: () => void;
  /** Visual preset: standard grid card (`default`), live overlay (`live`), or unique/featured (`unique`). */
  variant?: "default" | "live" | "unique";
  /** When true, shows live minute instead of countdown. */
  livePulse?: boolean;
  /** Optional accent hue override for unique markets. */
  accent?: "primary" | "gold" | "rose" | "violet" | "emerald" | "cyan";
  /** Show "Mercato unico" style badge inline in the cover. */
  uniqueBadge?: boolean;
}

const ACCENT_SHADOW: Record<NonNullable<Props["accent"]>, string> = {
  primary: "hover:shadow-[0_24px_60px_-24px_rgba(80,245,252,0.30)]",
  gold: "hover:shadow-[0_24px_60px_-24px_rgba(252,211,77,0.30)]",
  rose: "hover:shadow-[0_24px_60px_-24px_rgba(244,63,94,0.30)]",
  violet: "hover:shadow-[0_24px_60px_-24px_rgba(167,139,250,0.30)]",
  emerald: "hover:shadow-[0_24px_60px_-24px_rgba(52,211,153,0.30)]",
  cyan: "hover:shadow-[0_24px_60px_-24px_rgba(34,211,238,0.30)]",
};

const ACCENT_RING: Record<NonNullable<Props["accent"]>, string> = {
  primary: "from-primary/25 to-transparent",
  gold: "from-amber-400/30 to-transparent",
  rose: "from-rose-400/30 to-transparent",
  violet: "from-violet-400/30 to-transparent",
  emerald: "from-emerald-400/30 to-transparent",
  cyan: "from-cyan-400/30 to-transparent",
};

/** Generate a stable hue from a string (deterministic fallback gradient). */
function stableHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function FallbackCover({ seed }: { seed: string }) {
  const h = stableHue(seed);
  const h2 = (h + 40) % 360;
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(120% 90% at 15% 20%, hsl(${h} 70% 22% / 0.9), transparent 55%),
          radial-gradient(120% 90% at 85% 80%, hsl(${h2} 70% 18% / 0.85), transparent 55%),
          linear-gradient(180deg, #0b1c3d, #05102a)
        `,
      }}
    />
  );
}

function parseFootballMinute(matchStatus?: string | null): string | null {
  if (!matchStatus) return null;
  const s = matchStatus.toUpperCase();
  if (s === "PAUSED" || s.includes("HALF")) return "HT";
  if (s === "IN_PLAY" || s === "LIVE") return "LIVE";
  return null;
}

export function MatchCard({
  event,
  onNavigate,
  variant = "default",
  livePulse = false,
  accent = "primary",
  uniqueBadge = false,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const teams = parseSportMatchTitle(event.title);
  const coverUrl = event.aiImageUrl?.trim() || null;
  const hasCover = !!coverUrl && !imgFailed;
  const isLive = variant === "live" || livePulse;
  const isUnique = variant === "unique";
  const liveMinute = parseFootballMinute(event.matchStatus);

  return (
    <Link
      href={`/events/${event.id}`}
      onClick={onNavigate}
      aria-label={`Apri mercato: ${event.title}`}
      className={[
        "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl",
        "border border-white/[0.07] bg-white/[0.025]",
        "transition-[transform,box-shadow,border-color] duration-300",
        "hover:-translate-y-0.5 hover:border-white/[0.14]",
        ACCENT_SHADOW[accent],
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      ].join(" ")}
    >
      {/* ── COVER ─────────────────────────────────────────── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <FallbackCover seed={event.id + event.title} />
        {hasCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl!}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}

        {/* subtle vignette so text on overlay remains readable */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40"
        />
        {/* top highlight band */}
        <div
          aria-hidden
          className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${ACCENT_RING[accent]} opacity-40`}
        />

        {/* top-left: competition + unique badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <CompetitionBadge
            league={event.sportLeague}
            category={event.category}
            size="sm"
          />
          {isUnique && uniqueBadge && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/35 bg-amber-400/[0.12] px-1.5 py-[3px] backdrop-blur-md">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.8)]"
              />
              <span className="font-[Oswald] text-[9.5px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                Unico
              </span>
            </span>
          )}
        </div>

        {/* top-right: live badge OR countdown */}
        <div className="absolute right-3 top-3">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-600/80 px-2 py-[3px] shadow-[0_0_14px_rgba(244,63,94,0.6)] backdrop-blur-sm">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-80" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="font-[Oswald] text-[9.5px] font-bold uppercase tracking-[0.26em] text-white">
                {liveMinute ?? "Live"}
              </span>
            </span>
          ) : (
            <CountdownPill closesAt={event.closesAt} size="sm" variant="glass" />
          )}
        </div>

        {/* bottom title overlay for match-style events */}
        {teams ? (
          <div className="absolute inset-x-3 bottom-3">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-right font-display text-[0.95rem] font-bold leading-none tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-[1.05rem]">
                {teams.teamA}
              </span>
              <span
                aria-hidden
                className="font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55"
              >
                vs
              </span>
              <span className="min-w-0 flex-1 truncate font-display text-[0.95rem] font-bold leading-none tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-[1.05rem]">
                {teams.teamB}
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-3 bottom-3">
            <h3 className="line-clamp-2 font-display text-[0.9rem] font-bold leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-[0.98rem]">
              {event.title}
            </h3>
          </div>
        )}
      </div>

      {/* ── BODY ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-3">
        {/* "Chi vincerà?" for match events — shown only at sm+ to save space */}
        {teams && (
          <p className="hidden text-[0.76rem] font-medium text-white/50 sm:line-clamp-1">
            Chi vincerà?
          </p>
        )}

        <OddsBlock event={event} compact />

        {/* footer */}
        <div className="mt-auto flex items-center justify-between pt-1 text-[10px] text-white/40">
          <span className="inline-flex items-center gap-1">
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              className="h-2.5 w-2.5 fill-white/35"
            >
              <circle cx="6" cy="4" r="2" />
              <path d="M2 11c0-2 1.8-3.5 4-3.5S10 9 10 11" />
            </svg>
            <span className="font-numeric tabular-nums">
              {event.predictionsCount.toLocaleString("it-IT")}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-numeric tabular-nums">
              {event.totalCredits.toLocaleString("it-IT")}
            </span>
            <span className="text-white/25">Ꝓ</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
