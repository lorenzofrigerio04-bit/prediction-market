"use client";

import { useState } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { CountdownPill } from "@/components/home/football/premium/CountdownPill";
import { OddsBlock } from "@/components/home/football/premium/OddsBlock";
import { ProbabilityBadge } from "@/components/home/football/premium/ProbabilityBadge";
import { isBinaryYesNoRailLayout, getBinaryLeadingDisplay } from "@/lib/home-event-binary-layout";

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
  showCountdown?: boolean;
  showExpiry?: boolean;
  accent?: "primary" | "gold" | "rose" | "violet" | "emerald" | "cyan";
}

const ACCENT_GLOW: Record<NonNullable<Props["accent"]>, string> = {
  primary: "hover:shadow-[0_20px_50px_-18px_rgba(80,245,252,0.28)]",
  gold: "hover:shadow-[0_20px_50px_-18px_rgba(252,211,77,0.28)]",
  rose: "hover:shadow-[0_20px_50px_-18px_rgba(244,63,94,0.28)]",
  violet: "hover:shadow-[0_20px_50px_-18px_rgba(167,139,250,0.28)]",
  emerald: "hover:shadow-[0_20px_50px_-18px_rgba(52,211,153,0.28)]",
  cyan: "hover:shadow-[0_20px_50px_-18px_rgba(34,211,238,0.28)]",
};

const ACCENT_STRIPE: Record<NonNullable<Props["accent"]>, string> = {
  primary:
    "linear-gradient(180deg, rgba(80,245,252,0.72) 0%, rgba(80,245,252,0.12) 55%, rgba(80,245,252,0.04) 100%)",
  gold: "linear-gradient(180deg, rgba(252,211,77,0.68) 0%, rgba(252,211,77,0.12) 55%, rgba(252,211,77,0.04) 100%)",
  rose: "linear-gradient(180deg, rgba(244,63,94,0.62) 0%, rgba(244,63,94,0.12) 55%, rgba(244,63,94,0.04) 100%)",
  violet:
    "linear-gradient(180deg, rgba(167,139,250,0.62) 0%, rgba(167,139,250,0.12) 55%, rgba(167,139,250,0.04) 100%)",
  emerald:
    "linear-gradient(180deg, rgba(52,211,153,0.62) 0%, rgba(52,211,153,0.12) 55%, rgba(52,211,153,0.04) 100%)",
  cyan: "linear-gradient(180deg, rgba(34,211,238,0.58) 0%, rgba(34,211,238,0.12) 55%, rgba(34,211,238,0.04) 100%)",
};

