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

type StatusFilter = "all" | "pending" | "resolved";

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

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, page]);

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
    } catch (error) {
      console.error("Error resolving event:", error);
      alert("Errore nella risoluzione dell'evento");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sport: "bg-green-100 text-green-800",
      Politica: "bg-blue-100 text-blue-800",
      Tecnologia: "bg-purple-100 text-purple-800",
      Economia: "bg-yellow-100 text-yellow-800",
      Cultura: "bg-pink-100 text-pink-800",
      Altro: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.Altro;
  };

  return (
    <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Gestisci eventi e risolvi previsioni
            </p>
          </div>
          <Link
            href="/admin/events/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Crea Evento
          </Link>
        </div>

        {/* Status Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filtri:</span>
            {[
              { id: "all" as StatusFilter, label: "Tutti" },
              { id: "pending" as StatusFilter, label: "Da risolvere" },
              { id: "resolved" as StatusFilter, label: "Risolti" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setStatusFilter(btn.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === btn.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Caricamento eventi...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              Nessun evento trovato.
            </p>
            <Link
              href="/admin/events/create"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Crea il primo evento
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Previsioni
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crediti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <Link
                              href={`/events/${event.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {event.title}
                            </Link>
                            {!event.resolved && (
                              <Link
                                href={`/admin/events/${event.id}/edit`}
                                className="ml-2 text-xs text-gray-500 hover:text-blue-600"
                              >
                                Modifica
                              </Link>
                            )}
                            {event.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Chiude:{" "}
                              {new Date(event.closesAt).toLocaleDateString(
                                "it-IT"
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                              event.category
                            )}`}
                          >
                            {event.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {event._count.predictions}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {event.totalCredits.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {event.resolved ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                event.outcome === "YES"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              Risolto: {event.outcome === "YES" ? "SÌ" : "NO"}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              In attesa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {!event.resolved ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResolve(event.id, "YES")}
                                className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                              >
                                Risolvi SÌ
                              </button>
                              <button
                                onClick={() => handleResolve(event.id, "NO")}
                                className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                              >
                                Risolvi NO
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">
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
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Pagina {pagination.page} di {pagination.totalPages} (
                  {pagination.total} eventi totali)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Precedente
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
