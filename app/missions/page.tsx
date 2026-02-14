"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { trackView } from "@/lib/analytics-client";

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

  const MissionCard = ({ m }: { m: Mission }) => {
    const pct = m.target > 0 ? Math.min(100, (m.progress / m.target) * 100) : 0;
    const icon = TYPE_ICONS[m.type] ?? "📋";
    return (
      <div
        className={`rounded-2xl border p-4 md:p-5 transition-colors ${
          m.completed
            ? "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15"
            : "glass border-border dark:border-white/10 hover:border-primary/20"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex gap-3 min-w-0">
            <span className="text-2xl md:text-3xl shrink-0">{icon}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-fg">{m.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-xl bg-surface/50 text-fg-muted border border-border dark:border-white/10">
                  {PERIOD_LABELS[m.period] ?? m.period}
                </span>
              </div>
              <p className="text-sm text-fg-muted mt-0.5">{m.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 min-w-0 h-2.5 bg-surface/50 rounded-full overflow-hidden max-w-[160px] border border-border dark:border-white/10">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-fg-muted shrink-0">
                  {m.progress}/{m.target}
                </span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0 flex sm:block items-center justify-between sm:block">
            <p className="text-lg font-bold text-primary">+{formatAmount(m.reward)}</p>
            <p className="text-xs text-fg-muted">crediti</p>
            {m.completed && (
              <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">✓ Completata</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento missioni...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session || !data) return null;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-fg mb-1">Missioni</h1>
          <p className="text-fg-muted text-sm md:text-base">
            Completa le missioni per crediti extra. Giornaliere a mezzanotte, settimanali il lunedì.
          </p>
        </div>

        {/* Card streak e moltiplicatore bonus */}
        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Serie</p>
              <p className="text-2xl font-bold text-fg">{[data.streak]} giorni</p>
            </div>
            <div className="h-8 w-px bg-border dark:bg-white/10" />
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Moltiplicatore bonus</p>
              <p className="text-2xl font-bold text-primary">x{data.bonusMultiplier}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {data.daily.length === 0 && data.weekly.length === 0 ? (
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-8 md:p-12 text-center">
            <p className="text-fg-muted font-medium">Nessuna missione attiva. Torna domani.</p>
          </div>
        ) : (
          <>
            <section className="mb-6">
              <h2 className="text-base font-bold text-fg mb-3 flex items-center gap-2">
                <span>📅</span> Giornaliere
              </h2>
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

            <section className="mb-6">
              <h2 className="text-base font-bold text-fg mb-3 flex items-center gap-2">
                <span>📆</span> Settimanali
              </h2>
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

        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5">
          <h2 className="text-base font-bold text-fg mb-2">Come funziona</h2>
          <ul className="text-fg-muted space-y-2 text-sm">
            <li>· <strong className="text-fg">Previsioni:</strong> scommetti sugli eventi per avanzare.</li>
            <li>· <strong className="text-fg">Vincite:</strong> conta per le missioni &quot;Vinci X previsioni&quot;.</li>
            <li>· <strong className="text-fg">Bonus:</strong> riscatta il bonus nel <Link href="/wallet" className="text-primary hover:underline font-semibold">Wallet</Link>.</li>
            <li>· Ricompense accreditate al completamento.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
