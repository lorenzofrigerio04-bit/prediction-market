"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { trackView } from "@/lib/analytics-client";
import StreakBadge from "@/components/StreakBadge";
import {
  PageHeader,
  SectionContainer,
  EmptyState,
  LoadingBlock,
} from "@/components/ui";
import {
  IconTarget,
  IconTrophy,
  IconGift,
  IconEye,
  IconClipboard,
  IconCheck,
} from "@/components/ui/Icons";
const DAILY_BONUS_BASE = 50;

interface Mission {
  id: string;
  missionId: string;
  name: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  period: string;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  periodStart: string;
}

interface MissionsResponse {
  missions: Mission[];
  daily: Mission[];
  weekly: Mission[];
  streak: number;
  bonusMultiplier: number;
}

const PERIOD_LABELS: Record<string, string> = {
  DAILY: "Giornaliera",
  WEEKLY: "Settimanale",
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MAKE_PREDICTIONS: IconTarget,
  WIN_PREDICTIONS: IconTrophy,
  DAILY_LOGIN: IconGift,
  FOLLOW_EVENTS: IconEye,
};

export default function MissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<MissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      trackView("MISSION_VIEWED");
      fetchMissions();
    }
  }, [status, router]);

  const fetchMissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/missions");
      if (!res.ok) throw new Error("Errore nel caricamento delle missioni");
      const json: MissionsResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Errore nel caricamento delle missioni");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("it-IT").format(n);

  const nextBonus =
    data != null
      ? Math.round(DAILY_BONUS_BASE * data.bonusMultiplier)
      : null;

  const allMissions = data
    ? [...data.daily, ...data.weekly]
    : [];
  const hasMissions = allMissions.length > 0;

  const MissionCard = ({ m }: { m: Mission }) => {
    const pct = m.target > 0 ? Math.min(100, (m.progress / m.target) * 100) : 0;
    const MissionTypeIcon = TYPE_ICONS[m.type] ?? IconClipboard;

    return (
      <div
        className={`rounded-xl border p-3 sm:p-4 transition-all duration-200 ${
          m.completed
            ? "border-white/10 bg-white/5 dark:bg-white/5"
            : "border-white/10 bg-surface/30 dark:bg-white/5 hover:border-primary/30"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${
              m.completed ? "bg-white/10 text-fg-muted" : "bg-primary/15 text-primary"
            }`}
            aria-hidden
          >
            {m.completed ? (
              <IconCheck className="w-5 h-5" />
            ) : (
              <MissionTypeIcon className="w-5 h-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-fg text-ds-body-sm truncate">
                {m.name}
              </h3>
              <span className="text-ds-micro font-medium uppercase tracking-wide text-fg-muted shrink-0">
                {PERIOD_LABELS[m.period] ?? m.period}
              </span>
            </div>
            {!m.completed && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 min-w-0 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-ds-micro font-medium text-fg-muted tabular-nums">
                  {m.progress}/{m.target}
                </span>
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-ds-body-sm font-bold text-primary font-numeric">
              +{formatAmount(m.reward)}
            </p>
            <p className="text-ds-micro text-fg-muted">crediti</p>
          </div>
        </div>
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
          <LoadingBlock message="Caricamento missioni..." />
        </main>
      </div>
    );
  }

  if (!session || !data) return null;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
        <PageHeader
          title="Missioni"
          description="Completa le missioni, mantieni la streak e guadagna crediti."
        />

        {/* Il tuo ritmo: mobile-first colonna, blocco opaco (niente sfondo che traspare) */}
        <SectionContainer>
          <div className="rounded-xl border border-white/10 bg-bg p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  <span className="text-xl">🔥</span>
                </div>
                <div className="min-w-0">
                  <p className="text-ds-micro font-semibold uppercase tracking-wide text-fg-muted">
                    La tua streak
                  </p>
                  {data.streak > 0 ? (
                    <StreakBadge streak={data.streak} size="sm" />
                  ) : (
                    <p className="text-ds-body font-bold text-fg">0 giorni</p>
                  )}
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:border-white/10 sm:pl-6 sm:pt-0">
                <p className="text-ds-micro font-semibold uppercase tracking-wide text-fg-muted">
                  Moltiplicatore
                </p>
                <p className="text-ds-h2 font-bold text-primary font-numeric">
                  ×{data.bonusMultiplier}
                </p>
              </div>
              <div className="border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:border-white/10 sm:pl-6 sm:pt-0">
                <p className="text-ds-body-sm text-fg-muted">
                  Prossimo bonus
                </p>
                <p className="text-ds-body font-bold text-fg font-numeric">
                  {nextBonus != null ? formatAmount(nextBonus) : "—"} crediti
                </p>
                <Link
                  href="/wallet"
                  className="text-ds-body-sm font-medium text-primary hover:underline mt-1 inline-block min-h-[44px] flex items-center ds-tap-target"
                >
                  Ritira nel Wallet →
                </Link>
              </div>
            </div>
          </div>
        </SectionContainer>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-ds-body-sm">
            {error}
          </div>
        )}

        {/* Una sola sezione Missioni */}
        <SectionContainer title="Missioni">
          {!hasMissions ? (
            <EmptyState
              description="Nessuna missione attiva. Torna domani per le giornaliere, lunedì per le settimanali."
              action={{ label: "Vai al Wallet", href: "/wallet" }}
            />
          ) : (
            <div className="space-y-2">
              {allMissions.map((m) => (
                <MissionCard key={m.id} m={m} />
              ))}
            </div>
          )}

          <p className="mt-4 text-ds-body-sm text-fg-muted">
            Le ricompense si accreditano al completamento. Ritira il bonus
            giornaliero dal{" "}
            <Link href="/wallet" className="text-primary hover:underline font-medium">
              Wallet
            </Link>{" "}
            per la missione login e per aumentare la streak.
          </p>

          <details className="mt-4 group">
            <summary className="text-ds-body-sm text-fg-muted cursor-pointer list-none inline-flex items-center gap-1.5 hover:text-fg">
              <span className="inline-flex w-5 h-5 items-center justify-center rounded-full border border-current text-ds-micro font-bold">
                ?
              </span>
              Come funziona
            </summary>
            <ul className="mt-3 space-y-1.5 text-ds-body-sm text-fg-muted pl-7">
              <li>
                <strong className="text-fg">Previsioni:</strong> scommetti sugli
                eventi per far avanzare le missioni.
              </li>
              <li>
                <strong className="text-fg">Vincite:</strong> contano per le
                missioni &quot;Vinci X previsioni&quot;.
              </li>
              <li>
                <strong className="text-fg">Segui:</strong> segui eventi per la
                missione &quot;Segui 3 categorie&quot;.
              </li>
              <li>
                <strong className="text-fg">Bonus:</strong> ritira il bonus nel
                Wallet per la missione login e per aumentare la streak (fino a
                ×2 in 10 giorni).
              </li>
            </ul>
          </details>
        </SectionContainer>
      </main>
    </div>
  );
}
