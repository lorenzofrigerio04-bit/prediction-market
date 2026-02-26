"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import LeaderboardRow from "@/components/LeaderboardRow";
import ConfettiCelebration from "@/components/leaderboard/ConfettiCelebration";
import { trackView } from "@/lib/analytics-client";
import { getLeaderboardMotivationalPhrase } from "@/lib/leaderboard-messages";
import {
  PageHeader,
  SectionContainer,
  Card,
  EmptyState,
  LoadingBlock,
} from "@/components/ui";
import FilterDropdown from "@/components/ui/FilterDropdown";

type PeriodType = "daily" | "weekly" | "monthly" | "all-time";

interface LeaderboardBadge {
  id: string;
  name: string;
  icon: string | null;
  rarity: string;
}

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
  badges: LeaderboardBadge[];
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
  const [openFilter, setOpenFilter] = useState<"category" | "period" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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
      if (data.leaderboard.length > 0) setShowConfetti(true);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Errore nel caricamento della classifica");
    } finally {
      setLoading(false);
    }
  };

  const periodOptions: Array<{ id: PeriodType; label: string }> = [
    { id: "daily", label: "Giornaliero" },
    { id: "weekly", label: "Settimanale" },
    { id: "monthly", label: "Mensile" },
    { id: "all-time", label: "Sempre" },
  ];

  const categoryOptions = [
    { id: "", label: "Tutte" },
    ...categories.map((c) => ({ id: c, label: c })),
  ];

  return (
    <div className="min-h-screen bg-bg">
      <ConfettiCelebration
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
        durationMs={4000}
      />
      <Header />
      <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
        <PageHeader title="CLASSIFICA" align="center" />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-ds-body-sm">
            {error}
          </div>
        )}

        <SectionContainer>
          <div className="mb-4 flex flex-wrap items-end justify-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <FilterDropdown
                label="Categoria"
                options={categoryOptions}
                value={category}
                onChange={(id) => {
                  setCategory(id);
                  setOpenFilter(null);
                }}
                open={openFilter === "category"}
                onOpenChange={(o) => setOpenFilter(o ? "category" : null)}
                onOpen={() => setOpenFilter("category")}
              />
            </div>
            <div className="flex flex-col items-center">
              <FilterDropdown
                label="Tempo"
                options={periodOptions}
                value={period}
                onChange={(id) => {
                  setPeriod(id as PeriodType);
                  setOpenFilter(null);
                }}
                open={openFilter === "period"}
                onOpenChange={(o) => setOpenFilter(o ? "period" : null)}
                onOpen={() => setOpenFilter("period")}
              />
            </div>
          </div>
        </SectionContainer>

        {!loading && session?.user && (() => {
          const myEntry = leaderboard.find((u) => u.id === session.user?.id);
          if (!myEntry) return null;
          const phrase = getLeaderboardMotivationalPhrase(
            myEntry.rank,
            leaderboard.length,
            myEntry.correctPredictions,
            true
          ).replace(/^Tu:\s*/i, "");
          return (
            <div className="mx-auto mb-6 max-w-2xl px-page-x text-center">
              <p className="text-ds-h3 font-semibold text-fg">
                Sei il numero {myEntry.rank}
              </p>
              <p className="mt-2 text-ds-body-sm text-fg-muted italic leading-snug">
                {phrase}
              </p>
            </div>
          );
        })()}

        {loading ? (
          <LoadingBlock message="Caricamento…" />
        ) : leaderboard.length === 0 ? (
          <EmptyState description="Nessun dato per questo periodo." />
        ) : (
          <Card elevated className="p-4 md:p-6">
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <LeaderboardRow
                  key={user.id}
                  rank={user.rank}
                  totalUsers={leaderboard.length}
                  user={{ id: user.id, name: user.name, email: user.email, image: user.image }}
                  badges={user.badges ?? []}
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
