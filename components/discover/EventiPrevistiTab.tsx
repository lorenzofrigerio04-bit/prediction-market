"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SeguitiSection, { type SeguitiSectionEvent } from "@/components/discover/SeguitiSection";
import CreatedEventTileInRevision from "@/components/discover/CreatedEventTileInRevision";
import HomeEventTile from "@/components/home/HomeEventTile";
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
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    submissions: { id: string; title: string; description?: string | null; category: string; closesAt: string; status: string }[];
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
                submissions: createdRes.submissions ?? [],
                categories: createdRes.categories ?? [],
                topCreated: (createdRes.topCreated ?? []).slice(0, 3),
              }
            : null
        );
      })
      .catch(() => setError("Impossibile caricare i dati."))
      .finally(() => setLoading(false));
  }, [status]);

  const refetchCreati = () => {
    fetch("/api/events/my-created")
      .then((r) => (r.ok ? r.json() : null))
      .then((createdRes) => {
        if (createdRes) {
          setCreati({
            events: createdRes.events ?? [],
            submissions: createdRes.submissions ?? [],
            categories: createdRes.categories ?? [],
            topCreated: (createdRes.topCreated ?? []).slice(0, 3),
          });
        }
      });
  };

  useEffect(() => {
    if (menuOpenId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  const handleDelete = async (type: "submission" | "event", id: string) => {
    setMenuOpenId(null);
    if (!window.confirm("Vuoi davvero eliminare questo evento?")) return;
    setDeletingId(id);
    try {
      const url = type === "submission" ? `/api/events/submit/${id}` : `/api/events/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) refetchCreati();
      else {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error || "Errore durante l'eliminazione.");
      }
    } finally {
      setDeletingId(null);
    }
  };

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
    <div className="pt-2 pb-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-ds-h2 font-bold text-fg">Seguiti</h1>
          <Link
            href="/crea"
            className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline shrink-0"
          >
            + Crea evento
          </Link>
        </div>

        {/* 1) Eventi in vantaggio */}
        <SeguitiSection
          title={`Eventi in vantaggio (${inVantaggio?.events?.length ?? 0})`}
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
            title={`Eventi seguiti (${seguiti?.events?.length ?? 0})`}
            topN={10}
            topEvents={seguiti?.topFollowed ?? []}
            allEvents={seguiti?.events ?? []}
            categories={seguiti?.categories ?? []}
            toTileData={(e) => toTileFollowed(e as FollowedEvent)}
            variant="foryou"
            emptyMessage="Non segui ancora nessun evento."
          />
        </div>

        {/* 3) I tuoi eventi creati: una sola griglia 2 colonne, submission (in revisione) prima a sinistra, poi eventi pubblicati */}
        <div id="creati" className="border-t border-white/10 pt-4 sm:pt-5 scroll-mt-24">
          <h2 className="text-ds-h2 font-bold text-fg mb-3 sm:mb-4">
            I tuoi eventi creati ({(creati?.events?.length ?? 0) + (creati?.submissions?.length ?? 0)})
          </h2>
          {(() => {
            const subs = creati?.submissions ?? [];
            const events = creati?.topCreated ?? [];
            const total = subs.length + events.length;
            if (total === 0) {
              return (
                <div className="flex flex-col items-center gap-4 py-6 sm:py-8">
                  <p className="text-ds-body-sm text-fg-muted text-center">Non hai ancora creato eventi.</p>
                  <Link
                    href="/crea"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-primary bg-primary/15 px-6 py-3 text-ds-body-sm font-semibold tracking-[0.02em] text-primary shadow-[0_0_20px_-6px_rgba(var(--primary-glow),0.28)] transition-[border-color,box-shadow,background-color] duration-200 hover:bg-primary/25 hover:shadow-[0_0_24px_-6px_rgba(var(--primary-glow),0.4)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg dark:border-primary dark:text-fg dark:shadow-[0_0_16px_-6px_rgba(var(--primary-glow),0.22)] dark:hover:bg-primary/20 dark:hover:shadow-[0_0_20px_-6px_rgba(var(--primary-glow),0.32)]"
                  >
                    <svg className="h-4 w-4 opacity-90" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Crea il tuo primo evento
                  </Link>
                </div>
              );
            }
            const items: ({ type: "submission"; data: (typeof subs)[0] } | { type: "event"; data: CreatedEvent })[] = [
              ...subs.map((s) => ({ type: "submission" as const, data: s })),
              ...events.map((e) => ({ type: "event" as const, data: e })),
            ];
            return (
              <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                {items.map((item) => {
                  const isSubmission = item.type === "submission";
                  const itemId = item.data.id;
                  const menuId = isSubmission ? `sub-${itemId}` : `ev-${itemId}`;
                  const isMenuOpen = menuOpenId === menuId;
                  const isDeleting = deletingId === itemId;
                  return (
                    <div key={menuId} className="relative" ref={isMenuOpen ? menuRef : undefined}>
                      {/* Menu 3 pallini in alto a destra */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpenId(isMenuOpen ? null : menuId);
                        }}
                        disabled={isDeleting}
                        className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                        aria-label="Opzioni evento"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="menu"
                      >
                        <span className="sr-only">Opzioni</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <circle cx="12" cy="6" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="18" r="1.5" />
                        </svg>
                      </button>
                      {isMenuOpen && (
                        <div
                          className="absolute right-2 top-10 z-30 min-w-[140px] rounded-lg border border-white/20 bg-bg/95 py-1 shadow-lg backdrop-blur-sm"
                          role="menu"
                          aria-orientation="vertical"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-ds-body-sm text-fg hover:bg-white/10"
                            onClick={(e) => {
                              e.preventDefault();
                              setMenuOpenId(null);
                              if (isSubmission) router.push(`/crea?submission=${itemId}`);
                              else router.push(`/crea?edit=${itemId}`);
                            }}
                          >
                            Modifica
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-ds-body-sm text-red-400 hover:bg-white/10"
                            onClick={() => handleDelete(isSubmission ? "submission" : "event", itemId)}
                          >
                            Elimina
                          </button>
                        </div>
                      )}
                      {isSubmission ? (
                        <CreatedEventTileInRevision
                          id={item.data.id}
                          title={item.data.title}
                          category={item.data.category}
                          closesAt={item.data.closesAt}
                          description={item.data.description}
                        />
                      ) : (
                        <HomeEventTile
                          id={item.data.id}
                          title={item.data.title}
                          category={item.data.category}
                          closesAt={item.data.closesAt}
                          yesPct={(item.data as CreatedEvent).yesPct ?? 50}
                          predictionsCount={(item.data as CreatedEvent).predictionsCount}
                          variant="popular"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
  );
}
