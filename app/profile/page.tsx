"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StreakBadge from "@/components/StreakBadge";
import StatsCard from "@/components/StatsCard";
import { trackView } from "@/lib/analytics-client";
import {
  SectionContainer,
  Card,
  FilterChips,
  LoadingBlock,
} from "@/components/ui";

interface ProfileStats {
  user: {
    id: string;
    name: string | null;
    username: string | null;
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

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

function validateUsernameClient(value: string): string | null {
  const t = value.trim();
  if (t.length === 0) return "Inserisci un username";
  if (t.length < USERNAME_MIN) return `Almeno ${USERNAME_MIN} caratteri`;
  if (t.length > USERNAME_MAX) return `Massimo ${USERNAME_MAX} caratteri`;
  if (!USERNAME_REGEX.test(t)) return "Solo lettere, numeri e underscore";
  return null;
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: "bg-gray-100 border-gray-300 dark:bg-gray-800/50 dark:border-gray-600",
  RARE: "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-500",
  EPIC: "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-500",
  LEGENDARY: "bg-yellow-100 border-yellow-400 dark:bg-amber-900/30 dark:border-amber-500",
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

  // Username edit
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSaving, setUsernameSaving] = useState(false);

  const displayName = profileData?.user?.username?.trim() || profileData?.user?.name?.trim() || "Utente";

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/stats");
      if (!response.ok) throw new Error("Errore nel caricamento del profilo");
      const data: ProfileStats = await response.json();
      setProfileData(data);
      setUsernameInput(data.user.username?.trim() ?? "");
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Errore nel caricamento dei dati del profilo");
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [status, router, session?.user?.id]);

  const fetchPredictions = useCallback(async () => {
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
  }, [filter]);

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

  useEffect(() => {
    if (status === "authenticated") fetchPredictions();
  }, [status, filter, fetchPredictions]);

