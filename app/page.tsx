"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingHeroTitle from "@/components/landing/LandingHeroTitle";
import LandingHeroStats from "@/components/landing/LandingHeroStats";
import LandingEventRow from "@/components/landing/LandingEventRow";
import type { LandingEventRowEvent } from "@/components/landing/LandingEventRow";
import Link from "next/link";

interface LandingEventsResponse {
  events: (LandingEventRowEvent & { fomo?: { countdownMs: number } })[];
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [landingEvents, setLandingEvents] = useState<LandingEventRowEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/discover");
      return;
    }
    if (status !== "unauthenticated") return;

    const params = new URLSearchParams({
      status: "open",
      limit: "4",
      forLanding: "1",
    });
    fetch(`/api/events?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch"))))
      .then((data: LandingEventsResponse) => {
        const list = (data.events ?? []).map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          closesAt: e.closesAt,
          probability: e.probability ?? 50,
          fomo: e.fomo,
        }));
        setLandingEvents(list);
      })
      .catch(() => setLandingEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [status, session, router]);

  if (status === "loading" || (status === "authenticated" && session?.user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-pulse text-fg-muted">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <LandingBackground />
      <Header />
      <main className="relative z-10 mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-4xl">
        <section className="text-center mb-12 md:mb-16">
          <LandingHeroTitle />
          <p className="text-ds-body text-fg-muted max-w-xl mx-auto mb-6">
            Partecipa ai mercati predittivi, guadagna punti e sali in classifica.
          </p>
          <LandingHeroStats />
        </section>

        <section className="mb-12 md:mb-16">
          <h2 className="text-ds-h2 font-bold text-fg mb-6">Eventi in corso</h2>
          {loadingEvents ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[160px] rounded-2xl bg-white/10 dark:bg-white/5 animate-pulse"
                  aria-hidden
                />
              ))}
            </div>
          ) : landingEvents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {landingEvents.map((event) => (
                <LandingEventRow key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-ds-body text-fg-muted">Nessun evento al momento.</p>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-2xl bg-primary text-white text-ds-body font-semibold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Scopri tutti gli eventi
            </Link>
          </div>
        </section>

        <section className="text-center py-8 border-t border-black/10 dark:border-white/10">
          <p className="text-ds-body-sm text-fg-muted mb-4">
            PredictionMaster — Prevedi, gioca, scala.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-2xl border-2 border-primary text-primary text-ds-body font-semibold hover:bg-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Accedi per giocare
          </Link>
        </section>
      </main>
    </div>
  );
}
