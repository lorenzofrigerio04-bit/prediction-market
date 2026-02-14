"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { trackView } from "@/lib/analytics-client";
import {
  PageHeader,
  SectionContainer,
  Card,
  EmptyState,
  LoadingBlock,
  Badge,
} from "@/components/ui";

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

const TYPE_ICONS: Record<string, string> = {
  MAKE_PREDICTIONS: "🎯",
  WIN_PREDICTIONS: "🏆",
  DAILY_LOGIN: "🎁",
  FOLLOW_EVENTS: "👁",
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

  const exampleBonus = data
    ? Math.round(DAILY_BONUS_BASE * data.bonusMultiplier)
    : null;

  const MissionCard = ({ m }: { m: Mission }) => {
    const pct = m.target > 0 ? Math.min(100, (m.progress / m.target) * 100) : 0;
    const icon = TYPE_ICONS[m.type] ?? "📋";
    const statusLabel = m.completed ? "Completata" : "In corso";

    return (
      <div
        className={`rounded-2xl border p-4 md:p-5 transition-all duration-200 ${
          m.completed
            ? "border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/15"
            : "glass border-border dark:border-white/10 hover:border-primary/20"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex gap-3 min-w-0">
            <span
              className={`text-2xl md:text-3xl shrink-0 ${m.completed ? "opacity-80" : ""}`}
              aria-hidden
            >
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-fg">{m.name}</h3>
                <Badge variant="default">{PERIOD_LABELS[m.period] ?? m.period}</Badge>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    m.completed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-fg-muted"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-fg-muted mt-0.5">{m.description}</p>
              {!m.completed && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0 h-2.5 bg-surface/50 rounded-full overflow-hidden max-w-[180px] border border-border dark:border-white/10">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-fg-muted shrink-0">
                    {m.progress}/{m.target}
                  </span>
                </div>
              )}
              {m.completed && (
                <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span aria-hidden>✓</span> Completata — +{formatAmount(m.reward)} crediti
                </p>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0 flex sm:block items-center justify-between sm:block">
            <div>
              <p className="text-lg font-bold text-primary">+{formatAmount(m.reward)}</p>
              <p className="text-xs text-fg-muted">crediti</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
          <LoadingBlock message="Caricamento missioni..." />
        </main>
      </div>
    );
  }

  if (!session || !data) return null;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
        <PageHeader
          title="Missioni"
          description="Un motivo in più per tornare domani: completa le missioni, mantieni la serie e guadagna crediti extra."
        />

        {/* Card: Moltiplicatore bonus + esempio */}
        <SectionContainer>
          <Card className="p-5 overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-ds-label uppercase tracking-wide text-fg-muted font-semibold mb-1">
                  Moltiplicatore bonus
                </h2>
                <p className="text-ds-body-sm text-fg-muted mb-3 max-w-md">
                  Più giorni consecutivi ritiri il bonus giornaliero, più alto è il moltiplicatore applicato ai crediti del giorno dopo.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-ds-caption text-fg-muted uppercase tracking-wide">La tua serie</p>
                    <p className="text-ds-h1 font-bold text-fg">{data.streak} giorni</p>
                  </div>
                  <div className="h-10 w-px bg-border dark:bg-white/10" aria-hidden />
                  <div>
                    <p className="text-ds-caption text-fg-muted uppercase tracking-wide">Moltiplicatore</p>
                    <p className="text-ds-h1 font-bold text-primary">×{data.bonusMultiplier}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 p-4 min-w-[200px]">
                <p className="text-ds-caption font-semibold text-fg-muted uppercase tracking-wide mb-1">
                  Esempio
                </p>
                <p className="text-ds-body-sm text-fg mb-0.5">
                  Con la tua serie attuale, il prossimo bonus giornaliero vale:
                </p>
                <p className="text-xl font-bold text-primary">
                  {formatAmount(DAILY_BONUS_BASE)} × {data.bonusMultiplier} = {exampleBonus != null ? formatAmount(exampleBonus) : "—"} crediti
                </p>
                <p className="text-ds-micro text-fg-muted mt-2">
                  Fino a ×2 (10 giorni consecutivi). Ritira dal <Link href="/wallet" className="text-primary hover:underline font-medium">Wallet</Link>.
                </p>
              </div>
            </div>
          </Card>
        </SectionContainer>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-ds-body-sm">
            {error}
          </div>
        )}

        {data.daily.length === 0 && data.weekly.length === 0 ? (
          <EmptyState description="Nessuna missione attiva. Torna domani per nuove missioni giornaliere e settimanali." />
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-base font-bold text-fg mb-1 flex items-center gap-2">
                <span>📅</span> Missioni giornaliere
              </h2>
              <p className="text-ds-body-sm text-fg-muted mb-3">
                Si resettano a mezzanotte. Reward più piccoli, da completare ogni giorno.
              </p>
              {data.daily.length === 0 ? (
                <p className="text-fg-muted text-sm">Nessuna missione giornaliera.</p>
              ) : (
                <div className="space-y-3">
                  {data.daily.map((m) => (
                    <MissionCard key={m.id} m={m} />
                  ))}
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="text-base font-bold text-fg mb-1 flex items-center gap-2">
                <span>📆</span> Missioni settimanali
              </h2>
              <p className="text-ds-body-sm text-fg-muted mb-3">
                Si resettano il lunedì. Reward più alti, obiettivi da portare a termine in sette giorni.
              </p>
              {data.weekly.length === 0 ? (
                <p className="text-fg-muted text-sm">Nessuna missione settimanale.</p>
              ) : (
                <div className="space-y-3">
                  {data.weekly.map((m) => (
                    <MissionCard key={m.id} m={m} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <Card className="p-5">
          <h2 className="text-ds-h2 font-bold text-fg mb-2">Come funziona</h2>
          <ul className="text-fg-muted space-y-2 text-ds-body-sm">
            <li>· <strong className="text-fg">Previsioni:</strong> scommetti sugli eventi per far avanzare le missioni.</li>
            <li>· <strong className="text-fg">Vincite:</strong> contano per le missioni &quot;Vinci X previsioni&quot;.</li>
            <li>· <strong className="text-fg">Segui:</strong> segui eventi per la missione &quot;Segui 3 categorie&quot;.</li>
            <li>· <strong className="text-fg">Bonus:</strong> ritira il bonus nel <Link href="/wallet" className="text-primary hover:underline font-semibold">Wallet</Link> per la missione login e per aumentare la serie.</li>
            <li>· Le ricompense vengono accreditate al completamento.</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
