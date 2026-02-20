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
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8">
      <h1 className="text-2xl font-bold text-fg mb-2">
        Moderazione commenti
      </h1>
      <p className="text-fg-muted mb-6">
        Nascondi o elimina commenti. Ogni azione viene registrata in Audit.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-fg-muted">Stato:</span>
        {[
          { id: "false", label: "Visibili" },
          { id: "true", label: "Nascosti" },
          { id: "all", label: "Tutti" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => { setHiddenFilter(opt.id); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              hiddenFilter === opt.id
                ? "bg-primary text-white"
                : "bg-surface/50 text-fg-muted hover:bg-surface/80 border border-border dark:border-white/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <div className="card-raised rounded-2xl p-8 text-center text-fg-muted">
          Nessun commento con questi filtri.
        </div>
      ) : (
        <div className="card-raised rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-white/10">
              <thead className="bg-surface/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    Contenuto / Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    Autore
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                    Data
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
                {comments.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-fg line-clamp-2">
                        {c.content}
                      </p>
                      <Link
                        href={`/events/${c.event.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {c.event.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-fg-muted">
                      {c.user.name || c.user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-fg-subtle font-numeric">
                      {new Date(c.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="px-4 py-3">
                      {c.hidden ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-warning/10 text-warning font-medium">
                          Nascosto
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-success/10 text-success font-medium">
                          Visibile
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!c.hidden && (
                        <button
                          onClick={() => openModal(c, "hide")}
                          disabled={!!actioningId}
                          className="text-warning hover:underline text-sm font-medium mr-3"
                        >
                          Nascondi
                        </button>
                      )}
                      <button
                        onClick={() => openModal(c, "delete")}
                        disabled={!!actioningId}
                        className="text-danger hover:underline text-sm font-medium"
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
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border dark:border-white/10">
              <span className="text-sm text-fg-muted">
                Pagina <span className="font-numeric">{pagination.page}</span> di <span className="font-numeric">{pagination.totalPages}</span>
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

      {modalComment && modalAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg border border-border dark:border-white/10 rounded-2xl shadow-overlay max-w-md w-full p-6">
            <h3 className="font-semibold text-lg text-fg mb-2">
              {modalAction === "hide" ? "Nascondi commento" : "Elimina commento"}
            </h3>
            <p className="text-sm text-fg-muted mb-4 line-clamp-3">
              &quot;{modalComment.content}&quot;
            </p>
            <label className="block text-sm font-medium text-fg-muted mb-2">
              Motivazione (opzionale)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-border dark:border-white/10 rounded-xl bg-white/5 text-fg placeholder:text-fg-subtle mb-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Es: spam, offensivo..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl border border-border dark:border-white/10 text-fg hover:bg-surface/50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={confirmAction}
                disabled={!!actioningId}
                className={`px-4 py-2.5 rounded-xl text-white font-medium transition-colors ${
                  modalAction === "delete"
                    ? "bg-danger hover:opacity-90"
                    : "bg-warning hover:opacity-90"
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
