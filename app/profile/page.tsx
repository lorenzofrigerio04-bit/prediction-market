"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import StreakBadge from "@/components/StreakBadge";
import StatsCard from "@/components/StatsCard";

interface ProfileStats {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  stats: {
    credits: number;
    totalEarned: number;
    totalSpent: number;
    streak: number;
    accuracy: number;
    totalPredictions: number;
    correctPredictions: number;
    activePredictions: number;
    wonPredictions: number;
    lostPredictions: number;
    roi: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string | null;
    rarity: string;
    unlockedAt: string;
  }>;
}

interface BadgeFromApi {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  rarity: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface Prediction {
  id: string;
  outcome: string;
  credits: number;
  resolved: boolean;
  won: boolean | null;
  payout: number | null;
  createdAt: string;
  resolvedAt: string | null;
  event: {
    id: string;
    title: string;
    category: string;
    resolved: boolean;
    outcome: string | null;
    closesAt: string;
    resolvedAt: string | null;
  };
}

interface PredictionsResponse {
  predictions: Prediction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

type FilterType = "all" | "active" | "won" | "lost";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "bg-gray-100 border-gray-300",
  RARE: "bg-blue-100 border-blue-300",
  EPIC: "bg-purple-100 border-purple-300",
  LEGENDARY: "bg-yellow-100 border-yellow-400",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileStats | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [error, setError] = useState<string | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeFromApi[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfileData();
      fetchPredictions();
      fetchAllBadges();
    }
  }, [status, router, filter]);

  const fetchAllBadges = async () => {
    try {
      const res = await fetch("/api/badges");
      if (res.ok) {
        const data = await res.json();
        setAllBadges(data.badges ?? []);
      }
    } catch {
      // ignore
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/stats");
      if (!response.ok) throw new Error("Errore nel caricamento del profilo");
      const data: ProfileStats = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Errore nel caricamento dei dati del profilo");
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    setPredictionsLoading(true);
    try {
      const response = await fetch(`/api/profile/predictions?filter=${filter}&limit=50`);
      if (!response.ok) throw new Error("Errore nel caricamento delle previsioni");
      const data: PredictionsResponse = await response.json();
      setPredictions(data.predictions);
    } catch (err) {
      console.error("Error fetching predictions:", err);
    } finally {
      setPredictionsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("it-IT").format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-accent-500 border-t-transparent" />
            <p className="mt-4 text-slate-600 font-medium">Caricamento profilo...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session || !profileData) {
    return null;
  }

  const filterButtons: Array<{ id: FilterType; label: string; count?: number }> = [
    { id: "all", label: "Tutte", count: profileData.stats.totalPredictions },
    { id: "active", label: "Attive", count: profileData.stats.activePredictions },
    { id: "won", label: "Vinte", count: profileData.stats.wonPredictions },
    { id: "lost", label: "Perse", count: profileData.stats.lostPredictions },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0">
              {profileData.user.image ? (
                <img src={profileData.user.image} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                (profileData.user.name || profileData.user.email)[0].toUpperCase()
              )}
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
                {profileData.user.name || "Utente"}
              </h1>
              <p className="text-slate-600 text-sm truncate">{profileData.user.email}</p>
              <p className="text-xs text-slate-500 mt-1">Dal {formatDate(profileData.user.createdAt)}</p>
            </div>
            <StreakBadge streak={profileData.stats.streak} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
          <StatsCard title="Accuratezza" value={formatPercentage(profileData.stats.accuracy)} icon="🎯" color="blue" subtitle={`${profileData.stats.correctPredictions}/${profileData.stats.totalPredictions}`} />
          <StatsCard title="Crediti" value={formatAmount(profileData.stats.credits)} icon="💰" color="green" subtitle={`+${formatAmount(profileData.stats.totalEarned)}`} />
          <StatsCard title="ROI" value={`${profileData.stats.roi >= 0 ? "+" : ""}${formatPercentage(profileData.stats.roi)}`} icon="📈" color={profileData.stats.roi >= 0 ? "green" : "red"} subtitle="ROI" />
          <StatsCard title="Previsioni" value={profileData.stats.totalPredictions} icon="🔮" color="purple" subtitle={`${profileData.stats.activePredictions} attive`} />
        </div>

        {allBadges.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 md:p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Badge</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border-2 transition-opacity ${
                    badge.unlocked ? RARITY_COLORS[badge.rarity] || RARITY_COLORS.COMMON : "bg-slate-100 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="text-2xl mb-1 text-center">{badge.icon || "🏆"}</div>
                  <h3 className="font-semibold text-slate-900 text-center text-sm mb-0.5">{badge.name}</h3>
                  <p className="text-[10px] text-slate-600 text-center line-clamp-2">{badge.description}</p>
                  {badge.unlocked && badge.unlockedAt ? (
                    <p className="text-[10px] text-slate-500 text-center mt-1">Sbloccato</p>
                  ) : (
                    <p className="text-[10px] text-slate-400 text-center italic mt-1">Bloccato</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 md:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Le Mie Previsioni</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 mb-4 md:flex-wrap md:overflow-visible">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`shrink-0 min-h-[40px] px-4 py-2 rounded-xl font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 ${
                  filter === btn.id ? "bg-accent-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {btn.label} {btn.count !== undefined && `(${btn.count})`}
              </button>
            ))}
          </div>

          {predictionsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent" />
              <p className="mt-2 text-slate-600 text-sm">Caricamento...</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p>{filter === "all" ? "Nessuna previsione ancora." : `Nessuna previsione ${filter === "active" ? "attiva" : filter === "won" ? "vinta" : "persa"}.`}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => {
                const isWon = prediction.resolved && prediction.won === true;
                const isLost = prediction.resolved && prediction.won === false;
                const isActive = !prediction.resolved;
                return (
                  <div
                    key={prediction.id}
                    className={`p-4 rounded-2xl border-2 transition-colors ${
                      isWon ? "bg-emerald-50 border-emerald-200" : isLost ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span>{isWon ? "✅" : isLost ? "❌" : "⏳"}</span>
                          <h3 className="font-semibold text-slate-900 line-clamp-2">{prediction.event.title}</h3>
                          <span className="px-2 py-0.5 text-xs bg-slate-200 rounded-lg text-slate-700 shrink-0">{prediction.event.category}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {prediction.outcome === "YES" ? "SÌ" : "NO"} · {formatAmount(prediction.credits)} crediti
                          {prediction.resolved && prediction.payout !== null && (
                            <span className={isWon ? " text-emerald-600 font-semibold" : " text-red-600 font-semibold"}>
                              {" "}{isWon ? "+" : ""}{formatAmount(prediction.payout)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{formatDate(prediction.createdAt)}</p>
                      </div>
                      {prediction.resolved && (
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${isWon ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"}`}>
                          {isWon ? "VINTA" : "PERSA"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
