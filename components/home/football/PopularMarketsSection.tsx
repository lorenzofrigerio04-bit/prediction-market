"use client";

import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { parseSportMatchTitle } from "@/lib/sport-match-title";
import { SectionHeader } from "./premium/SectionHeader";
import { CompetitionBadge } from "./premium/CompetitionBadge";
import { CountdownPill } from "./premium/CountdownPill";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

function MarketTypeLabel({ marketType }: { marketType?: string | null }) {
  if (marketType === "MULTIPLE_CHOICE" || marketType === "COUNT_VOLUME") {
    return (
      <span className="font-[Oswald] text-[9.5px] font-semibold uppercase tracking-[0.22em] text-violet-300/85">
        Multi-outcome
      </span>
    );
  }
  return (
    <span className="font-[Oswald] text-[9.5px] font-semibold uppercase tracking-[0.22em] text-primary/85">
      Binario · Sì/No
    </span>
  );
}

function SentimentBar({ yesPct }: { yesPct: number }) {
  const noPct = 100 - yesPct;
  return (
    <div
      className="relative flex h-[5px] w-full overflow-hidden rounded-full bg-white/[0.06]"
      role="img"
      aria-label={`Sentiment: ${yesPct}% Sì, ${noPct}% No`}
    >
      <div
        className="relative h-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[inset_0_0_8px_rgba(52,211,153,0.4)]"
        style={{ width: `${yesPct}%` }}
      />
      <div
        className="relative h-full bg-gradient-to-r from-rose-500 to-rose-400"
        style={{ width: `${noPct}%` }}
      />
    </div>
  );
}

function PopularMarketRow({
  event,
  rank,
  onNavigate,
}: {
  event: FootballEvent;
  rank: number;
  onNavigate?: () => void;
}) {
  const teams = parseSportMatchTitle(event.title);
  const displayTitle = teams
    ? `${teams.teamA} — ${teams.teamB}`
    : event.title;
  const subTitle = teams ? event.title : null;
  const noPct = 100 - event.yesPct;

  return (
    <Link
      href={`/events/${event.id}`}
      onClick={onNavigate}
      aria-label={`Mercato ${rank}: ${displayTitle}`}
      className={[
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl",
        "border border-white/[0.07] bg-white/[0.025] px-4 py-3.5",
        "transition-[transform,box-shadow,border-color,background-color] duration-300",
        "hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.04]",
        "hover:shadow-[0_16px_40px_-16px_rgba(80,245,252,0.22)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      ].join(" ")}
    >
      {/* Soft gradient on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Rank numeral */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.03]"
        />
        <span
          className={[
            "relative font-display text-[1.6rem] font-extrabold leading-none tabular-nums tracking-tight",
            rank === 1
              ? "text-primary drop-shadow-[0_0_8px_rgba(80,245,252,0.5)]"
              : rank === 2
              ? "text-white/75"
              : rank === 3
              ? "text-amber-300/80"
              : "text-white/40",
          ].join(" ")}
        >
          {rank}
        </span>
      </div>

      {/* Content */}
      <div className="relative min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <MarketTypeLabel marketType={event.marketType} />
          <span aria-hidden className="h-1 w-1 rounded-full bg-white/20" />
          <CompetitionBadge
            league={event.sportLeague}
            category={event.category}
            size="sm"
          />
        </div>
        <p className="line-clamp-1 font-display text-[0.95rem] font-bold leading-tight tracking-tight text-white group-hover:text-white">
          {displayTitle}
        </p>
        {subTitle && (
          <p className="mt-0.5 line-clamp-1 text-[11.5px] text-white/45">
            {subTitle}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3">
          <SentimentBar yesPct={event.yesPct} />
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span className="font-[Oswald] text-[9.5px] font-semibold uppercase tracking-[0.2em] text-white/40">
            {event.predictionsCount.toLocaleString("it-IT")} predictions
          </span>
          <CountdownPill closesAt={event.closesAt} size="sm" variant="inline" />
        </div>
      </div>

      {/* Odds column — compact on mobile, full on sm+ */}
      <div className="relative flex shrink-0 flex-col items-end gap-0.5 pl-1.5 sm:pl-3">
        <div className="flex items-baseline gap-1">
          <span className="font-numeric text-[1.1rem] font-extrabold leading-none tabular-nums tracking-tight text-emerald-300 sm:text-[1.35rem]">
            {event.yesPct}
          </span>
          <span className="font-numeric text-[0.7rem] font-semibold text-emerald-300/70">
            %
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-numeric text-[0.82rem] font-bold leading-none tabular-nums tracking-tight text-rose-300/85 sm:text-[0.95rem]">
            {noPct}
          </span>
          <span className="font-numeric text-[0.6rem] font-semibold text-rose-300/60">
            %
          </span>
        </div>
        <span className="font-[Oswald] text-[7.5px] font-semibold uppercase tracking-[0.2em] text-white/35">
          Sì / No
        </span>
      </div>

      <span
        aria-hidden
        className="hidden shrink-0 text-white/25 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-white/60 sm:block"
      >
        →
      </span>
    </Link>
  );
}

export function PopularMarketsSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Mercati popolari">
      <SectionHeader
        eyebrow="Top 5 per volume"
        title="Mercati Popolari"
        subtitle="I mercati più giocati dalla community"
        accent="primary"
        href="/discover/sport"
      />

      <div className="flex flex-col gap-2.5">
        {events.map((event, idx) => (
          <PopularMarketRow
            key={event.id}
            event={event}
            rank={idx + 1}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
