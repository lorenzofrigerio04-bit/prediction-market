"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StreakBadge from "@/components/StreakBadge";
import StatsCard from "@/components/StatsCard";
import { trackView } from "@/lib/analytics-client";

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
  followedEventsCount?: number;
  followedEvents?: Array<{ id: string; title: string }>;
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
      trackView("PROFILE_VIEWED", { userId: session?.user?.id });
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
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento profilo...</p>
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
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0">
              {profileData.user.image ? (
                <img src={profileData.user.image} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                (profileData.user.name || profileData.user.email)[0].toUpperCase()
              )}
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-fg truncate">
                {profileData.user.name || "Utente"}
              </h1>
              <p className="text-fg-muted text-sm truncate">{profileData.user.email}</p>
              <p className="text-xs text-fg-subtle mt-1">Dal {formatDate(profileData.user.createdAt)}</p>
            </div>
            <StreakBadge streak={profileData.stats.streak} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
          <StatsCard title="Accuratezza" value={formatPercentage(profileData.stats.accuracy)} icon="🎯" color="blue" subtitle={`${profileData.stats.correctPredictions}/${profileData.stats.totalPredictions}`} />
          <StatsCard title="Crediti" value={formatAmount(profileData.stats.credits)} icon="💰" color="blue" subtitle={`+${formatAmount(profileData.stats.totalEarned)}`} elevated />
          <StatsCard title="ROI" value={`${profileData.stats.roi >= 0 ? "+" : ""}${formatPercentage(profileData.stats.roi)}`} icon="📈" color={profileData.stats.roi >= 0 ? "green" : "red"} subtitle="ROI" />
          <StatsCard title="Previsioni" value={profileData.stats.totalPredictions} icon="🔮" color="purple" subtitle={`${profileData.stats.activePredictions} attive`} />
        </div>

        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6 mb-6">
          <h2 className="text-lg font-bold text-fg mb-4">Badge</h2>
          {allBadges.length === 0 ? (
            <p className="text-fg-muted text-sm text-center py-6">
              Completa missioni e previsioni per sbloccare badge.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-opacity ${
                    badge.unlocked ? RARITY_COLORS[badge.rarity] || RARITY_COLORS.COMMON : "glass border-border dark:border-white/10 opacity-75"
                  }`}
                >
                  <div className="text-2xl mb-1 text-center">{badge.icon || "🏆"}</div>
                  <h3 className="font-semibold text-fg text-center text-sm mb-0.5">{badge.name}</h3>
                  <p className="text-[10px] text-fg-muted text-center line-clamp-2">{badge.description}</p>
                  {badge.unlocked && badge.unlockedAt ? (
                    <p className="text-[10px] text-fg-subtle text-center mt-1">Sbloccato</p>
                  ) : (
                    <p className="text-[10px] text-fg-subtle text-center italic mt-1">Bloccato</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6 mb-6">
          <h2 className="text-lg font-bold text-fg mb-4">Eventi seguiti</h2>
          {(profileData.followedEventsCount ?? 0) === 0 ? (
            <p className="text-fg-muted text-sm mb-3">
              Non segui ancora nessun evento.
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {(profileData.followedEvents ?? []).slice(0, 10).map((ev) => (
                  <li key={ev.id}>
                    <Link href={`/events/${ev.id}`} className="text-primary font-medium hover:underline line-clamp-2">
                      {ev.title}
                    </Link>
                  </li>
                ))}
              </ul>
              {(profileData.followedEventsCount ?? 0) > 10 && (
                <p className="text-fg-muted text-sm mt-3">e altri {(profileData.followedEventsCount ?? 0) - 10} eventi</p>
              )}
            </>
          )}
          <Link href="/discover" className="mt-2 inline-block text-primary font-semibold text-sm hover:underline">
            Scopri eventi →
          </Link>
        </div>

        <div className="mb-6">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl glass border border-border dark:border-white/10 text-fg hover:bg-surface/50 font-medium transition-colors"
          >
            <span aria-hidden>⚙️</span>
            Impostazioni
          </Link>
        </div>

        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6">
          <h2 className="text-lg font-bold text-fg mb-4">Le Mie Previsioni</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 mb-4 md:flex-wrap md:overflow-visible">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`shrink-0 min-h-[40px] px-4 py-2 rounded-2xl font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                  filter === btn.id ? "bg-primary text-white" : "glass text-fg-muted border border-border dark:border-white/10 hover:text-fg"
                }`}
              >
                {btn.label} {btn.count !== undefined && `(${btn.count})`}
              </button>
            ))}
          </div>

          {predictionsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              <p className="mt-2 text-fg-muted text-sm">Caricamento...</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8 text-fg-muted text-sm">
              <p>{filter === "all" ? "Nessuna previsione ancora." : `Nessuna previsione ${filter === "active" ? "attiva" : filter === "won" ? "vinta" : "persa"}.`}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => {
                const isWon = prediction.resolved && prediction.won === true;
                const isLost = prediction.resolved && prediction.won === false;
                return (
                  <div
                    key={prediction.id}
                    className={`p-4 rounded-2xl border transition-colors ${
                      isWon ? "bg-emerald-500/10 border-emerald-500/30" : isLost ? "bg-red-500/10 border-red-500/30" : "glass border-border dark:border-white/10 hover:border-primary/20"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span>{isWon ? "✅" : isLost ? "❌" : "⏳"}</span>
                          <h3 className="font-semibold text-fg line-clamp-2">{prediction.event.title}</h3>
                          <span className="px-2 py-0.5 text-xs bg-surface/50 rounded-xl text-fg-muted border border-border dark:border-white/10 shrink-0">{prediction.event.category}</span>
                        </div>
                        <p className="text-sm text-fg-muted">
                          {prediction.outcome === "YES" ? "SÌ" : "NO"} · {formatAmount(prediction.credits)} crediti
                          {prediction.resolved && prediction.payout !== null && (
                            <span className={isWon ? " text-emerald-500 dark:text-emerald-400 font-semibold" : " text-red-500 dark:text-red-400 font-semibold"}>
                              {" "}{isWon ? "+" : ""}{formatAmount(prediction.payout)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-fg-subtle mt-1">{formatDate(prediction.createdAt)}</p>
                      </div>
                      {prediction.resolved && (
                        <span className={`shrink-0 px-3 py-1 rounded-xl text-xs font-bold ${isWon ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/20 text-red-600 dark:text-red-400"}`}>
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
