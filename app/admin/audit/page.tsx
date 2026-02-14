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
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Audit
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Log delle azioni admin (sola lettura). Filtra per azione o tipo entità.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-700 dark:text-gray-300">Azione:</span>
          <input
            type="text"
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
            placeholder="es. EVENT_CREATE"
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 w-40"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-700 dark:text-gray-300">Entità:</span>
          <input
            type="text"
            value={filterEntityType}
            onChange={(e) => {
              setFilterEntityType(e.target.value);
              setPage(1);
            }}
            placeholder="es. event, comment"
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 w-32"
          />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-600 dark:text-gray-400">
          Nessuna voce in audit con questi filtri.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Utente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Azione
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Entità
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    ID entità
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Payload
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {log.user
                        ? log.user.name || log.user.email
                        : log.userId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {log.entityType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono truncate max-w-[120px]">
                      {log.entityId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px]">
                      {log.payload ? (
                        <pre className="text-xs truncate overflow-hidden">
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
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Pagina {pagination.page} di {pagination.totalPages} ({pagination.total} voci)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                >
                  Precedente
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
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
