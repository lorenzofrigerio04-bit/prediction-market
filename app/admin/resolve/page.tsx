"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  closesAt: string;
  resolutionSourceUrl: string | null;
  resolutionNotes: string | null;
  totalCredits: number;
  _count: { predictions: number; comments: number };
}

export default function AdminResolvePage() {
  const router = useRouter();
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/admin/events?status=pending_resolution&limit=50"
      );
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/");
          return;
        }
        throw new Error("Errore nel caricamento");
      }
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleResolve = async (eventId: string, outcome: "YES" | "NO") => {
    const label = outcome === "YES" ? "SÌ" : "NO";
    if (
      !confirm(
        `Confermi di voler risolvere questo evento come "${label}"? I payout verranno calcolati e accreditati ai vincitori.`
      )
    ) {
      return;
    }

    setResolvingId(eventId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore nella risoluzione");
        return;
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di rete");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-fg">
          Risoluzione eventi
        </h1>
        <p className="mt-2 text-fg-muted">
          Gli eventi sotto sono chiusi (scaduti) e in attesa di risoluzione.
          Verifica l&apos;esito dalla fonte ufficiale, poi imposta SÌ o NO.
          I payout vengono calcolati e accreditati in modo atomico.
        </p>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-fg-muted">
            Caricamento eventi da risolvere...
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="card-raised rounded-2xl p-8 text-center">
          <p className="text-fg-muted text-lg">
            Nessun evento in attesa di risoluzione.
          </p>
          <p className="mt-2 text-sm text-fg-subtle">
            Quando un evento scade (closesAt passata), comparirà qui. Risolvilo
            dopo aver verificato l&apos;esito dalla fonte indicata.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-block text-primary hover:underline font-medium"
          >
            ← Torna agli eventi
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {events.map((event) => (
            <li
              key={event.id}
              className="card-raised rounded-2xl overflow-hidden"
            >
              <div className="p-5 md:p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-lg font-semibold text-fg hover:text-primary transition-colors"
                    >
                      {event.title}
                    </Link>
                    {event.description && (
                      <p className="mt-1 text-sm text-fg-muted line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-fg-subtle font-numeric">
                      Chiuso il{" "}
                      {new Date(event.closesAt).toLocaleString("it-IT")} ·{" "}
                      {event._count.predictions} previsioni ·{" "}
                      {event.totalCredits.toLocaleString()} crediti in gioco
                    </p>
                  </div>

                  <div className="rounded-xl bg-surface/50 p-4 space-y-2">
                    <p className="text-sm font-medium text-fg-muted">
                      Verifica l&apos;esito dalla fonte
                    </p>
                    {event.resolutionSourceUrl && (
                      <a
                        href={event.resolutionSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        Apri fonte di risoluzione
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                    {event.resolutionNotes && (
                      <p className="text-sm text-fg-muted whitespace-pre-wrap">
                        {event.resolutionNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="text-sm font-medium text-fg-muted">
                      Esito reale:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResolve(event.id, "YES")}
                      disabled={resolvingId === event.id}
                      className="px-5 py-2.5 rounded-xl font-semibold text-white bg-success hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resolvingId === event.id ? "..." : "SÌ"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(event.id, "NO")}
                      disabled={resolvingId === event.id}
                      className="px-5 py-2.5 rounded-xl font-semibold text-white bg-danger hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resolvingId === event.id ? "..." : "NO"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