  const saveUsername = async () => {
    const err = validateUsernameClient(usernameInput);
    if (err) {
      setUsernameError(err);
      return;
    }
    setUsernameError(null);
    setUsernameSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUsernameError(data.error || "Errore nel salvataggio");
        return;
      }
      setProfileData((prev) =>
        prev ? { ...prev, user: { ...prev.user, username: data.username ?? usernameInput.trim() } } : null
      );
      setEditingUsername(false);
    } catch {
      setUsernameError("Errore di connessione");
    } finally {
      setUsernameSaving(false);
    }
  };

  const cancelUsernameEdit = () => {
    setEditingUsername(false);
    setUsernameInput(profileData?.user?.username?.trim() ?? "");
    setUsernameError(null);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatAmount = (amount: number) => new Intl.NumberFormat("it-IT").format(amount);
  const formatPercentage = (value: number) => `${Math.round(value * 100) / 100}%`;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
          <LoadingBlock message="Caricamento profilo..." />
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
      <main className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-ds-body-sm">
            {error}
          </div>
        )}

        {/* ——— Identità e status ——— */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary to-accent-700 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shrink-0 overflow-hidden">
              {profileData.user.image ? (
                <img src={profileData.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                (displayName[0] || "?").toUpperCase()
              )}
            </div>

            <div className="mt-4 w-full max-w-xs">
              {editingUsername ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setUsernameError(validateUsernameClient(e.target.value));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveUsername();
                      if (e.key === "Escape") cancelUsernameEdit();
                    }}
                    placeholder="Username"
                    className="w-full px-4 py-2 rounded-xl border border-border dark:border-white/20 bg-bg text-fg text-center font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                    disabled={usernameSaving}
                    aria-label="Username"
                  />
                  {usernameError && (
                    <p className="text-sm text-red-500 dark:text-red-400" role="alert">
                      {usernameError}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={cancelUsernameEdit}
                      className="px-4 py-2 rounded-xl text-fg-muted hover:bg-surface/50 transition-colors text-sm font-medium"
                      disabled={usernameSaving}
                    >
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={saveUsername}
                      className="px-4 py-2 rounded-xl bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                      disabled={usernameSaving}
                    >
                      {usernameSaving ? "Salvataggio…" : "Salva"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput(profileData.user.username?.trim() ?? "");
                    setEditingUsername(true);
                    setUsernameError(null);
                  }}
                  className="inline-flex items-center gap-2 group"
                  aria-label="Modifica username"
                >
                  <h1 className="text-xl md:text-2xl font-bold text-fg truncate max-w-[200px] md:max-w-none">
                    {displayName}
                  </h1>
                  <span className="text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity text-sm" aria-hidden>
                    ✏️
                  </span>
                </button>
              )}
            </div>

            <p className="text-fg-muted text-sm mt-1">Membro dal {formatDate(profileData.user.createdAt)}</p>
            <div className="mt-3">
              <StreakBadge streak={profileData.stats.streak} size="lg" />
            </div>
          </div>
        </Card>

        {/* ——— Statistiche ——— */}
        <SectionContainer title="Statistiche">
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <StatsCard
              title="Accuratezza"
              value={formatPercentage(profileData.stats.accuracy)}
              icon="🎯"
              color="blue"
              subtitle={`${profileData.stats.correctPredictions}/${profileData.stats.totalPredictions}`}
            />
            <StatsCard
              title="Crediti"
              value={formatAmount(profileData.stats.credits)}
              icon="💰"
              color="blue"
              subtitle={`+${formatAmount(profileData.stats.totalEarned)} guadagnati`}
              elevated
            />
            <StatsCard
              title="ROI"
              value={`${profileData.stats.roi >= 0 ? "+" : ""}${formatPercentage(profileData.stats.roi)}`}
              icon="📈"
              color={profileData.stats.roi >= 0 ? "green" : "red"}
              subtitle="Ritorno investimento"
            />
            <StatsCard
              title="Previsioni"
              value={profileData.stats.totalPredictions}
              icon="🔮"
              color="purple"
              subtitle={`${profileData.stats.activePredictions} attive`}
            />
          </div>
        </SectionContainer>

        {/* ——— Impostazioni (un solo blocco ordinato) ——— */}
        <SectionContainer title="Impostazioni">
          <Card className="p-5 md:p-6">
            <ul className="space-y-0 divide-y divide-border dark:divide-white/10">
              <li>
                <Link
                  href="/settings"
                  className="flex items-center justify-between py-4 text-fg hover:text-primary transition-colors ds-tap-target"
                >
                  <span className="font-medium">Account e preferenze</span>
                  <span className="text-fg-muted" aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="flex items-center justify-between py-4 text-fg-muted hover:text-fg transition-colors ds-tap-target"
                >
                  <span>Termini di servizio</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="flex items-center justify-between py-4 text-fg-muted hover:text-fg transition-colors ds-tap-target"
                >
                  <span>Privacy policy</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/content-rules"
                  className="flex items-center justify-between py-4 text-fg-muted hover:text-fg transition-colors ds-tap-target"
                >
                  <span>Regole contenuti</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/credits"
                  className="flex items-center justify-between py-4 text-fg-muted hover:text-fg transition-colors ds-tap-target"
                >
                  <span>Disclaimer crediti</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </Card>
        </SectionContainer>

        {/* ——— Badge ——— */}
        <SectionContainer title="Badge">
          <Card className="p-5 md:p-6">
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
                      badge.unlocked ? RARITY_COLORS[badge.rarity] ?? RARITY_COLORS.COMMON : "glass border-border dark:border-white/10 opacity-75"
                    }`}
                  >
                    <div className="text-2xl mb-1 text-center">{badge.icon || "🏆"}</div>
                    <h3 className="font-semibold text-fg text-center text-sm mb-0.5">{badge.name}</h3>
                    <p className="text-[10px] text-fg-muted text-center line-clamp-2">{badge.description}</p>
                    <p className="text-[10px] text-fg-subtle text-center mt-1">
                      {badge.unlocked && badge.unlockedAt ? "Sbloccato" : "Bloccato"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </SectionContainer>

        {/* ——— Eventi seguiti ——— */}
        <SectionContainer title="Eventi seguiti">
          <Card className="p-5 md:p-6">
            {(profileData.followedEventsCount ?? 0) === 0 ? (
              <p className="text-fg-muted text-sm mb-3">Non segui ancora nessun evento.</p>
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
            <Link href="/discover" className="mt-3 inline-block text-primary font-semibold text-ds-body-sm hover:underline">
              Scopri eventi →
            </Link>
          </Card>
        </SectionContainer>

        {/* ——— Le Mie Previsioni ——— */}
        <SectionContainer title="Le Mie Previsioni">
          <Card className="p-5 md:p-6">
            <FilterChips
              options={filterButtons.map((b) => ({
                id: b.id,
                label: b.count !== undefined ? `${b.label} (${b.count})` : b.label,
              }))}
              value={filter}
              onChange={setFilter}
              className="mb-4"
            />

            {predictionsLoading ? (
              <LoadingBlock message="Caricamento..." />
            ) : predictions.length === 0 ? (
              <div className="text-center py-8 text-fg-muted text-sm">
                {filter === "all"
                  ? "Nessuna previsione ancora."
                  : `Nessuna previsione ${filter === "active" ? "attiva" : filter === "won" ? "vinta" : "persa"}.`}
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
                        isWon
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : isLost
                            ? "bg-red-500/10 border-red-500/30"
                            : "glass border-border dark:border-white/10 hover:border-primary/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span>{isWon ? "✅" : isLost ? "❌" : "⏳"}</span>
                            <h3 className="font-semibold text-fg line-clamp-2">{prediction.event.title}</h3>
                            <span className="px-2 py-0.5 text-xs bg-surface/50 rounded-xl text-fg-muted border border-border dark:border-white/10 shrink-0">
                              {prediction.event.category}
                            </span>
                          </div>
                          <p className="text-sm text-fg-muted">
                            {prediction.outcome === "YES" ? "SÌ" : "NO"} · {formatAmount(prediction.credits)} crediti
                            {prediction.resolved && prediction.payout !== null && (
                              <span
                                className={
                                  isWon ? " text-emerald-500 dark:text-emerald-400 font-semibold" : " text-red-500 dark:text-red-400 font-semibold"
                                }
                              >
                                {" "}
                                {isWon ? "+" : ""}
                                {formatAmount(prediction.payout)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-fg-subtle mt-1">{formatDate(prediction.createdAt)}</p>
                        </div>
                        {prediction.resolved && (
                          <span
                            className={`shrink-0 px-3 py-1 rounded-xl text-xs font-bold ${
                              isWon ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isWon ? "VINTA" : "PERSA"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </SectionContainer>
      </main>
    </div>
  );
}
