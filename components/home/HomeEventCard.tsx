"use client";

import { useState } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { CountdownPill } from "@/components/home/football/premium/CountdownPill";
import { OddsBlock } from "@/components/home/football/premium/OddsBlock";

function formatExpiry(closesAt: string): string {
  const d = new Date(closesAt);
  if (!isFinite(d.getTime())) return "";
  const now = Date.now();
  const diffMs = d.getTime() - now;
  if (diffMs <= 0) return "chiuso";
  const diffH = diffMs / 3_600_000;
  if (diffH < 1) return "< 1h";
  if (diffH < 24) return `${Math.floor(diffH)}h`;
  const diffD = diffMs / 86_400_000;
  if (diffD < 2) return "domani";
  if (diffD < 7) return `${Math.floor(diffD)}g`;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" }).replace(".", "");
}

interface Props {
  event: FootballEvent;
  onNavigate?: () => void;
  isLive?: boolean;
  /** Show countdown pill on the cover. Only for expiring sections. */
  showCountdown?: boolean;
  /** Show expiry row below the odds. Only for expiring sections. */
  showExpiry?: boolean;
  /** Visual hue tint for hover glow. */
  accent?: "primary" | "gold" | "rose" | "violet" | "emerald" | "cyan";
}

const ACCENT_GLOW: Record<NonNullable<Props["accent"]>, string> = {
  primary: "hover:shadow-[0_20px_50px_-18px_rgba(80,245,252,0.28)]",
  gold:    "hover:shadow-[0_20px_50px_-18px_rgba(252,211,77,0.28)]",
  rose:    "hover:shadow-[0_20px_50px_-18px_rgba(244,63,94,0.28)]",
  violet:  "hover:shadow-[0_20px_50px_-18px_rgba(167,139,250,0.28)]",
  emerald: "hover:shadow-[0_20px_50px_-18px_rgba(52,211,153,0.28)]",
  cyan:    "hover:shadow-[0_20px_50px_-18px_rgba(34,211,238,0.28)]",
};

/** Deterministic gradient fallback from event id. */
function FallbackCover({ seed }: { seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const h1 = h % 360;
  const h2 = (h1 + 42) % 360;
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(130% 85% at 18% 22%, hsl(${h1} 65% 20% / 0.88), transparent 52%),
          radial-gradient(130% 85% at 82% 78%, hsl(${h2} 65% 16% / 0.82), transparent 52%),
          linear-gradient(160deg, #0c1e3e 0%, #060f24 100%)
        `,
      }}
    />
  );
}

export function HomeEventCard({
  event,
  onNavigate,
  isLive = false,
  showCountdown = false,
  showExpiry = false,
  accent = "primary",
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const coverUrl = event.aiImageUrl?.trim() || null;
  const hasCover = !!coverUrl && !imgFailed;

  const displayLabel = event.sportLeague
    ? event.sportLeague
    : event.category;

  return (
    <Link
      href={`/events/${event.id}`}
      onClick={onNavigate}
      aria-label={`Apri evento: ${event.title}`}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl",
        "border border-white/[0.07] bg-[#070d1a]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-[2px] hover:border-white/[0.15]",
        ACCENT_GLOW[accent],
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      ].join(" ")}
    >
      {/* ── COVER ───────────────────────────────────────────── */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <FallbackCover seed={event.id + event.title} />

        {hasCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl!}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        )}

        {/* Cinematic gradient overlay */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-black/42"
        />
        {/* Top highlight glimmer */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />

        {/* Category / league badge — top left */}
        <div className="absolute left-2.5 top-2.5">
          <span className="inline-flex items-center rounded-full bg-black/52 px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.09em] text-white/80 backdrop-blur-sm">
            {displayLabel}
          </span>
        </div>

        {/* Live pill — always visible when live */}
        {isLive && (
          <div className="absolute right-2.5 top-2.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-600/80 px-2 py-[3px] shadow-[0_0_12px_rgba(244,63,94,0.55)] backdrop-blur-sm">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/75 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="font-[Oswald] text-[9px] font-bold uppercase tracking-[0.22em] text-white">
                Live
              </span>
            </span>
          </div>
        )}

        {/* Countdown pill — only when explicitly requested (e.g. expiring section) */}
        {!isLive && showCountdown && (
          <div className="absolute right-2.5 top-2.5">
            <CountdownPill closesAt={event.closesAt} size="sm" variant="glass" />
          </div>
        )}

        {/* Title — bottom of cover, overlaid */}
        <div className="absolute inset-x-3 bottom-3">
          <h3 className="line-clamp-2 font-display text-[0.875rem] font-bold leading-[1.18] tracking-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-[0.94rem]">
            {event.title}
          </h3>
        </div>
      </div>

      {/* ── STATS ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        {/* Odds / outcome probabilities */}
        <OddsBlock event={event} compact />

        {/* Expiry pill — only in "In Scadenza" section */}
        {showExpiry && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/50 bg-rose-500/[0.08] px-2 py-[3px] shadow-[0_0_10px_-3px_rgba(244,63,94,0.35)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" aria-hidden />
              <span className="font-[Oswald] text-[9px] font-semibold uppercase tracking-[0.14em] text-rose-300">
                chiude {formatExpiry(event.closesAt)}
              </span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
