"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CommentItem {
  id: string;
  content: string;
  hidden: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  event: { id: string; title: string };
  _count: { reactions: number; replies: number };
}

export default function AdminModerationPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [hiddenFilter, setHiddenFilter] = useState<string>("false"); // "true" | "false" | "all"
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [modalComment, setModalComment] = useState<CommentItem | null>(null);
  const [modalAction, setModalAction] = useState<"hide" | "delete" | null>(null);

  useEffect(() => {
    fetchComments();
  }, [page, hiddenFilter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (hiddenFilter !== "all") params.set("hidden", hiddenFilter);
      const res = await fetch(`/api/admin/comments?${params}`);
      if (!res.ok) throw new Error("Errore caricamento");
      const data = await res.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (comment: CommentItem, action: "hide" | "delete") => {
    setModalComment(comment);
    setModalAction(action);
    setReason("");
  };

  const closeModal = () => {
    setModalComment(null);
    setModalAction(null);
    setReason("");
  };

  const confirmAction = async () => {
    if (!modalComment || !modalAction) return;
    setActioningId(modalComment.id);
    try {
      if (modalAction === "hide") {
        const res = await fetch(`/api/admin/comments/${modalComment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hidden: true, reason: reason || undefined }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Errore");
      } else {
        const url = new URL(`/api/admin/comments/${modalComment.id}`, window.location.origin);
        if (reason) url.searchParams.set("reason", reason);
        const res = await fetch(url.toString(), { method: "DELETE" });
        if (!res.ok) throw new Error((await res.json()).error || "Errore");
      }
      closeModal();
      fetchComments();
    } catch (e: any) {
      alert(e.message || "Errore");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Moderazione commenti
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Nascondi o elimina commenti. Ogni azione viene registrata in Audit.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stato:</span>
        {[
          { id: "false", label: "Visibili" },
          { id: "true", label: "Nascosti" },
          { id: "all", label: "Tutti" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => { setHiddenFilter(opt.id); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              hiddenFilter === opt.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-600 dark:text-gray-400">
          Nessun commento con questi filtri.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Contenuto / Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Autore
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Data
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
                {comments.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                        {c.content}
                      </p>
                      <Link
                        href={`/events/${c.event.id}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {c.event.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {c.user.name || c.user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(c.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="px-4 py-3">
                      {c.hidden ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          Nascosto
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                          Visibile
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!c.hidden && (
                        <button
                          onClick={() => openModal(c, "hide")}
                          disabled={!!actioningId}
                          className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium mr-2"
                        >
                          Nascondi
                        </button>
                      )}
                      <button
                        onClick={() => openModal(c, "delete")}
                        disabled={!!actioningId}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Pagina {pagination.page} di {pagination.totalPages}
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

      {modalComment && modalAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-lg mb-2">
              {modalAction === "hide" ? "Nascondi commento" : "Elimina commento"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              &quot;{modalComment.content}&quot;
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motivazione (opzionale)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              placeholder="Es: spam, offensivo..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              >
                Annulla
              </button>
              <button
                onClick={confirmAction}
                disabled={!!actioningId}
                className={`px-4 py-2 rounded-lg text-white ${
                  modalAction === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                } disabled:opacity-50`}
              >
                {actioningId ? "..." : modalAction === "hide" ? "Nascondi" : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
