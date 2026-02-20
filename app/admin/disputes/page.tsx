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
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8">
      <h1 className="text-2xl font-bold text-fg mb-2">
        Dispute
      </h1>
      <p className="text-fg-muted mb-6">
        Eventi risolti nelle ultime 2 ore. Approva la risoluzione, rifiutala (contesta) o correggi l&apos;outcome.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="card-raised rounded-2xl p-8 text-center text-fg-muted">
          Nessun evento nella finestra dispute.
        </div>
      ) : (
        <div className="card-raised rounded-2xl overflow-hidden">
          <table className="min-w-full divide-y divide-border dark:divide-white/10">
            <thead className="bg-surface/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                  Risultato
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                  Risolto il
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-fg-muted uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-white/10">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/events/${e.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {e.title}
                    </Link>
                    <p className="text-xs text-fg-subtle font-numeric">
                      {e._count.predictions} previsioni
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        e.outcome === "YES"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {e.outcome === "YES" ? "SÌ" : "NO"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-fg-muted font-numeric">
                    {e.resolvedAt
                      ? new Date(e.resolvedAt).toLocaleString("it-IT")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {e.resolutionDisputedAt ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-warning/10 text-warning font-medium">
                        Contestato
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-success/10 text-success font-medium">
                        In attesa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => runAction(e.id, "APPROVE")}
                      disabled={!!actioningId}
                      className="text-success hover:underline text-sm font-medium mr-3"
                    >
                      Approva
                    </button>
                    <button
                      onClick={() => runAction(e.id, "REJECT")}
                      disabled={!!actioningId}
                      className="text-warning hover:underline text-sm font-medium mr-3"
                    >
                      Rifiuta
                    </button>
                    <button
                      onClick={() => {
                        setCorrectModal(e);
                        setNewOutcome("");
                      }}
                      disabled={!!actioningId}
                      className="text-danger hover:underline text-sm font-medium"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg border border-border dark:border-white/10 rounded-2xl shadow-overlay max-w-md w-full p-6">
            <h3 className="font-semibold text-lg text-fg mb-2">Correggi outcome</h3>
            <p className="text-sm text-fg-muted mb-4">
              {correctModal.title}
            </p>
            <p className="text-sm text-fg mb-2">Attuale: <span className="font-medium">{correctModal.outcome === "YES" ? "SÌ" : "NO"}</span></p>
            <p className="text-sm font-medium text-fg-muted mb-2">
              Nuovo outcome *
            </p>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setNewOutcome("YES")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  newOutcome === "YES"
                    ? "bg-success text-white"
                    : "bg-surface/50 text-fg border border-border dark:border-white/10"
                }`}
              >
                SÌ
              </button>
              <button
                onClick={() => setNewOutcome("NO")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  newOutcome === "NO"
                    ? "bg-danger text-white"
                    : "bg-surface/50 text-fg border border-border dark:border-white/10"
                }`}
              >
                NO
              </button>
            </div>
            <p className="text-xs text-warning mb-4">
              Verranno annullati i payout e l&apos;evento tornerà &quot;da risolvere&quot;. Poi potrai risolverlo di nuovo con il nuovo outcome.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setCorrectModal(null);
                  setNewOutcome("");
                }}
                className="px-4 py-2.5 rounded-xl border border-border dark:border-white/10 text-fg hover:bg-surface/50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={runCorrect}
                disabled={!newOutcome || !!actioningId}
                className="px-4 py-2.5 rounded-xl bg-danger text-white hover:opacity-90 disabled:opacity-50 font-medium transition-colors"
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
