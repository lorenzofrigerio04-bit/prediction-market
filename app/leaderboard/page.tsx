"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import LeaderboardRow from "@/components/LeaderboardRow";

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
  totalPredictions: number;
  correctPredictions: number;
  totalEarned: number;
  totalSpent: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  period: PeriodType;
  totalUsers: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("all-time");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/leaderboard?period=${period}`);
      if (!response.ok) throw new Error("Errore nel caricamento della classifica");
      const data: LeaderboardResponse = await response.json();
      setLeaderboard(data.leaderboard);
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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">🏆 Classifica</h1>
          <p className="text-slate-600 text-sm">{getPeriodDescription()}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap md:overflow-visible">
            {periodButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setPeriod(btn.id)}
                className={`shrink-0 min-h-[44px] px-4 py-2 rounded-xl font-semibold transition-colors ${
                  period === btn.id ? "bg-accent-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-accent-500 border-t-transparent" />
            <p className="mt-4 text-slate-600 font-medium">Caricamento...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 md:p-12 text-center">
            <p className="text-slate-600 mb-2">Nessun utente in classifica</p>
            <p className="text-slate-500 text-sm">Fai previsioni per apparire qui!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 md:p-6">
            <div className="hidden md:grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-slate-100">
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase">Pos.</div>
              <div className="col-span-4 text-xs font-semibold text-slate-500 uppercase">Utente</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase text-center">Accur.</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase text-center">ROI</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase text-center">Streak</div>
            </div>
            <div className="space-y-2">
              {leaderboard.map((user) => (
                <LeaderboardRow
                  key={user.id}
                  rank={user.rank}
                  user={{ id: user.id, name: user.name, email: user.email, image: user.image }}
                  accuracy={user.accuracy}
                  roi={user.roi}
                  streak={user.streak}
                  totalPredictions={user.totalPredictions}
                  correctPredictions={user.correctPredictions}
                  isCurrentUser={session?.user?.id === user.id}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-sm text-slate-500">
              <p>Totale: <strong>{leaderboard.length}</strong> utenti</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
