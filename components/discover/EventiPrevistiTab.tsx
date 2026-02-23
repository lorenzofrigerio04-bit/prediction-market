"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CreateEventModal from "@/components/discover/CreateEventModal";
import SeguitiSection, { type SeguitiSectionEvent } from "@/components/discover/SeguitiSection";
import type { HomeEventTileData } from "@/components/home/HomeCarouselBox";
import { EmptyState, LoadingBlock } from "@/components/ui";

interface EventiPrevistiTabProps {
  onTornaATuttiGliEventi: () => void;
  categoriesFromPerTe: string[];
}

interface MyPredictionEvent extends SeguitiSectionEvent {
  userWinProbability: number;
  predictionsCount?: number;
}

interface FollowedEvent extends SeguitiSectionEvent {
  yesPct: number;
  predictionsCount?: number;
  followersCount?: number;
}

interface CreatedEvent extends SeguitiSectionEvent {
  yesPct: number;
  predictionsCount?: number;
}

export default function EventiPrevistiTab({
  onTornaATuttiGliEventi,
  categoriesFromPerTe,
}: EventiPrevistiTabProps) {
  const { data: session, status } = useSession();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [inVantaggio, setInVantaggio] = useState<{
    events: MyPredictionEvent[];
    categories: string[];
    topInLead: MyPredictionEvent[];
  } | null>(null);
  const [seguiti, setSeguiti] = useState<{
    events: FollowedEvent[];
    categories: string[];
    topFollowed: FollowedEvent[];
  } | null>(null);
  const [creati, setCreati] = useState<{
    events: CreatedEvent[];
    categories: string[];
    topCreated: CreatedEvent[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      setInVantaggio(null);
      setSeguiti(null);
      setCreati(null);
      return;
    }
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/events/my-predictions").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/events/followed").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/events/my-created").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([predRes, followedRes, createdRes]) => {
        setInVantaggio(
          predRes
            ? {
                events: predRes.events ?? [],
                categories: predRes.categories ?? [],
                topInLead: (predRes.topInLead ?? []).slice(0, 10),
              }
            : null
        );
        setSeguiti(
          followedRes
            ? {
                events: followedRes.events ?? [],
                categories: followedRes.categories ?? [],
                topFollowed: (followedRes.topFollowed ?? []).slice(0, 10),
              }
            : null
        );
        setCreati(
          createdRes
            ? {
                events: createdRes.events ?? [],
                categories: createdRes.categories ?? [],
                topCreated: (createdRes.topCreated ?? []).slice(0, 3),
              }
            : null
        );
      })
      .catch(() => setError("Impossibile caricare i dati."))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <section className="text-center py-12">
        <p className="text-fg-muted mb-4">
          Accedi per vedere eventi in vantaggio, seguiti e creati da te.
        </p>
        <Link
          href={`/auth/login?callbackUrl=${encodeURIComponent("/discover?tab=seguiti")}`}
          className="landing-cta-primary inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm"
        >
          Accedi
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-10">
        <LoadingBlock message="Caricamento…" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10">
        <EmptyState
          title="Errore"
          description={error}
          action={{ label: "Riprova", onClick: () => window.location.reload() }}
        />
      </section>
    );
  }

  const toTileInVantaggio = (e: MyPredictionEvent): HomeEventTileData => ({
    id: e.id,
    title: e.title,
    category: e.category,
    closesAt: e.closesAt,
    yesPct: e.userWinProbability,
    predictionsCount: e.predictionsCount,
  });

  const toTileFollowed = (e: FollowedEvent): HomeEventTileData => ({
    id: e.id,
    title: e.title,
    category: e.category,
    closesAt: e.closesAt,
    yesPct: e.yesPct ?? Math.round(Number(e.probability) || 50),
    predictionsCount: e.predictionsCount,
  });

  const toTileCreated = (e: CreatedEvent): HomeEventTileData => ({
    id: e.id,
    title: e.title,
    category: e.category,
    closesAt: e.closesAt,
    yesPct: e.yesPct ?? Math.round(Number(e.probability) || 50),
    predictionsCount: e.predictionsCount,
  });

  return (
    <>
      <div className="pt-2 pb-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-ds-h2 font-bold text-fg">Seguiti</h1>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline shrink-0"
          >
            + Crea evento
          </button>
        </div>

        {/* 1) Eventi in vantaggio */}
        <SeguitiSection
          title="Eventi in vantaggio"
          topN={10}
          topEvents={inVantaggio?.topInLead ?? []}
          allEvents={inVantaggio?.events ?? []}
          categories={inVantaggio?.categories ?? []}
          toTileData={(e) => toTileInVantaggio(e as MyPredictionEvent)}
          filterVediTutti={(e) => (e as MyPredictionEvent).userWinProbability > 50}
          variant="popular"
          emptyMessage="Nessun evento con una tua posizione al momento."
        />

        {/* 2) Eventi seguiti */}
        <div className="border-t border-white/10 pt-4 sm:pt-5">
          <SeguitiSection
            title="Eventi seguiti"
            topN={10}
            topEvents={seguiti?.topFollowed ?? []}
            allEvents={seguiti?.events ?? []}
            categories={seguiti?.categories ?? []}
            toTileData={(e) => toTileFollowed(e as FollowedEvent)}
            variant="foryou"
            emptyMessage="Non segui ancora nessun evento."
          />
        </div>

        {/* 3) I tuoi eventi creati */}
        <div className="border-t border-white/10 pt-4 sm:pt-5">
          <SeguitiSection
            title="I tuoi eventi creati"
            topN={3}
            topEvents={creati?.topCreated ?? []}
            allEvents={creati?.events ?? []}
            categories={creati?.categories ?? []}
            toTileData={(e) => toTileCreated(e as CreatedEvent)}
            variant="popular"
            emptyMessage="Non hai ancora creato eventi."
          />
        </div>

        {/* CTA Torna a tutti gli eventi */}
        <section className="border-t border-white/10 pt-6 pb-8 text-center">
          <button
            type="button"
            onClick={onTornaATuttiGliEventi}
            className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm inline-flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Torna a tutti gli eventi
          </button>
        </section>
      </div>

      {showCreateModal && (
        <CreateEventModal
          categories={categoriesFromPerTe}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