const ACCENT_TOPBAR: Record<NonNullable<Props["accent"]>, string> = {
  primary:
    "linear-gradient(90deg, rgba(80,245,252,0.42) 0%, rgba(80,245,252,0.12) 38%, transparent 72%)",
  gold: "linear-gradient(90deg, rgba(252,211,77,0.38) 0%, rgba(252,211,77,0.10) 40%, transparent 72%)",
  rose: "linear-gradient(90deg, rgba(244,63,94,0.36) 0%, rgba(244,63,94,0.10) 40%, transparent 72%)",
  violet:
    "linear-gradient(90deg, rgba(167,139,250,0.36) 0%, rgba(167,139,250,0.10) 40%, transparent 72%)",
  emerald:
    "linear-gradient(90deg, rgba(52,211,153,0.36) 0%, rgba(52,211,153,0.10) 40%, transparent 72%)",
  cyan: "linear-gradient(90deg, rgba(34,211,238,0.34) 0%, rgba(34,211,238,0.10) 40%, transparent 72%)",
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

  const binaryKalshi = isBinaryYesNoRailLayout(event);
  const { leadingPct } = getBinaryLeadingDisplay(event.yesPct);

  if (binaryKalshi) {
    return (
      <Link
        href={`/events/${event.id}`}
        onClick={onNavigate}
        aria-label={`Apri evento: ${event.title}`}
        className={[
          "group relative flex flex-col overflow-hidden rounded-[1.125rem]",
          "border border-white/[0.11]",
          "bg-[radial-gradient(120%_140%_at_88%_-8%,rgba(255,255,255,0.08),transparent_42%),linear-gradient(165deg,#050a17_0%,#070d18_52%,#03060d_100%)]",
          "shadow-[0_12px_48px_-16px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.06)]",
          "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:-translate-y-[2px] hover:border-white/[0.19] hover:shadow-[0_20px_52px_-18px_rgba(0,0,0,0.72)]",
          ACCENT_GLOW[accent],
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        ].join(" ")}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <FallbackCover seed={event.id + event.title} />

          {hasCover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl!}
              alt=""
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            />
          )}

          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/34 to-black/42"
          />

          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[2.5px] rounded-l-2xl opacity-90"
            style={{ background: ACCENT_STRIPE[accent] }}
          />

          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: ACCENT_TOPBAR[accent] }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-[36%] -left-[36%] group-hover:left-[128%] bg-gradient-to-r from-transparent via-white/[0.055] to-transparent transition-[left] duration-[720ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          />

          {isLive && (
            <div className="absolute left-2.5 top-2.5 z-[1] flex max-w-[calc(100%-7.75rem)] flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/45 bg-rose-600/82 px-2 py-[3px] shadow-[0_0_14px_rgba(244,63,94,0.45)] backdrop-blur-sm">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/75 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="font-[Oswald] text-[8.5px] font-bold uppercase tracking-[0.22em] text-white">
                  Live
                </span>
              </span>
            </div>
          )}

          <div className="absolute right-2 top-2 z-[1] flex flex-col items-end gap-1.5">
            <ProbabilityBadge
              variant="rail"
              railAccent={accent}
              pct={leadingPct}
              size="prominent"
            />
            {!isLive && showCountdown ? (
              <CountdownPill closesAt={event.closesAt} size="sm" variant="glass" />
            ) : null}
          </div>

          <div className="absolute inset-x-3 bottom-3 z-[1] sm:inset-x-3.5 sm:bottom-3.5">
            <h3 className="line-clamp-2 font-kalshi font-semibold leading-[1.14] tracking-[0.038em] text-[1rem] text-white/[0.98] antialiased sm:text-[1.07rem]"
              style={{
                textShadow:
                  "0 2px 20px rgba(0,0,0,0.96), 0 0 40px rgba(0,0,0,0.45), 0 1px 0 rgba(0,0,0,0.25)",
              }}
            >
              {event.title}
            </h3>
          </div>
        </div>

        {showExpiry && (
          <div className="border-t border-white/[0.06] bg-black/20 px-2.5 py-2 sm:px-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/45 bg-rose-500/[0.09] px-2 py-[4px] shadow-[0_0_12px_-4px_rgba(244,63,94,0.35)]">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.75)]"
                aria-hidden
              />
              <span className="font-[Oswald] text-[9px] font-semibold uppercase tracking-[0.14em] text-rose-200/95">
                chiude {formatExpiry(event.closesAt)}
              </span>
            </span>
          </div>
        )}
      </Link>
    );
  }

  const displayLabel = event.sportLeague ? event.sportLeague : event.category;

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

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-black/42"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />

        <div className="absolute left-2.5 top-2.5">
          <span className="inline-flex items-center rounded-full bg-black/52 px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.09em] text-white/80 backdrop-blur-sm">
            {displayLabel}
          </span>
        </div>

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

        {!isLive && showCountdown && (
          <div className="absolute right-2.5 top-2.5">
            <CountdownPill closesAt={event.closesAt} size="sm" variant="glass" />
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3">
          <h3 className="line-clamp-2 font-display text-[0.875rem] font-bold leading-[1.18] tracking-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-[0.94rem]">
            {event.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <OddsBlock event={event} compact />

        {showExpiry && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/50 bg-rose-500/[0.08] px-2 py-[3px] shadow-[0_0_10px_-3px_rgba(244,63,94,0.35)]">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                aria-hidden
              />
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
