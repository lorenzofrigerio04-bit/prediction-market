"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useHomepageData } from "@/lib/hooks/useHomepageData";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import type { FootballEvent, FootballHomepagePayload } from "@/types/homepage";

// ── Section config ──────────────────────────────────────────────────────────

type Accent = "gold" | "violet" | "crimson" | "emerald" | "primary";

interface SectionConfig {
  key: keyof FootballHomepagePayload;
  title: string;
  eyebrow: string;
  accent: Accent;
  cardAccent: "gold" | "violet" | "rose" | "emerald" | "primary";
  isLive?: boolean;
  showExpiry?: boolean;
}

const SECTION_MAP: Record<string, SectionConfig> = {
  "top-oggi": {
    key: "top24hEvents",
    title: "Top 5 Oggi",
    eyebrow: "Ultime 24 ore",
    accent: "gold",
    cardAccent: "gold",
  },
  "per-te": {
    key: "forYouMarkets",
    title: "Consigliati",
    eyebrow: "Selezionati per te",
    accent: "violet",
    cardAccent: "violet",
  },
  viral: {
    key: "viralEvents",
    title: "Sta esplodendo ora",
    eyebrow: "Viral",
    accent: "crimson",
    cardAccent: "rose",
  },
  "in-scadenza": {
    key: "expiringEvents",
    title: "In Scadenza",
    eyebrow: "Ultima chance",
    accent: "emerald",
    cardAccent: "emerald",
    showExpiry: true,
  },
  live: {
    key: "liveEvents",
    title: "Live",
    eyebrow: "In diretta ora",
    accent: "crimson",
    cardAccent: "rose",
    isLive: true,
  },
};

// ── Accent colour tokens ────────────────────────────────────────────────────

const ACCENT_STYLES: Record<Accent, { dot: string; text: string; line: string; glow: string; badge: string }> = {
  gold: {
    dot: "bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.7)]",
    text: "text-amber-300",
    line: "from-amber-300/60 via-amber-300/15 to-transparent",
    glow: "from-amber-300/[0.07]",
    badge: "border-amber-300/25 bg-amber-300/[0.08] text-amber-200",
  },
  violet: {
    dot: "bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.7)]",
    text: "text-violet-300",
    line: "from-violet-400/60 via-violet-400/15 to-transparent",
    glow: "from-violet-400/[0.07]",
    badge: "border-violet-400/25 bg-violet-400/[0.08] text-violet-200",
  },
  crimson: {
    dot: "bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.7)]",
    text: "text-rose-400",
    line: "from-rose-500/60 via-rose-500/15 to-transparent",
    glow: "from-rose-500/[0.07]",
    badge: "border-rose-500/25 bg-rose-500/[0.08] text-rose-200",
  },
  emerald: {
    dot: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]",
    text: "text-emerald-300",
    line: "from-emerald-400/60 via-emerald-400/15 to-transparent",
    glow: "from-emerald-400/[0.07]",
    badge: "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200",
  },
  primary: {
    dot: "bg-primary shadow-[0_0_14px_rgba(80,245,252,0.7)]",
    text: "text-primary",
    line: "from-primary/60 via-primary/15 to-transparent",
    glow: "from-primary/[0.07]",
    badge: "border-primary/25 bg-primary/[0.08] text-cyan-200",
  },
};

// ── Skeleton ────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
          style={{ aspectRatio: "16/13" }}
        />
      ))}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ accent }: { accent: Accent }) {
  const a = ACCENT_STYLES[accent];
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] py-20 text-center">
      <span className={`inline-block h-2 w-2 rounded-full ${a.dot}`} aria-hidden />
      <p className="font-display text-lg font-bold text-white">Nessun evento disponibile</p>
      <p className="text-sm text-white/45">Torna più tardi — nuovi mercati in arrivo.</p>
    </div>
  );
}

// ── Page content ─────────────────────────────────────────────────────────────

function SectionPageContent() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const config = SECTION_MAP[slug];

  const { data, loading } = useHomepageData(
    `/api/feed/football-homepage?section=${slug}`
  );

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg font-bold text-white">Sezione non trovata</p>
        <Link href="/" className="mt-4 text-sm text-primary underline underline-offset-4">
          Torna alla home
        </Link>
      </div>
    );
  }

  const a = ACCENT_STYLES[config.accent];
  const events = (data?.[config.key] as FootballEvent[] | undefined) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">

      {/* ── Back button ── */}
      <button
        type="button"
        onClick={() => router.back()}
        className="group mb-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white/70 focus-visible:outline-none"
      >
        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 7H4M6 4l-3 3 3 3" />
        </svg>
        Indietro
      </button>

      {/* ── Section header ── */}
      <header className="mb-10">
        {/* Glow radial behind title */}
        <div
          aria-hidden
          className={`pointer-events-none absolute left-0 right-0 -mt-16 h-48 bg-[radial-gradient(50%_100%_at_50%_0%,var(--tw-gradient-from),transparent_70%)] bg-gradient-to-b ${a.glow} to-transparent opacity-60`}
        />
        <div className="relative flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block h-2 w-2 rounded-full ${a.dot}`} aria-hidden />
              <span className={`font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.3em] ${a.text}`}>
                {config.eyebrow}
              </span>
            </div>
            <h1 className="font-kalshi text-[2.4rem] sm:text-[3rem] font-bold leading-[1.0] tracking-wide text-white">
              {config.title}
            </h1>
          </div>
        </div>
        <div className={`mt-5 h-px w-full bg-gradient-to-r ${a.line}`} aria-hidden />
      </header>

      {/* ── Grid ── */}
      {loading && !data ? (
        <GridSkeleton />
      ) : events.length === 0 ? (
        <EmptyState accent={config.accent} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <HomeEventCard
              key={event.id}
              event={event}
              accent={config.cardAccent}
              isLive={config.isLive}
              showExpiry={config.showExpiry}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SezioneSlugPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header showCategoryStrip={false} />
      <main id="main-content">
        <Suspense fallback={null}>
          <SectionPageContent />
        </Suspense>
      </main>
    </div>
  );
}
