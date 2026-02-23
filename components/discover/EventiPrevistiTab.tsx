"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LandingEventRow from "@/components/landing/LandingEventRow";
import CreateEventModal from "@/components/discover/CreateEventModal";
import { EmptyState, LoadingBlock } from "@/components/ui";
import { getCategoryImagePath, slugifyCategory } from "@/lib/category-slug";

export interface MyPredictionEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability: number;
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
  userWinProbability: number;
  userSide: "YES" | "NO";
}

interface EventiPrevistiTabProps {
  onTornaATuttiGliEventi: () => void;
  categoriesFromPerTe: string[];
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  politica: "linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.3) 100%)",
  economia: "linear-gradient(135deg, rgba(34,197,94,0.4) 0%, rgba(20,184,166,0.3) 100%)",
  sport: "linear-gradient(135deg, rgba(239,68,68,0.35) 0%, rgba(249,115,22,0.3) 100%)",
  tecnologia: "linear-gradient(135deg, rgba(14,165,233,0.4) 0%, rgba(59,130,246,0.3) 100%)",
  cultura: "linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(139,92,246,0.3) 100%)",
  scienza: "linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(14,165,233,0.3) 100%)",
  intrattenimento: "linear-gradient(135deg, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.3) 100%)",
};

function getCategoryGradient(category: string): string {
  const slug = slugifyCategory(category);
  return CATEGORY_GRADIENTS[slug] ?? "linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(148,163,184,0.25) 100%)";
}

export default function EventiPrevistiTab({
  onTornaATuttiGliEventi,
  categoriesFromPerTe,
}: EventiPrevistiTabProps) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<{
    events: MyPredictionEvent[];
    categories: string[];
    topInLead: MyPredictionEvent[];
    totalEvents: number;
    totalCategories: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const categoriesRef = useRef<HTMLElement>(null);

  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      setData(null);
      return;
    }
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);
    fetch("/api/events/my-predictions")
      .then((r) => {
        if (r.status === 401) return null;
        return r.ok ? r.json() : Promise.reject(new Error("Errore caricamento"));
      })
      .then((json) => {
        if (json) {
          setData({
            events: json.events ?? [],
            categories: json.categories ?? [],
            topInLead: json.topInLead ?? [],
            totalEvents: json.totalEvents ?? 0,
            totalCategories: json.totalCategories ?? 0,
          });
        } else {
          setData({
            events: [],
            categories: [],
            topInLead: [],
            totalEvents: 0,
            totalCategories: 0,
          });
        }
      })
      .catch(() => setError("Impossibile caricare le tue previsioni."))
      .finally(() => setLoading(false));
  }, [status]);

  const filteredEvents = data
    ? selectedCategory
      ? data.events.filter((e) => e.category === selectedCategory)
      : data.events
    : [];
  const categories = data?.categories ?? [];

  if (status === "unauthenticated") {
    return (
      <section className="text-center py-12">
        <p className="text-fg-muted mb-4">
          Accedi per vedere gli eventi su cui hai scommesso.
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
        <LoadingBlock message="Caricamento delle tue previsioni…" />
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

  return (
    <>
      <section className="text-center mb-8 md:mb-10">
        <h1 className="text-ds-h1 font-bold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          Rivedi le tue previsioni
        </h1>
        <div className="discover-hero-line mx-auto mb-6" aria-hidden />
        <div className="flex justify-center items-stretch gap-4 sm:gap-6">
          <button
            onClick={scrollToCategories}
            className="flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-transform min-w-[70px]"
          >
            <span className="discover-stat-value">{data?.totalCategories ?? 0}</span>
            <span className="discover-stat-label mt-1">Categorie previste</span>
          </button>
          <div className="discover-divider-led self-center" aria-hidden />
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-transform min-w-[70px]"
          >
            <span className="discover-stat-value">+</span>
            <span className="discover-stat-label mt-1">Crea evento</span>
          </button>
          <div className="discover-divider-led self-center" aria-hidden />
          <div className="flex flex-col items-center justify-between min-w-[70px]">
            <span className="discover-stat-value">{data?.totalEvents ?? 0}</span>
            <span className="discover-stat-label mt-1">Eventi previsti</span>
          </div>
        </div>
      </section>

      {/* Top 5: I tuoi pronostici in vantaggio */}
      {data && data.topInLead.length > 0 && (
        <section className="mb-10 md:mb-12">
          <h2 className="discover-viral-title text-ds-h2 font-bold text-white mb-4">
            I tuoi pronostici in vantaggio
          </h2>
          <p className="text-ds-body-sm text-fg-muted mb-4">
            Gli eventi in cui la tua previsione ha la probabilità più alta di risultare corretta.
          </p>
          <ul className="flex flex-col gap-4" aria-label="Pronostici in vantaggio">
            {data.topInLead.map((event, idx) => (
              <li key={event.id}>
                <LandingEventRow event={event} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Categorie (solo quelle in cui hai previsto) */}
      <section ref={categoriesRef} className="scroll-mt-20 mb-10">
        <h2 className="discover-semititle text-center mb-6">
          Categorie
        </h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`category-box-item relative block rounded-3xl overflow-hidden border min-h-[100px] sm:min-h-[120px] text-left transition-all ${
                selectedCategory === null
                  ? "border-primary/50 bg-primary/10 shadow-glow-sm"
                  : "border-white/10 bg-white/5 hover:border-primary/20 hover:shadow-glow-sm"
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.45) 0%, rgba(139,92,246,0.35) 100%)",
                }}
              />
              <div className="relative flex flex-col justify-end p-4 h-full min-h-[100px] sm:min-h-[120px]">
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Tutti
                </span>
              </div>
            </button>
            {categories.map((category) => {
              const imagePath = getCategoryImagePath(category);
              const gradient = getCategoryGradient(category);
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`category-box-item relative block rounded-3xl overflow-hidden border min-h-[100px] sm:min-h-[120px] text-left transition-all ${
                    isSelected
                      ? "border-primary/50 bg-primary/10 shadow-glow-sm"
                      : "border-white/10 bg-white/5 hover:border-primary/20 hover:shadow-glow-sm"
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                    style={{
                      backgroundImage: imagePath ? `url(${imagePath})` : undefined,
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: imagePath
                        ? "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.58) 100%)"
                        : gradient,
                    }}
                  />
                  <div className="relative flex flex-col justify-end p-4 h-full min-h-[100px] sm:min-h-[120px]">
                    <span className="text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                      {category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-fg-muted text-ds-body-sm">
            Fai previsioni sugli eventi per vedere le categorie qui.
          </p>
        )}
      </section>

      {/* Lista eventi previsti (filtrata per categoria) */}
      {filteredEvents.length > 0 && (
        <section className="mb-10">
          <ul className="flex flex-col gap-4">
            {filteredEvents.map((event) => (
              <li key={event.id}>
                <LandingEventRow event={event} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA Torna a tutti gli eventi */}
      <section className="text-center pt-6 pb-8">
        <button
          type="button"
          onClick={onTornaATuttiGliEventi}
          className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm inline-flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Torna a tutti gli eventi
        </button>
      </section>

      {showCreateModal && (
        <CreateEventModal
          categories={categoriesFromPerTe}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
