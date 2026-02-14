"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DisputeEvent {
  id: string;
  title: string;
  outcome: string | null;
  resolvedAt: string | null;
  resolutionDisputedAt: string | null;
  resolutionDisputedBy: string | null;
  createdBy: { id: string; name: string | null; email: string };
  _count: { predictions: number };
}

export default function AdminDisputesPage() {
  const [events, setEvents] = useState<DisputeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [correctModal, setCorrectModal] = useState<DisputeEvent | null>(null);
  const [newOutcome, setNewOutcome] = useState<"YES" | "NO" | "">("");

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/disputes");
      if (!res.ok) throw new Error("Errore caricamento");
      const data = await res.json();
      setEvents(data.events);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (eventId: string, action: "APPROVE" | "REJECT", body?: object) => {
    setActioningId(eventId);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? { action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      alert(data.message);
      fetchDisputes();
    } catch (e: any) {
      alert(e.message || "Errore");
    } finally {
      setActioningId(null);
    }
  };

  const runCorrect = async () => {
    if (!correctModal || !newOutcome) return;
    setActioningId(correctModal.id);
    try {
      const res = await fetch(`/api/admin/events/${correctModal.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CORRECT", newOutcome }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      alert(data.message);
      setCorrectModal(null);
      setNewOutcome("");
      fetchDisputes();
    } catch (e: any) {
      alert(e.message || "Errore");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Dispute
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Eventi risolti nelle ultime 2 ore. Approva la risoluzione, rifiutala (contesta) o correggi l&apos;outcome.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-600 dark:text-gray-400">
          Nessun evento nella finestra dispute.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Evento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Risultato
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Risolto il
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Stato
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/events/${e.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {e.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {e._count.predictions} previsioni
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        e.outcome === "YES"
                          ? "text-green-600 dark:text-green-400 font-medium"
                          : "text-red-600 dark:text-red-400 font-medium"
                      }
                    >
                      {e.outcome === "YES" ? "SÌ" : "NO"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {e.resolvedAt
                      ? new Date(e.resolvedAt).toLocaleString("it-IT")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {e.resolutionDisputedAt ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                        Contestato
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                        In attesa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => runAction(e.id, "APPROVE")}
                      disabled={!!actioningId}
                      className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium mr-2"
                    >
                      Approva
                    </button>
                    <button
                      onClick={() => runAction(e.id, "REJECT")}
                      disabled={!!actioningId}
                      className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium mr-2"
                    >
                      Rifiuta
                    </button>
                    <button
                      onClick={() => {
                        setCorrectModal(e);
                        setNewOutcome("");
                      }}
                      disabled={!!actioningId}
                      className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
                    >
                      Correggi outcome
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {correctModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-lg mb-2">Correggi outcome</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {correctModal.title}
            </p>
            <p className="text-sm mb-2">Attuale: {correctModal.outcome === "YES" ? "SÌ" : "NO"}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nuovo outcome *
            </p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setNewOutcome("YES")}
                className={`px-4 py-2 rounded-lg ${
                  newOutcome === "YES"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                SÌ
              </button>
              <button
                onClick={() => setNewOutcome("NO")}
                className={`px-4 py-2 rounded-lg ${
                  newOutcome === "NO"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                NO
              </button>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
              Verranno annullati i payout e l&apos;evento tornerà &quot;da risolvere&quot;. Poi potrai risolverlo di nuovo con il nuovo outcome.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setCorrectModal(null);
                  setNewOutcome("");
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              >
                Annulla
              </button>
              <button
                onClick={runCorrect}
                disabled={!newOutcome || !!actioningId}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actioningId ? "..." : "Correggi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
