"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import BackLink from "@/components/ui/BackLink";
import StreakBadge from "@/components/StreakBadge";
import { trackView } from "@/lib/analytics-client";

interface PublicProfile {
  id: string;
  name: string | null;
  image: string | null;
  streak: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
}

export default function PublicProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (!userId) return;
    if (session?.user?.id === userId) {
      router.replace("/profile");
      return;
    }
    fetch(`/api/profile/${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Profilo non trovato");
        return r.json();
      })
      .then((data) => {
        setProfile(data);
        trackView("PROFILE_VIEWED", { userId });
      })
      .catch(() => setError("Profilo non trovato"))
      .finally(() => setLoading(false));
  }, [userId, session?.user?.id, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main id="main-content" className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main id="main-content" className="mx-auto px-4 py-8 max-w-2xl">
          <div className="box-raised rounded-2xl p-8 text-center">
            <p className="text-fg-muted font-medium">{error || "Profilo non trovato."}</p>
            <BackLink href="/leaderboard" className="mt-4 inline-block text-primary font-semibold hover:underline">
              Indietro
            </BackLink>
          </div>
        </main>
      </div>
    );
  }

  const displayName = profile.name || "Utente";

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        <div className="box-raised rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent-700 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName[0].toUpperCase()
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-bold text-fg">{displayName}</h1>
              <p className="text-fg-muted text-sm mt-1">
                {profile.totalPredictions} previsioni · {profile.correctPredictions} corrette
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface/50 border border-border dark:border-white/10 text-center">
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Accuratezza</p>
              <p className="text-lg font-bold text-primary mt-1">{profile.accuracy}%</p>
            </div>
            <div className="p-4 rounded-xl bg-surface/50 border border-border dark:border-white/10 text-center flex flex-col items-center justify-center">
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Serie</p>
              <StreakBadge streak={profile.streak} size="md" />
            </div>
          </div>
          <div className="mt-6 text-center">
            <BackLink
              href="/leaderboard"
              className="text-primary font-semibold hover:underline text-sm"
            >
              ← Indietro
            </BackLink>
          </div>
        </div>
      </main>
    </div>
  );
}
