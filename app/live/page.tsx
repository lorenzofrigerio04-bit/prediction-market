"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import HomeEventTile from "@/components/home/HomeEventTile";

interface LiveEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  closesAt: string | Date;
  probability: number;
  totalCredits: number;
  imageUrl?: string | null;
  sportLeague?: string | null;
  matchStatus?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
  _count: { predictions: number; comments: number };
}

function isLive(e: LiveEvent) {
  return e.matchStatus === "IN_PLAY" || e.matchStatus === "PAUSED";
}

function LiveDot() {
  return (
    <span className="relative inline-flex items-center justify-center w-2 h-2">
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
        style={{ background: "#ff3b3b" }}
      />
      <span
        className="relative inline-flex rounded-full w-2 h-2"
        style={{ background: "#ff3b3b" }}
      />
    </span>
  );
}

export default function LivePage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLiveEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events/sport", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const byCategory: Record<string, LiveEvent[]> = data.eventsByCategory ?? {};
      const all: LiveEvent[] = Object.values(byCategory).flat();
      setEvents(all.filter(isLive));
      setLastUpdated(new Date());
    } catch {
      // silently ignore — we just show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, 60_000);
    return () => clearInterval(interval);
  }, [fetchLiveEvents]);

  return (
    <div className="min-h-screen bg-bg">
      <Header showCategoryStrip={false} />

      <div className="mx-auto max-w-2xl px-4 pt-6 pb-24">
        {/* Page title */}
        <div className="flex items-center gap-3 mb-6">
          <LiveDot />
          <h1
            className="text-2xl font-bold tracking-tight text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Live ora
          </h1>
          {lastUpdated && (
            <span className="ml-auto text-[11px] text-white/30 tabular-nums">
              Aggiornato {lastUpdated.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            {/* Empty state */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, rgba(255,59,59,0.12) 0%, rgba(255,59,59,0.03) 100%)",
                border: "1px solid rgba(255,59,59,0.15)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7"
                stroke="rgba(255,100,100,0.7)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.5 7.5 A8.5 8.5 0 0 0 5.5 16.5" />
                <path d="M18.5 7.5 A8.5 8.5 0 0 1 18.5 16.5" />
                <path d="M8.5 9.5 A5 5 0 0 0 8.5 14.5" />
                <path d="M15.5 9.5 A5 5 0 0 1 15.5 14.5" />
                <circle cx="12" cy="12" r="1.5" fill="rgba(255,100,100,0.7)" stroke="none" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white/70 font-medium text-base">Nessun evento live al momento</p>
              <p className="text-white/30 text-sm mt-1">
                Aggiornamento automatico ogni minuto
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div key={event.id} className="relative">
                {/* Live badge overlay */}
                <div
                  className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background: "rgba(255,59,59,0.15)",
                    border: "1px solid rgba(255,59,59,0.35)",
                    color: "#ff5555",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <LiveDot />
                  live
                </div>
                <HomeEventTile
                  id={event.id}
                  title={event.title}
                  category={event.category}
                  closesAt={String(event.closesAt)}
                  yesPct={Math.round(event.probability * 100)}
                  predictionsCount={event._count.predictions}
                  variant="popular"
                  marketType={event.marketType}
                  outcomes={event.outcomes}
                  outcomeProbabilities={event.outcomeProbabilities}
                  imageUrl={event.imageUrl}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
