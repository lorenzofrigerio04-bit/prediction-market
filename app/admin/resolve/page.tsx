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
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Risoluzione eventi
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gli eventi sotto sono chiusi (scaduti) e in attesa di risoluzione.
          Verifica l&apos;esito dalla fonte ufficiale, poi imposta SÌ o NO.
          I payout vengono calcolati e accreditati in modo atomico.
        </p>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Caricamento eventi da risolvere...
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Nessun evento in attesa di risoluzione.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            Quando un evento scade (closesAt passata), comparirà qui. Risolvilo
            dopo aver verificato l&apos;esito dalla fonte indicata.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ← Torna agli eventi
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
            >
              <div className="p-5 md:p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {event.title}
                    </Link>
                    {event.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      Chiuso il{" "}
                      {new Date(event.closesAt).toLocaleString("it-IT")} ·{" "}
                      {event._count.predictions} previsioni ·{" "}
                      {event.totalCredits.toLocaleString()} crediti in gioco
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Verifica l&apos;esito dalla fonte
                    </p>
                    {event.resolutionSourceUrl && (
                      <a
                        href={event.resolutionSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Apri fonte di risoluzione
                        <span aria-hidden>↗</span>
                      </a>
                    )}
                    {event.resolutionNotes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {event.resolutionNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Esito reale:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResolve(event.id, "YES")}
                      disabled={resolvingId === event.id}
                      className="px-5 py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resolvingId === event.id ? "..." : "SÌ"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(event.id, "NO")}
                      disabled={resolvingId === event.id}
                      className="px-5 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
