"use client";

import { useState, useEffect, useCallback } from "react";

type Category = "all" | "bug" | "idea" | "question" | "other";

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  email: string | null;
  userId: string | null;
  page: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface CategoryCount {
  category: string;
  _count: { _all: number };
}

interface ApiResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  totalPages: number;
  counts: CategoryCount[];
}

const CATEGORIES: { id: Category; label: string; emoji: string; color: string; bg: string; border: string }[] = [
  { id: "all",      label: "Tutti",   emoji: "📬", color: "#e2e8f0", bg: "rgba(226,232,240,0.08)", border: "rgba(226,232,240,0.15)" },
  { id: "bug",      label: "Bug",     emoji: "🐛", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
  { id: "idea",     label: "Idea",    emoji: "💡", color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)"  },
  { id: "question", label: "Domanda", emoji: "🤔", color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.25)"  },
  { id: "other",    label: "Altro",   emoji: "✨", color: "#c084fc", bg: "rgba(192,132,252,0.08)", border: "rgba(192,132,252,0.25)" },
];

function catMeta(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "adesso";
  if (m < 60) return `${m}m fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h fa`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}g fa`;
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export default function SegnalazioniPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, page: String(page) });
      const res = await fetch(`/api/admin/segnalazioni?${params}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => { load(); }, [load]);

  const handleCategoryChange = (c: Category) => {
    setCategory(c);
    setPage(1);
    setExpanded(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questa segnalazione?")) return;
    setDeletingId(id);
    try {
      await fetch("/api/admin/segnalazioni", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  const countFor = (catId: string) => {
    if (!data) return 0;
    if (catId === "all") return data.total;
    return data.counts.find((c) => c.category === catId)?._count._all ?? 0;
  };

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "rgb(var(--admin-bg))" }}>

      {/* ── Header ── */}
      <div className="mb-8">
        <p className="seg-eyebrow mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
          Admin · Feedback utenti
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white leading-none">
              Segnalazioni
            </h1>
            <p className="mt-1.5 text-sm text-white/40">
              {data ? `${data.total} segnalazion${data.total === 1 ? "e" : "i"} ricevut${data.total === 1 ? "a" : "e"}` : "Caricamento…"}
            </p>
          </div>
          <button
            onClick={load}
            className="seg-refresh-btn flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <RefreshIcon className="h-3.5 w-3.5" />
            Aggiorna
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const count = countFor(cat.id);
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className="seg-stat-card group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200"
              style={{
                background: active ? cat.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? cat.border : "rgba(255,255,255,0.06)"}`,
                boxShadow: active ? `0 0 24px ${cat.color}20` : "none",
              }}
            >
              <div className="mb-2 text-xl">{cat.emoji}</div>
              <div
                className="text-2xl font-bold tabular-nums leading-none"
                style={{ color: active ? cat.color : "rgba(255,255,255,0.75)" }}
              >
                {count}
              </div>
              <div
                className="mt-1 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: active ? cat.color : "rgba(255,255,255,0.3)" }}
              >
                {cat.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Feed ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="seg-spinner h-8 w-8 rounded-full border-2 border-white/10 border-t-white/60" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="seg-empty flex flex-col items-center justify-center gap-4 rounded-2xl py-24 text-center">
          <span className="text-5xl opacity-30">📭</span>
          <p className="text-sm text-white/30">
            {category === "all" ? "Nessuna segnalazione ancora." : `Nessuna segnalazione di tipo "${catMeta(category).label}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => {
            const meta = catMeta(item.category);
            const isExpanded = expanded === item.id;
            const isDeleting = deletingId === item.id;
            return (
              <div
                key={item.id}
                className="seg-card group relative overflow-hidden rounded-2xl transition-all duration-200"
                style={{ opacity: isDeleting ? 0.4 : 1 }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: meta.color, opacity: 0.7 }}
                />

                <div className="px-5 py-4 pl-6">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Category badge */}
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                        style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                      >
                        <span>{meta.emoji}</span>
                        {meta.label}
                      </span>
                      {/* Page */}
                      {item.page && (
                        <span className="rounded-md px-2 py-0.5 text-[10px] font-mono text-white/30 seg-page-badge">
                          {item.page}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-white/25 tabular-nums">
                        {timeAgo(item.createdAt)}
                      </span>
                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : item.id)}
                        className="seg-icon-btn flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 hover:scale-110"
                        aria-label="Espandi"
                      >
                        <ChevronIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="seg-delete-btn flex h-7 w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 hover:scale-110"
                        aria-label="Elimina"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Message */}
                  <p
                    className="mt-3 text-sm leading-relaxed text-white/80"
                    style={{
                      display: isExpanded ? "block" : "-webkit-box",
                      WebkitLineClamp: isExpanded ? undefined : 2,
                      WebkitBoxOrient: "vertical",
                      overflow: isExpanded ? "visible" : "hidden",
                    }}
                  >
                    {item.message}
                  </p>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-4 seg-detail-grid grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl p-3">
                      <DetailRow label="ID" value={item.id} mono />
                      <DetailRow label="User ID" value={item.userId ?? "—"} mono />
                      <DetailRow label="Email" value={item.email ?? "—"} />
                      <DetailRow
                        label="Data"
                        value={new Date(item.createdAt).toLocaleString("it-IT")}
                      />
                      {item.userAgent && (
                        <DetailRow label="User Agent" value={item.userAgent} mono className="sm:col-span-2 truncate" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {data && data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="seg-page-btn rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
          >
            ← Precedente
          </button>
          <span className="text-xs text-white/30 tabular-nums">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="seg-page-btn rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
          >
            Successiva →
          </button>
        </div>
      )}

      <style>{PAGE_STYLES}</style>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  className = "",
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-white/25">
        {label}
      </span>
      <span
        className={`text-[11px] text-white/55 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Icons ── */
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/* ── Scoped styles ── */
const PAGE_STYLES = `
  .seg-eyebrow { color: rgba(33,185,180,0.7); }

  .seg-refresh-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.5);
  }
  .seg-refresh-btn:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.8);
  }

  .seg-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .seg-card:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.11);
  }

  .seg-page-badge {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
  }

  .seg-icon-btn {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .seg-icon-btn:hover {
    background: rgba(255,255,255,0.09);
    color: rgba(255,255,255,0.7);
  }

  .seg-delete-btn {
    background: rgba(248,113,113,0.08);
    color: rgba(248,113,113,0.5);
    border: 1px solid rgba(248,113,113,0.12);
  }
  .seg-delete-btn:hover {
    background: rgba(248,113,113,0.15);
    color: rgba(248,113,113,0.9);
  }

  .seg-detail-grid {
    background: rgba(0,0,0,0.25);
    border: 1px solid rgba(255,255,255,0.05);
  }

  .seg-empty {
    border: 1px dashed rgba(255,255,255,0.07);
  }

  .seg-page-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.55);
  }
  .seg-page-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.09);
    color: rgba(255,255,255,0.85);
  }

  .seg-spinner {
    animation: seg-spin 0.8s linear infinite;
  }
  @keyframes seg-spin {
    to { transform: rotate(360deg); }
  }
`;
