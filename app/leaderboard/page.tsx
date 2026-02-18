"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import LeaderboardRow from "@/components/LeaderboardRow";
import { trackView } from "@/lib/analytics-client";
import {
  PageHeader,
  SectionContainer,
  Card,
  FilterChips,
  EmptyState,
  LoadingBlock,
} from "@/components/ui";

type PeriodType = "weekly" | "monthly" | "all-time";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  accuracy: number;
  roi: number;
  streak: number;
  score: number;
  totalPredictions: number;
  correctPredictions: number;
  totalEarned: number;
  totalSpent: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  period: PeriodType;
  category: string | null;
  totalUsers: number;
  myRank?: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("all-time");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [myRank, setMyRank] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackView("LEADERBOARD_VIEWED");
  }, []);

  useEffect(() => {
    fetch("/api/events/categories")
      .then((r) => r.ok && r.json())
      .then((d) => d?.categories && setCategories(d.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, category]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period });
      if (category) params.set("category", category);
      const response = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!response.ok) throw new Error("Errore nel caricamento della classifica");
      const data: LeaderboardResponse = await response.json();
      setLeaderboard(data.leaderboard);
      setMyRank(data.myRank);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Errore nel caricamento della classifica");
    } finally {
      setLoading(false);
    }
  };

  const periodButtons: Array<{ id: PeriodType; label: string }> = [
    { id: "weekly", label: "Settimanale" },
    { id: "monthly", label: "Mensile" },
    { id: "all-time", label: "Tutti i tempi" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
        <PageHeader
          title="Classifica"
          description="Sali in classifica prevedendo bene."
        />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-ds-body-sm">
            {error}
          </div>
        )}

        <SectionContainer>
          <Card neon className="p-4 mb-6 space-y-4">
            <FilterChips
              options={periodButtons.map((b) => ({ id: b.id, label: b.label }))}
              value={period}
              onChange={setPeriod}
            />
            {categories.length > 0 && (
              <div>
                <label className="text-ds-caption font-semibold text-fg-muted uppercase tracking-wide block mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full md:w-auto min-h-[44px] px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-fg font-medium ds-tap-target input-neon-focus"
                >
                  <option value="">Tutte</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </Card>
        </SectionContainer>

        {loading ? (
          <LoadingBlock message="Caricamento…" />
        ) : leaderboard.length === 0 ? (
          <EmptyState description="Nessun dato per questo periodo." />
        ) : (
          <Card neon elevated className="p-4 md:p-6">
            {myRank != null && session?.user && (
              <div className="mb-4 p-3 rounded-xl pill-credits-neon text-sm text-white/90">
                La tua posizione: <strong className="text-white">#{myRank}</strong>
              </div>
            )}
            <div className="hidden md:grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-border dark:border-white/10">
              <div className="col-span-2 text-xs font-semibold text-fg-muted uppercase">Posizione</div>
              <div className="col-span-4 text-xs font-semibold text-fg-muted uppercase">Utente</div>
              <div className="col-span-2 text-xs font-semibold text-fg-muted uppercase text-center">Accuratezza %</div>
              <div className="col-span-2 text-xs font-semibold text-fg-muted uppercase text-center">Serie</div>
              <div className="col-span-2 text-xs font-semibold text-fg-muted uppercase text-center" title="Punteggio basato su previsioni corrette e consistenza.">Punteggio</div>
            </div>
            <div className="space-y-2">
              {leaderboard.map((user) => (
                <LeaderboardRow
                  key={user.id}
                  rank={user.rank}
                  user={{ id: user.id, name: user.name, email: user.email, image: user.image }}
                  accuracy={user.accuracy}
                  score={user.score}
                  streak={user.streak}
                  totalPredictions={user.totalPredictions}
                  correctPredictions={user.correctPredictions}
                  isCurrentUser={session?.user?.id === user.id}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border dark:border-white/10 text-center text-ds-body-sm text-fg-muted">
              <p>Totale: <strong className="text-fg">{leaderboard.length}</strong> utenti</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
