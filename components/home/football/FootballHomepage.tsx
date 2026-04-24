"use client";

import { useHomepageData } from "@/lib/hooks/useHomepageData";
import { Top24hSection } from "./Top24hSection";
import { ForYouSection } from "./ForYouSection";
import { ViralSection } from "./ViralSection";
import { LiveSection } from "./LiveSection";
import { ExpiringSection } from "./ExpiringSection";
import { HomeTrendingRail } from "@/components/home/HomeTrendingRail";

interface Props {
  isLoggedIn: boolean;
  onEventNavigate?: () => void;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function RailSkeleton() {
  return (
    <div aria-hidden>
      {/* Header skeleton */}
      <div className="mb-5 animate-pulse">
        <div className="h-2.5 w-24 rounded-full bg-white/[0.07]" />
        <div className="mt-2.5 h-7 w-44 rounded-md bg-white/[0.08]" />
        <div className="mt-3 h-px w-full bg-gradient-to-r from-white/[0.1] via-white/[0.04] to-transparent" />
      </div>
      {/* Cards skeleton */}
      <div className="flex gap-2.5 overflow-hidden pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-[190px] min-w-[190px] shrink-0 animate-pulse rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-white/[0.01] sm:w-[240px] sm:min-w-[240px]"
            style={{ aspectRatio: "16/13" }}
          />
        ))}
      </div>
    </div>
  );
}

function HomepageSkeleton() {
  return (
    <div className="space-y-10" aria-label="Caricamento homepage">
      <RailSkeleton />
      <RailSkeleton />
      <RailSkeleton />
      <RailSkeleton />
      <RailSkeleton />
    </div>
  );
}

// ─── States ───────────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-rose-500/[0.05] py-12 text-center">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(244,63,94,0.10),transparent_70%)]"
      />
      <div className="relative flex flex-col items-center gap-4">
        <span className="text-3xl" aria-hidden>⚠︎</span>
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-white">
            Qualcosa è andato storto
          </p>
          <p className="mt-1 text-sm text-white/55">
            Non siamo riusciti a caricare i mercati.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl border border-primary/35 bg-primary/[0.12] px-5 py-2.5 font-[Oswald] text-[11px] font-bold uppercase tracking-[0.22em] text-primary transition-all hover:border-primary/55 hover:bg-primary/[0.18] hover:shadow-[0_0_22px_-4px_rgba(80,245,252,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Riprova a caricare i mercati"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}

function EmptyPipelineWarning() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-400/25 bg-amber-500/[0.06] px-4 py-2.5 backdrop-blur-sm">
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.7)]"
      />
      <p className="font-[Oswald] text-[10.5px] font-semibold uppercase tracking-[0.2em] text-amber-200">
        Mock mode · Pipeline Sport 2.0 vuota
      </p>
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export function FootballHomepage({ isLoggedIn, onEventNavigate }: Props) {
  const { data, loading, error, refresh } = useHomepageData(
    "/api/feed/football-homepage"
  );

  if (loading && !data) {
    return (
      <section aria-label="Homepage — Prediction Master" className="space-y-10">
        <HomepageSkeleton />
      </section>
    );
  }

  if (error) {
    return <ErrorState onRetry={refresh} />;
  }

  if (!data) return null;

  const hasAnyContent =
    data.top24hEvents.length > 0 ||
    data.forYouMarkets.length > 0 ||
    data.viralEvents.length > 0 ||
    data.liveEvents.length > 0 ||
    data.expiringEvents.length > 0;

  return (
    <section aria-label="Homepage — Prediction Master" className="flex flex-col">
      {data.isEmpty && process.env.NODE_ENV !== "production" && (
        <div className="mb-8">
          <EmptyPipelineWarning />
        </div>
      )}

      {/* 1. TOP 5 OGGI */}
      <div className="mb-12 pt-6 sm:mb-14 sm:pt-8">
        <Top24hSection events={data.top24hEvents} onNavigate={onEventNavigate} />
      </div>

      {/* 2. CONSIGLIATI */}
      <div className="mb-14 sm:mb-16">
        <ForYouSection
          events={data.forYouMarkets}
          isPersonalized={data.isPersonalized}
          isLoggedIn={isLoggedIn}
          onNavigate={onEventNavigate}
        />
      </div>

      {/* Rail A — separatore */}
      {data.top24hEvents.length >= 2 && (
        <div className="mb-14 sm:mb-16">
          <HomeTrendingRail
            events={data.top24hEvents.slice(0, 8)}
            onNavigate={onEventNavigate}
            cardAccent="gold"
          />
        </div>
      )}

      {/* 3. STA ESPLODENDO ORA */}
      <div className="mb-14 sm:mb-16">
        <ViralSection events={data.viralEvents} onNavigate={onEventNavigate} />
      </div>

      {/* Rail B — separatore */}
      {data.expiringEvents.length >= 2 && (
        <div className="mb-14 sm:mb-16">
          <HomeTrendingRail
            events={data.expiringEvents.slice(0, 8)}
            onNavigate={onEventNavigate}
            cardAccent="emerald"
          />
        </div>
      )}

      {/* 4. IN SCADENZA */}
      <div className="mb-14 sm:mb-16">
        <ExpiringSection events={data.expiringEvents} onNavigate={onEventNavigate} />
      </div>

      {/* Rail C — separatore */}
      {data.viralEvents.length >= 2 && (
        <div className="mb-14 sm:mb-16">
          <HomeTrendingRail
            events={data.viralEvents.slice(0, 8)}
            onNavigate={onEventNavigate}
            cardAccent="rose"
          />
        </div>
      )}

      {/* 5. LIVE (solo se presenti) */}
      {data.liveEvents.length > 0 && (
        <div className="mb-12 sm:mb-14">
          <LiveSection events={data.liveEvents} onNavigate={onEventNavigate} />
        </div>
      )}

      {/* Empty state */}
      {!hasAnyContent && (
        <div className="relative overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(80,245,252,0.08),transparent_70%)]"
          />
          <div className="relative flex flex-col items-center gap-4">
            <p className="font-display text-[1.2rem] font-extrabold tracking-tight text-white">
              Nessun mercato disponibile
            </p>
            <p className="text-[13.5px] text-white/50">
              La pipeline non ha ancora generato eventi.
            </p>
          </div>
        </div>
      )}

    </section>
  );
}
