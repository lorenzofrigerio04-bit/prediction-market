"use client";

import { useState, useEffect, useCallback } from "react";
import EventFeedbackPanel from "@/components/admin/EventFeedbackPanel";

interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  closesAt: string;
  createdAt: string;
  resolved: boolean;
  marketType: string | null;
  sourceType: string | null;
  _count: {
    feedbacks: number;
    predictions: number;
  };
}

interface Stats {
  total: number;
  reviewed: number;
  pending: number;
}

export default function FeedbackReviewPage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, reviewed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());

  const fetchPendingEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events/pending-review");
      if (!res.ok) throw new Error("Errore nel caricamento");
      const data = await res.json();
      setEvents(data.events ?? []);
      setStats(data.stats ?? { total: 0, reviewed: 0, pending: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingEvents();
  }, [fetchPendingEvents]);

  const handleFeedbackSubmitted = useCallback((eventId: string) => {
    setDismissing((prev) => new Set(prev).add(eventId));
    setStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      pending: prev.pending - 1,
    }));
    // Remove after animation
    setTimeout(() => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setDismissing((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }, 500);
  }, []);

  const progressPct = stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg tracking-tight mb-1">
          Revisione AI Feedback
        </h1>
        <p className="text-sm text-fg-muted">
          Lascia un feedback su ogni evento così l&apos;AI può imparare cosa migliorare. Gli eventi già revisionati scompaiono automaticamente.
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="mb-8 p-5 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(80,245,252,0.04) 0%, rgba(56,228,238,0.02) 50%, rgba(10,42,106,0.06) 100%)",
          border: "1px solid rgba(80,245,252,0.12)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(80,245,252,0.15) 0%, rgba(56,228,238,0.08) 100%)",
                border: "1px solid rgba(80,245,252,0.2)",
              }}
            >
              <svg className="w-4 h-4" style={{ color: "rgb(80,245,252)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">Progresso revisione</p>
              <p className="text-xs text-fg-muted mt-0.5">
                {stats.reviewed} revisionati · {stats.pending} da fare · {stats.total} totali
              </p>
            </div>
          </div>
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: "rgb(80,245,252)" }}
          >
            {progressPct}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, rgb(80,245,252) 0%, rgb(56,228,238) 100%)",
              boxShadow: progressPct > 0 ? "0 0 12px rgba(80,245,252,0.4)" : "none",
            }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
            style={{ borderColor: "rgba(80,245,252,0.5)", borderTopColor: "transparent" }}
          />
          <p className="text-sm text-fg-muted">Caricamento eventi...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(60,212,160,0.12) 0%, rgba(60,212,160,0.05) 100%)",
              border: "1px solid rgba(60,212,160,0.2)",
            }}
          >
            <svg className="w-8 h-8" style={{ color: "rgb(60,212,160)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-fg mb-1">Tutti gli eventi revisionati!</p>
            <p className="text-sm text-fg-muted">
              Hai completato il feedback su tutti i {stats.total} eventi presenti.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const isDismissing = dismissing.has(event.id);
            return (
              <div
                key={event.id}
                className="rounded-2xl overflow-hidden transition-all duration-500"
                style={{
                  opacity: isDismissing ? 0 : 1,
                  transform: isDismissing ? "translateX(40px) scale(0.97)" : "translateX(0) scale(1)",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Event header */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-base font-semibold text-fg leading-snug flex-1">
                      {event.title}
                    </h2>
                    <span
                      className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(80,245,252,0.08)",
                        color: "rgb(80,245,252)",
                        border: "1px solid rgba(80,245,252,0.15)",
                      }}
                    >
                      {event.category}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-fg-muted leading-relaxed line-clamp-2 mb-3">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[11px] text-fg-subtle">
                    <span>
                      Chiude:{" "}
                      {new Date(event.closesAt).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>{event._count.predictions} predizioni</span>
                    {event.marketType && <span>{event.marketType}</span>}
                    {event.sourceType && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {event.sourceType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Feedback panel */}
                <div
                  className="mx-5 mb-5"
                >
                  <EventFeedbackPanel
                    eventId={event.id}
                    onFeedbackSubmitted={() => handleFeedbackSubmitted(event.id)}
                    defaultExpanded
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
