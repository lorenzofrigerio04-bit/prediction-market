"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import LeaderboardRow from "@/components/LeaderboardRow";
import { trackView } from "@/lib/analytics-client";

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

  const getPeriodDescription = () => {
    switch (period) {
      case "weekly":
        return "Classifica degli ultimi 7 giorni";
      case "monthly":
        return "Classifica dell'ultimo mese";
      case "all-time":
        return "Classifica generale di tutti i tempi";
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-fg mb-1">🏆 Classifica</h1>
          <p className="text-fg-muted text-sm">{getPeriodDescription()}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="glass rounded-2xl border border-border dark:border-white/10 p-4 mb-6 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap md:overflow-visible">
            {periodButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setPeriod(btn.id)}
                className={`shrink-0 min-h-[44px] px-4 py-2 rounded-2xl font-semibold transition-colors ${
                  period === btn.id ? "bg-primary text-white" : "bg-surface/50 text-fg-muted hover:text-fg border border-border dark:border-white/10"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {categories.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-fg-muted uppercase tracking-wide block mb-2">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full md:w-auto min-h-[44px] px-4 py-2 rounded-2xl bg-surface/50 border border-border dark:border-white/10 text-fg font-medium"
              >
                <option value="">Tutte</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-8 md:p-12 text-center">
            <p className="text-fg-muted font-medium">Nessun dato per questo periodo.</p>
          </div>
        ) : (
          <div className="glass-elevated rounded-2xl p-4 md:p-6">
            {myRank != null && session?.user && (
              <div className="mb-4 p-3 rounded-xl bg-surface/50 border border-border dark:border-white/10 text-sm text-fg-muted">
                La tua posizione: <strong className="text-fg">#{myRank}</strong>
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
            <div className="mt-6 pt-4 border-t border-border dark:border-white/10 text-center text-sm text-fg-muted">
              <p>Totale: <strong className="text-fg">{leaderboard.length}</strong> utenti</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
