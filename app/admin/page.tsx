"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  closesAt: string;
  resolved: boolean;
  outcome: "YES" | "NO" | null;
  resolvedAt: string | null;
  totalCredits: number;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    predictions: number;
    comments: number;
  };
}

interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type StatusFilter = "all" | "pending" | "pending_resolution" | "resolved";

export default function AdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [pendingResolutionCount, setPendingResolutionCount] = useState(0);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateResult, setSimulateResult] = useState<Record<string, unknown> | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateResult, setGenerateResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, page]);

  useEffect(() => {
    fetch("/api/admin/events?status=pending_resolution&limit=1")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.pagination?.total != null) setPendingResolutionCount(data.pagination.total);
      })
      .catch(() => {});
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
      });

      const response = await fetch(`/api/admin/events?${params}`);
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch events");
      }

      const data: EventsResponse = await response.json();
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (eventId: string, outcome: "YES" | "NO") => {
    if (!confirm(`Sei sicuro di voler risolvere questo evento come "${outcome === "YES" ? "SÌ" : "NO"}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outcome }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Errore nella risoluzione dell'evento");
        return;
      }

      alert("Evento risolto con successo!");
      fetchEvents();
      fetch("/api/admin/events?status=pending_resolution&limit=1")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.pagination?.total != null) setPendingResolutionCount(data.pagination.total);
        })
        .catch(() => {});
    } catch (error) {
      console.error("Error resolving event:", error);
      alert("Errore nella risoluzione dell'evento");
    }
  };

  const runSimulatedActivity = async () => {
    setSimulateLoading(true);
    setSimulateResult(null);
    try {
      const res = await fetch("/api/admin/run-simulated-activity", { method: "POST" });
      const data = await res.json();
      setSimulateResult(data);
      if (res.ok && data.ok) {
        fetchEvents();
      }
    } catch (e) {
      setSimulateResult({ error: String(e) });
    } finally {
      setSimulateLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sport: "bg-success/10 text-success",
      Politica: "bg-primary/10 text-primary",
      Tecnologia: "bg-accent-secondary/10 text-accent-secondary",
      Economia: "bg-warning/10 text-warning",
      Cultura: "bg-pink-500/10 text-pink-400",
      Altro: "bg-surface text-fg-muted",
    };
    return colors[category] || colors.Altro;
  };

  return (
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2">
              Admin Dashboard
            </h1>
            <p className="text-fg-muted">
              Gestisci eventi e risolvi previsioni
            </p>
          </div>
          <Link
            href="/admin/events/create"
            className="inline-flex items-center justify-center bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-[0_0_24px_-6px_rgba(var(--primary-glow),0.45)]"
          >
            + Crea Evento
          </Link>
        </div>

        {/* Banner eventi da risolvere */}
        {pendingResolutionCount > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/30">
            <p className="text-warning font-medium">
              Hai {pendingResolutionCount} evento{pendingResolutionCount !== 1 ? "i" : ""} chiusi in attesa di risoluzione.
              Verifica l&apos;esito dalla fonte e imposta SÌ/NO per accreditare i payout.
            </p>
            <Link
              href="/admin/resolve"
              className="mt-2 inline-block text-warning hover:underline font-semibold"
            >
              Vai alla Risoluzione eventi →
            </Link>
          </div>
        )}

        {/* Simulazione bot */}
        <div className="mb-6 p-5 card-raised rounded-2xl">
          <h2 className="text-lg font-semibold text-fg mb-2">Simulazione bot</h2>
          <p className="text-sm text-fg-muted mb-3">
            Esegui subito una run di attività simulata (previsioni, commenti, reazioni, follow dai bot).
            Richiede <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">ENABLE_SIMULATED_ACTIVITY=true</code> in produzione.
          </p>
          <button
            onClick={runSimulatedActivity}
            disabled={simulateLoading}
            className="bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
          >
            {simulateLoading ? "Esecuzione..." : "Esegui attività simulata ora"}
          </button>
          {simulateResult && (
            <pre className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 text-xs overflow-auto max-h-40 font-mono text-fg-muted">
              {JSON.stringify(simulateResult, null, 2)}
            </pre>
          )}
        </div>

        {/* Generazione eventi (pipeline: notizie → LLM → DB) */}
        <div className="mb-6 p-5 card-raised rounded-2xl">
          <h2 className="text-lg font-semibold text-fg mb-2">Generazione eventi</h2>
          <p className="text-sm text-fg-muted mb-3">
            Esegue la pipeline (notizie → verifica → LLM → creazione in DB). Utile sul sito deployato per creare nuovi eventi senza aspettare il cron. Richiede NEWS_API_KEY e OPENAI/ANTHROPIC in produzione.
          </p>
          <button
            onClick={async () => {
              setGenerateLoading(true);
              setGenerateResult(null);
              try {
                const res = await fetch("/api/admin/run-generate-events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ maxTotal: 5 }) });
                const data = await res.json();
                setGenerateResult(data);
                if (res.ok && data.created > 0) fetchEvents();
              } catch (e) {
                setGenerateResult({ error: String(e) });
              } finally {
                setGenerateLoading(false);
              }
            }}
            disabled={generateLoading}
            className="bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
          >
            {generateLoading ? "Generazione in corso..." : "Genera eventi ora (max 5)"}
          </button>
          {generateResult && (
            <pre className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 text-xs overflow-auto max-h-40 font-mono text-fg-muted">
              {JSON.stringify(generateResult, null, 2)}
            </pre>
          )}
        </div>

        {/* Status Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-fg-muted">Filtri:</span>
            {[
              { id: "all" as StatusFilter, label: "Tutti" },
              { id: "pending" as StatusFilter, label: "Aperti" },
              { id: "pending_resolution" as StatusFilter, label: "Da risolvere (scaduti)" },
              { id: "resolved" as StatusFilter, label: "Risolti" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setStatusFilter(btn.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  statusFilter === btn.id
                    ? "bg-primary text-white"
                    : "bg-surface/50 text-fg-muted hover:bg-surface/80 border border-border dark:border-white/10"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="mt-4 text-fg-muted">Caricamento eventi...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 card-raised rounded-2xl">
            <p className="text-fg-muted text-lg">
              Nessun evento trovato.
            </p>
            <Link
              href="/admin/events/create"
              className="mt-4 inline-block text-primary hover:text-primary-hover font-medium"
            >
              Crea il primo evento
            </Link>
          </div>
        ) : (
          <>
            <div className="card-raised rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border dark:divide-white/10">
                  <thead className="bg-surface/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Previsioni
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Crediti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-white/10">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <Link
                              href={`/events/${event.id}`}
                              className="text-sm font-medium text-fg hover:text-primary transition-colors"
                            >
                              {event.title}
                            </Link>
                            {!event.resolved && (
                              <Link
                                href={`/admin/events/${event.id}/edit`}
                                className="ml-2 text-xs text-fg-subtle hover:text-primary transition-colors"
                              >
                                Modifica
                              </Link>
                            )}
                            {event.description && (
                              <p className="text-sm text-fg-muted mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <p className="text-xs text-fg-subtle mt-1">
                              Chiude:{" "}
                              {new Date(event.closesAt).toLocaleDateString(
                                "it-IT"
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                              event.category
                            )}`}
                          >
                            {event.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-fg font-numeric">
                          {event._count.predictions}
                        </td>
                        <td className="px-6 py-4 text-sm text-fg font-numeric">
                          {event.totalCredits.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {event.resolved ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                event.outcome === "YES"
                                  ? "bg-success/10 text-success"
                                  : "bg-danger/10 text-danger"
                              }`}
                            >
                              Risolto: {event.outcome === "YES" ? "SÌ" : "NO"}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                              In attesa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {!event.resolved ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResolve(event.id, "YES")}
                                className="text-success hover:opacity-80 bg-success/10 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Risolvi SÌ
                              </button>
                              <button
                                onClick={() => handleResolve(event.id, "NO")}
                                className="text-danger hover:opacity-80 bg-danger/10 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Risolvi NO
                              </button>
                            </div>
                          ) : (
                            <span className="text-fg-subtle font-numeric">
                              {event.resolvedAt &&
                                new Date(
                                  event.resolvedAt
                                ).toLocaleDateString("it-IT")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-fg-muted">
                  Pagina <span className="font-numeric">{pagination.page}</span> di <span className="font-numeric">{pagination.totalPages}</span> (
                  <span className="font-numeric">{pagination.total}</span> eventi totali)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-surface/50 border border-border dark:border-white/10 rounded-xl hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-fg"
                  >
                    Precedente
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 bg-surface/50 border border-border dark:border-white/10 rounded-xl hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-fg"
                  >
                    Successivo
                  </button>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
}
