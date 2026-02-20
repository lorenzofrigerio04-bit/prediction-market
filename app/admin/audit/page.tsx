"use client";

import { useState, useEffect } from "react";

interface AuditRow {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filterAction, setFilterAction] = useState("");
  const [filterEntityType, setFilterEntityType] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction, filterEntityType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (filterAction) params.set("action", filterAction);
      if (filterEntityType) params.set("entityType", filterEntityType);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (!res.ok) throw new Error("Errore caricamento");
      const data = await res.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8">
      <h1 className="text-2xl font-bold text-fg mb-2">
        Audit
      </h1>
      <p className="text-fg-muted mb-6">
        Log delle azioni admin (sola lettura). Filtra per azione o tipo entità.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-fg-muted">Azione:</span>
          <input
            type="text"
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
            placeholder="es. EVENT_CREATE"
            className="px-3 py-2 border border-border dark:border-white/10 rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle w-44 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-fg-muted">Entità:</span>
          <input
            type="text"
            value={filterEntityType}
            onChange={(e) => {
              setFilterEntityType(e.target.value);
              setPage(1);
            }}
            placeholder="es. event, comment"
            className="px-3 py-2 border border-border dark:border-white/10 rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle w-36 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card-raised rounded-2xl p-8 text-center text-fg-muted">
          Nessuna voce in audit con questi filtri.
        </div>
      ) : (
        <div className="card-raised rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-white/10">
              <thead className="bg-surface/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    Azione
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    Entità
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    ID entità
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    Payload
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-fg-muted whitespace-nowrap font-numeric">
                      {new Date(log.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="px-4 py-3 text-sm text-fg">
                      {log.user
                        ? log.user.name || log.user.email
                        : log.userId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-fg">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-sm text-fg-muted">
                      {log.entityType}
                    </td>
                    <td className="px-4 py-3 text-sm text-fg-subtle font-mono truncate max-w-[120px]">
                      {log.entityId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-fg-subtle max-w-[200px]">
                      {log.payload ? (
                        <pre className="text-xs truncate overflow-hidden font-mono">
                          {JSON.stringify(log.payload)}
                        </pre>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border dark:border-white/10">
              <span className="text-sm text-fg-muted">
                Pagina <span className="font-numeric">{pagination.page}</span> di <span className="font-numeric">{pagination.totalPages}</span> (<span className="font-numeric">{pagination.total}</span> voci)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border dark:border-white/10 disabled:opacity-50 hover:bg-surface/80 transition-colors text-fg"
                >
                  Precedente
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 rounded-xl border border-border dark:border-white/10 disabled:opacity-50 hover:bg-surface/80 transition-colors text-fg"
                >
                  Successivo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
