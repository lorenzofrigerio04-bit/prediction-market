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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Caricamento profilo...</p>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {profileData.user.image ? (
                <img
                  src={profileData.user.image}
                  alt={profileData.user.name || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (profileData.user.name || profileData.user.email)[0].toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {profileData.user.name || "Utente"}
              </h1>
              <p className="text-gray-600 mb-2">{profileData.user.email}</p>
              <p className="text-sm text-gray-500">
                Membro dal {formatDate(profileData.user.createdAt)}
              </p>
            </div>
            <div className="flex items-center">
              <StreakBadge streak={profileData.stats.streak} size="lg" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Accuratezza"
            value={formatPercentage(profileData.stats.accuracy)}
            icon="🎯"
            color="blue"
            subtitle={`${profileData.stats.correctPredictions} su ${profileData.stats.totalPredictions} previsioni`}
          />
          <StatsCard
            title="Crediti Totali"
            value={formatAmount(profileData.stats.credits)}
            icon="💰"
            color="green"
            subtitle={`${formatAmount(profileData.stats.totalEarned)} guadagnati`}
          />
          <StatsCard
            title="ROI"
            value={`${profileData.stats.roi >= 0 ? "+" : ""}${formatPercentage(profileData.stats.roi)}`}
            icon="📈"
            color={profileData.stats.roi >= 0 ? "green" : "red"}
            subtitle="Return on Investment"
          />
          <StatsCard
            title="Previsioni Totali"
            value={profileData.stats.totalPredictions}
            icon="🔮"
            color="purple"
            subtitle={`${profileData.stats.activePredictions} attive`}
          />
        </div>

        {/* Badges Section - tutti i badge (sbloccati e bloccati) */}
        {allBadges.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Badge e Achievement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 transition-opacity ${
                    badge.unlocked
                      ? RARITY_COLORS[badge.rarity] || RARITY_COLORS.COMMON
                      : "bg-gray-100 border-gray-200 opacity-75"
                  }`}
                >
                  <div className="text-3xl mb-2 text-center">
                    {badge.icon || "🏆"}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-center mb-1">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-600 text-center mb-2">
                    {badge.description}
                  </p>
                  {badge.unlocked && badge.unlockedAt ? (
                    <p className="text-xs text-gray-500 text-center">
                      Sbloccato il {formatDate(badge.unlockedAt)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 text-center italic">
                      Non ancora sbloccato
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predictions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Le Mie Previsioni</h2>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                  filter === btn.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {btn.label}
                {btn.count !== undefined && (
                  <span className="ml-2 text-sm opacity-75">({btn.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Predictions List */}
          {predictionsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 text-sm">Caricamento previsioni...</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessuna previsione trovata.</p>
              <p className="text-sm mt-2">
                {filter === "all"
                  ? "Inizia a fare previsioni per vedere la tua storia qui!"
                  : `Nessuna previsione ${filter === "active" ? "attiva" : filter === "won" ? "vinta" : "persa"}.`}
              </p>
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
                    className={`p-4 border rounded-lg transition-colors ${
                      isWon
                        ? "bg-green-50 border-green-200"
                        : isLost
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {isWon ? "✅" : isLost ? "❌" : "⏳"}
                          </span>
                          <h3 className="font-semibold text-gray-900">
                            {prediction.event.title}
                          </h3>
                          <span className="px-2 py-1 text-xs bg-gray-200 rounded-full text-gray-700">
                            {prediction.event.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            Previsione:{" "}
                            <span className="font-medium">
                              {prediction.outcome === "YES" ? "SÌ" : "NO"}
                            </span>
                          </span>
                          <span>
                            Investiti:{" "}
                            <span className="font-medium">
                              {formatAmount(prediction.credits)} crediti
                            </span>
                          </span>
                          {prediction.resolved && prediction.payout !== null && (
                            <span
                              className={`font-semibold ${
                                isWon ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isWon ? "+" : ""}
                              {formatAmount(prediction.payout)} crediti
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Creata il {formatDate(prediction.createdAt)}
                          {prediction.resolvedAt &&
                            ` • Risolta il ${formatDate(prediction.resolvedAt)}`}
                        </p>
                        {isActive && (
                          <p className="text-xs text-orange-600 mt-1">
                            Chiusura previsioni: {formatDate(prediction.event.closesAt)}
                          </p>
                        )}
                      </div>
                      {prediction.resolved && (
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isWon
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {isWon ? "VINTA" : "PERSA"}
                        </div>
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
