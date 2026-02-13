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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Classifica
          </h1>
          <p className="text-gray-600">{getPeriodDescription()}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Period Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Periodo:</span>
            {periodButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setPeriod(btn.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === btn.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Caricamento classifica...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">
              Nessun utente nella classifica
            </p>
            <p className="text-gray-500 text-sm">
              Inizia a fare previsioni per apparire in classifica!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-gray-200">
              <div className="col-span-2 text-sm font-semibold text-gray-700">
                Posizione
              </div>
              <div className="col-span-4 text-sm font-semibold text-gray-700">
                Utente
              </div>
              <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">
                Accuratezza
              </div>
              <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">
                ROI
              </div>
              <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">
                Streak
              </div>
            </div>

            {/* Leaderboard Rows */}
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <LeaderboardRow
                  key={user.id}
                  rank={user.rank}
                  user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                  }}
                  accuracy={user.accuracy}
                  roi={user.roi}
                  streak={user.streak}
                  totalPredictions={user.totalPredictions}
                  correctPredictions={user.correctPredictions}
                  isCurrentUser={session?.user?.id === user.id}
                />
              ))}
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>
                Totale utenti in classifica: <strong>{leaderboard.length}</strong>
              </p>
              <p className="mt-1 text-xs">
                La classifica è calcolata in base a accuratezza, ROI e streak
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
