"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMarketTypeLabel } from "@/lib/market-types";
import type { MarketTypeId } from "@/lib/market-types";
import { DailyStatsBanner } from "@/components/admin/DailyStatsBanner";

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
  totalCredits: number | null;
  hidden?: boolean;
  sourceType?: string | null;
  marketType?: string | null;
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
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateResult, setGenerateResult] = useState<Record<string, unknown> | null>(null);
  const [generateReplicaLoading, setGenerateReplicaLoading] = useState(false);
  const [generateReplicaResult, setGenerateReplicaResult] = useState<Record<string, unknown> | null>(null);
  const [generatePolymarketLoading, setGeneratePolymarketLoading] = useState(false);
  const [generatePolymarketResult, setGeneratePolymarketResult] = useState<Record<string, unknown> | null>(null);
  const [generatePolymarketV2Loading, setGeneratePolymarketV2Loading] = useState(false);
  const [generatePolymarketV2Result, setGeneratePolymarketV2Result] = useState<Record<string, unknown> | null>(null);
  const [polymarketV2MaxTotalInput, setPolymarketV2MaxTotalInput] = useState("500");
  const [generateSportLoading, setGenerateSportLoading] = useState(false);
  const [generateSportResult, setGenerateSportResult] = useState<Record<string, unknown> | null>(null);
  const [sportRateLimit, setSportRateLimit] = useState<{ canGenerate: boolean; retryAfterSeconds: number } | null>(null);
  const [generationPanel, setGenerationPanel] = useState<"legacy" | "fie">("fie");
  const [fieLoading, setFieLoading] = useState(false);
  const [fieResult, setFieResult] = useState<Record<string, unknown> | null>(null);
  const [fieDryRun, setFieDryRun] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectingAll, setSelectingAll] = useState(false);
  const [successCreatedCount, setSuccessCreatedCount] = useState<number | null>(null);

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

  const fetchSportRateLimit = () => {
    fetch("/api/admin/run-generate-events-sport")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { canGenerate?: boolean; retryAfterSeconds?: number } | null) => {
        if (data && typeof data.canGenerate === "boolean")
          setSportRateLimit({ canGenerate: data.canGenerate, retryAfterSeconds: data.retryAfterSeconds ?? 0 });
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSportRateLimit();
    const t = setInterval(fetchSportRateLimit, 8000);
    return () => clearInterval(t);
  }, []);

  const [sportRetryCountdown, setSportRetryCountdown] = useState(0);
  useEffect(() => {
    const sec = sportRateLimit?.retryAfterSeconds ?? 0;
    if (sec <= 0) {
      setSportRetryCountdown(0);
      return;
    }
    setSportRetryCountdown(sec);
    const id = setInterval(() => {
      setSportRetryCountdown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [sportRateLimit?.retryAfterSeconds]);

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

  const selectAllAcrossPages = async () => {
    setSelectingAll(true);
    try {
      const firstPageParams = new URLSearchParams({
        status: statusFilter,
        page: "1",
        limit: "200",
      });
      const firstPageResponse = await fetch(`/api/admin/events?${firstPageParams}`);
      if (!firstPageResponse.ok) throw new Error("Failed to fetch first page");
      const firstPageData: EventsResponse = await firstPageResponse.json();

      const allIds = new Set(firstPageData.events.map((event) => event.id));
      const totalPages = firstPageData.pagination.totalPages;

      if (totalPages > 1) {
        const pageRequests: Promise<Response>[] = [];
        for (let p = 2; p <= totalPages; p += 1) {
          const params = new URLSearchParams({
            status: statusFilter,
            page: p.toString(),
            limit: "200",
          });
          pageRequests.push(fetch(`/api/admin/events?${params}`));
        }

        const pageResponses = await Promise.all(pageRequests);
        const pagePayloads = await Promise.all(
          pageResponses.map(async (response) => {
            if (!response.ok) throw new Error("Failed to fetch one of the pages");
            return (await response.json()) as EventsResponse;
          })
        );

        for (const payload of pagePayloads) {
          for (const event of payload.events) {
            allIds.add(event.id);
          }
        }
      }

      setSelectedIds(allIds);
    } catch (error) {
      console.error("Error selecting all events across pages:", error);
      alert("Errore nel recupero di tutti gli eventi.");
    } finally {
      setSelectingAll(false);
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
    <div className="min-h-screen bg-admin-bg text-fg p-6 md:p-8">
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
            className="inline-flex items-center justify-center bg-primary text-primary-fg px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-[0_0_24px_-6px_rgba(var(--primary-glow),0.45)]"
          >
            + Crea Evento
          </Link>
        </div>

        {/* Pipeline Monitor — daily stats */}
        <DailyStatsBanner />

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

        {/* Generazione eventi — pannello a tab */}
        <div className="mb-6 rounded-2xl bg-white/[0.08] border border-white/10 overflow-hidden">
          {/* Tab header */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setGenerationPanel("fie")}
              className={`flex-1 px-5 py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                generationPanel === "fie"
                  ? "bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400"
                  : "text-fg-muted hover:text-fg hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-base">⚡</span>
              Sport 2.0 — Football Intelligence Engine
            </button>
            <button
              onClick={() => setGenerationPanel("legacy")}
              className={`flex-1 px-5 py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                generationPanel === "legacy"
                  ? "bg-white/[0.08] text-fg border-b-2 border-fg"
                  : "text-fg-muted hover:text-fg hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-base">🔧</span>
              Pipeline Legacy
            </button>
          </div>

          {/* FIE Panel */}
          {generationPanel === "fie" && (
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-fg mb-1">Football Intelligence Engine</h3>
                  <p className="text-xs text-fg-muted leading-relaxed">
                    Pipeline AI multi-agente: RADAR (107+ partite da 28 campionati) → BRAIN (Analyst + Creative + Verifier + Resolver) → FORGE (strutturazione mercati).
                    Genera eventi creativi e diversificati con risoluzione automatica.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={async () => {
                    setFieLoading(true);
                    setFieResult(null);
                    try {
                      const res = await fetch("/api/admin/run-football-engine", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ dryRun: fieDryRun, maxTier: 2, maxMatches: 10, skipResolver: true }),
                      });
                      const data = await res.json();
                      setFieResult(data);
                      if (res.ok && !fieDryRun && (data.created ?? 0) > 0) {
                        setSuccessCreatedCount(data.created ?? 0);
                        fetchEvents();
                        setTimeout(() => fetchEvents(), 2000);
                      }
                    } catch (e) {
                      setFieResult({ error: String(e) });
                    } finally {
                      setFieLoading(false);
                    }
                  }}
                  disabled={fieLoading}
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-500 disabled:opacity-50 font-semibold transition-colors shadow-lg shadow-emerald-600/20"
                >
                  {fieLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Generazione in corso…
                    </span>
                  ) : fieDryRun ? "Anteprima (Dry Run)" : "Genera eventi Sport 2.0"}
                </button>
                <label className="flex items-center gap-2 text-xs text-fg-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={fieDryRun}
                    onChange={(e) => setFieDryRun(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500/30"
                  />
                  Dry Run (anteprima senza pubblicare)
                </label>
              </div>
              {fieResult && (
                <div className="mt-4 rounded-xl bg-black/20 border border-white/10 p-4">
                  {(fieResult as { error?: string }).error ? (
                    <div className="text-red-400 text-sm">{(fieResult as { error?: string }).error}</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-lg font-bold ${(fieResult as { created?: number }).created ? "text-emerald-400" : "text-fg"}`}>
                          {fieDryRun
                            ? `${((fieResult as { candidates?: unknown[] }).candidates ?? []).length} candidati in anteprima`
                            : `${(fieResult as { created?: number }).created ?? 0} eventi creati`}
                        </span>
                        {(fieResult as { hint?: string }).hint && (
                          <span className="text-xs text-amber-400/90">{(fieResult as { hint?: string }).hint}</span>
                        )}
                      </div>
                      {(fieResult as { diagnostics?: Record<string, unknown> }).diagnostics && (
                        <div className="mb-3">
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2">
                            {[
                              { label: "RADAR", value: (fieResult.diagnostics as Record<string, number>)?.radarMatchCount, sub: "partite" },
                              { label: "News", value: (fieResult.diagnostics as Record<string, number>)?.radarNewsSignalCount, sub: "segnali" },
                              { label: "Analyst", value: (fieResult.diagnostics as Record<string, number>)?.brainInsightCount, sub: "insight" },
                              { label: "Creative", value: (fieResult.diagnostics as Record<string, number>)?.brainIdeaCount, sub: "idee" },
                              { label: "Verifier", value: (fieResult.diagnostics as Record<string, number>)?.brainApprovedCount, sub: "ok" },
                              { label: "FORGE", value: (fieResult.diagnostics as Record<string, number>)?.forgeCandidateCount, sub: "candidati" },
                            ].map((stat) => (
                              <div key={stat.label} className="bg-white/[0.06] rounded-lg p-2 text-center">
                                <div className={`text-base font-bold ${(stat.value ?? 0) === 0 ? "text-amber-400" : "text-emerald-400"}`}>{stat.value ?? 0}</div>
                                <div className="text-[9px] text-fg font-medium">{stat.label}</div>
                                <div className="text-[9px] text-fg-muted">{stat.sub}</div>
                              </div>
                            ))}
                          </div>
                          {((fieResult.diagnostics as Record<string, number>)?.totalDurationMs ?? 0) > 0 && (
                            <div className="text-[10px] text-fg-muted text-right">
                              Pipeline completata in {(((fieResult.diagnostics as Record<string, number>)?.totalDurationMs ?? 0) / 1000).toFixed(1)}s
                            </div>
                          )}
                        </div>
                      )}
                      {fieDryRun && (fieResult as { candidates?: Array<{ title: string; marketType?: string; closesAt?: string }> }).candidates && (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                          {((fieResult as { candidates?: Array<{ title: string; marketType?: string; closesAt?: string }> }).candidates ?? []).map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-white/5 last:border-0">
                              <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                                {c.marketType ?? "BINARY"}
                              </span>
                              <span className="text-fg truncate">{c.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {!fieDryRun && (fieResult as { pipeline?: Record<string, unknown> }).pipeline && (
                        <pre className="text-[10px] bg-black/30 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto text-fg-muted">
                          {JSON.stringify((fieResult as { pipeline?: Record<string, unknown> }).pipeline, null, 2)}
                        </pre>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Legacy Panel */}
          {generationPanel === "legacy" && (
          <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold text-fg">Pipeline Legacy</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-fg-muted">precedente</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={async () => {
                setGenerateLoading(true);
                setGenerateResult(null);
                try {
                  const res = await fetch("/api/admin/run-generate-events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ maxTotal: 5 }) });
                  const data = await res.json();
                  setGenerateResult(data);
                  if (res.ok && (data.created ?? 0) > 0) {
                    setSuccessCreatedCount(data.created ?? 0);
                    fetchEvents();
                    setTimeout(() => fetchEvents(), 2000);
                  }
                } catch (e) {
                  setGenerateResult({ error: String(e) });
                } finally {
                  setGenerateLoading(false);
                }
              }}
              disabled={
                generateLoading ||
                generateReplicaLoading ||
                generatePolymarketLoading ||
                generatePolymarketV2Loading ||
                generateSportLoading
              }
              className="bg-primary text-primary-fg px-5 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
            >
              {generateLoading ? "Generazione…" : "Genera eventi home (max 5)"}
            </button>
            {generateResult && (
              <span className="text-sm text-fg-muted">
                {typeof (generateResult as { created?: number }).created === "number"
                  ? `Home: ${(generateResult as { created?: number }).created} creati`
                  : (generateResult as { error?: string }).error
                    ? "Errore"
                    : "Completato"}
              </span>
            )}
            <span className="w-px h-6 bg-border dark:bg-white/10" aria-hidden />
            <button
              onClick={async () => {
                setGenerateReplicaLoading(true);
                setGenerateReplicaResult(null);
                try {
                  const res = await fetch("/api/admin/run-generate-events-replica", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ maxTotal: 25 }),
                  });
                  const data = await res.json();
                  setGenerateReplicaResult(data);
                  if (res.ok && (data.created ?? 0) > 0) {
                    setSuccessCreatedCount(data.created ?? 0);
                    fetchEvents();
                    setTimeout(() => fetchEvents(), 2000);
                  }
                } catch (e) {
                  setGenerateReplicaResult({ error: String(e) });
                } finally {
                  setGenerateReplicaLoading(false);
                }
              }}
              disabled={
                generateLoading ||
                generateReplicaLoading ||
                generatePolymarketLoading ||
                generatePolymarketV2Loading ||
                generateSportLoading
              }
              className="bg-primary text-primary-fg px-5 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
            >
              {generateReplicaLoading ? "Generazione…" : "Genera eventi Replica"}
            </button>
            {generateReplicaResult && (
              <span className="text-sm text-fg-muted">
                {typeof (generateReplicaResult as { created?: number }).created === "number"
                  ? `Replica: ${(generateReplicaResult as { created?: number }).created} creati`
                  : (generateReplicaResult as { error?: string }).error
                    ? "Errore"
                    : "Completato"}
              </span>
            )}
            <span className="w-px h-6 bg-border dark:bg-white/10" aria-hidden />
            <button
              onClick={async () => {
                setGeneratePolymarketLoading(true);
                setGeneratePolymarketResult(null);
                try {
                  const res = await fetch("/api/admin/run-generate-events-polymarket", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ maxTotal: 25 }),
                  });
                  const data = await res.json();
                  setGeneratePolymarketResult(data);
                  if (res.ok && (data.created ?? 0) > 0) {
                    setSuccessCreatedCount(data.created ?? 0);
                    fetchEvents();
                    setTimeout(() => fetchEvents(), 2000);
                  }
                } catch (e) {
                  setGeneratePolymarketResult({ error: String(e) });
                } finally {
                  setGeneratePolymarketLoading(false);
                }
              }}
              disabled={
                generateLoading ||
                generateReplicaLoading ||
                generatePolymarketLoading ||
                generatePolymarketV2Loading ||
                generateSportLoading
              }
              className="bg-primary text-primary-fg px-5 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
            >
              {generatePolymarketLoading
                ? "Generazione…"
                : "Generazione eventi polymarket"}
            </button>
            {generatePolymarketResult && (
              <span className="text-sm text-fg-muted">
                {typeof (generatePolymarketResult as { created?: number }).created === "number"
                  ? `Polymarket: ${(generatePolymarketResult as { created?: number }).created} creati`
                  : (generatePolymarketResult as { error?: string }).error
                    ? "Errore"
                    : "Completato"}
              </span>
            )}
            <span className="w-px h-6 bg-border dark:bg-white/10" aria-hidden />
            <button
              onClick={async () => {
                setGeneratePolymarketV2Loading(true);
                setGeneratePolymarketV2Result(null);
                try {
                  const parsedMax = Number(polymarketV2MaxTotalInput);
                  const maxTotal = Number.isFinite(parsedMax)
                    ? Math.max(1, Math.min(800, Math.round(parsedMax)))
                    : 500;
                  const res = await fetch("/api/admin/run-generate-events-polymarket-v2", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      maxTotal,
                    }),
                  });
                  const data = await res.json();
                  setGeneratePolymarketV2Result(data);
                  if (res.ok && (data.created ?? 0) > 0) {
                    setSuccessCreatedCount(data.created ?? 0);
                    fetchEvents();
                    setTimeout(() => fetchEvents(), 2000);
                  }
                } catch (e) {
                  setGeneratePolymarketV2Result({ error: String(e) });
                } finally {
                  setGeneratePolymarketV2Loading(false);
                }
              }}
              disabled={
                generateLoading ||
                generateReplicaLoading ||
                generatePolymarketLoading ||
                generatePolymarketV2Loading ||
                generateSportLoading
              }
              className="bg-primary text-primary-fg px-5 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
            >
              {generatePolymarketV2Loading
                ? "Generazione…"
                : "Generazione eventi Polymarket 2.0"}
            </button>
            <label className="text-xs text-fg-muted inline-flex items-center gap-1">
              max
              <input
                type="number"
                min={1}
                max={800}
                step={10}
                inputMode="numeric"
                placeholder="500"
                value={polymarketV2MaxTotalInput}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setPolymarketV2MaxTotalInput(e.target.value)}
                className="w-20 rounded border border-white/10 bg-white/[0.06] px-2 py-1 text-fg"
              />
            </label>
            {generatePolymarketV2Result && (
              <span className="text-sm text-fg-muted flex flex-col items-start gap-0.5 max-w-xl">
                {typeof (generatePolymarketV2Result as { created?: number }).created === "number"
                  ? `Polymarket 2.0: ${(generatePolymarketV2Result as { created?: number }).created} creati, ${(generatePolymarketV2Result as { updatedCount?: number }).updatedCount ?? 0} aggiornati`
                  : (generatePolymarketV2Result as { error?: string }).error
                    ? "Errore"
                    : "Completato"}
                <span className="text-xs text-fg-subtle">
                  {(generatePolymarketV2Result as { sourceFetchedCount?: number }).sourceFetchedCount ?? 0} trovati ·{" "}
                  {(generatePolymarketV2Result as { validityPassedCount?: number }).validityPassedCount ?? 0} validi ·{" "}
                  {(generatePolymarketV2Result as { binaryCount?: number }).binaryCount ?? 0} binari ·{" "}
                  {(generatePolymarketV2Result as { multiOutcomeCount?: number }).multiOutcomeCount ?? 0} multi
                </span>
                {(generatePolymarketV2Result as { reasonsCount?: Record<string, number> }).reasonsCount && (
                  <pre className="text-[10px] text-left bg-black/20 dark:bg-white/10 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto mt-1">
                    {JSON.stringify((generatePolymarketV2Result as { reasonsCount?: Record<string, number> }).reasonsCount, null, 2)}
                  </pre>
                )}
              </span>
            )}
            <span className="w-px h-6 bg-border dark:bg-white/10" aria-hidden />
            <button
              onClick={async () => {
                setGenerateSportLoading(true);
                setGenerateSportResult(null);
                try {
                  const res = await fetch("/api/admin/run-generate-events-sport", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ maxTotal: 200 }) });
                  const data = await res.json();
                  setGenerateSportResult(data);
                  if (res.status === 429 && data.retryAfterSeconds != null)
                    setSportRateLimit({ canGenerate: false, retryAfterSeconds: data.retryAfterSeconds });
                  if (res.ok) {
                    fetchSportRateLimit();
                    if ((data.created ?? 0) > 0) {
                      fetchEvents();
                      setTimeout(() => fetchEvents(), 2000);
                    }
                  }
                } catch (e) {
                  setGenerateSportResult({ error: String(e) });
                } finally {
                  setGenerateSportLoading(false);
                }
              }}
              disabled={
                generateLoading ||
                generateReplicaLoading ||
                generatePolymarketLoading ||
                generatePolymarketV2Loading ||
                generateSportLoading ||
                sportRetryCountdown > 0
              }
              className="bg-primary text-primary-fg px-5 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
            >
              {generateSportLoading ? "Generazione…" : "Genera eventi sport (max 200)"}
            </button>
            <p className="text-xs text-fg-muted w-full mt-0.5">
              {sportRetryCountdown > 0
                ? `Attendere ${sportRetryCountdown} s (limite API 10 req/min)`
                : sportRateLimit?.canGenerate !== false
                  ? "Puoi generare. Competizioni: Serie A, Champions League, Premier League, La Liga."
                  : "Attendere prima di rigenerare (limite API 10 req/min)."}
            </p>
            <a
              href="/api/admin/check-sport-api-env"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-fg-muted hover:text-fg underline"
            >
              Verifica chiave API
            </a>
            {generateSportResult && (
              <span className="text-sm text-fg-muted flex flex-col items-start gap-0.5 max-w-md">
                {typeof (generateSportResult as { created?: number }).created === "number"
                  ? `Sport: ${(generateSportResult as { created?: number }).created} creati`
                  : (generateSportResult as { error?: string }).error
                    ? `Errore: ${(generateSportResult as { details?: string }).details ?? (generateSportResult as { error?: string }).error ?? ""}`
                    : "Completato"}
                {(generateSportResult as { hint?: string }).hint && (
                  <span className="text-xs text-amber-400/90">
                    {(generateSportResult as { hint?: string }).hint}
                  </span>
                )}
                {(generateSportResult as { diagnostic?: Record<string, unknown> }).diagnostic && (
                  <pre className="text-[10px] text-left bg-black/20 dark:bg-white/10 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto mt-1">
                    {JSON.stringify((generateSportResult as { diagnostic?: Record<string, unknown> }).diagnostic, null, 2)}
                  </pre>
                )}
              </span>
            )}
          </div>
          </div>
          )}
        </div>

        {/* Filtri + toolbar visibilità + tabella unica */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-fg-muted">Stato:</span>
          {[
            { id: "all" as StatusFilter, label: "Tutti" },
            { id: "pending" as StatusFilter, label: "Aperti" },
            { id: "pending_resolution" as StatusFilter, label: "Da risolvere" },
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
                  ? "bg-primary text-primary-fg"
                  : "bg-white/[0.06] text-fg-muted hover:bg-white/[0.1] border border-white/10"
              }`}
            >
              {btn.label}
            </button>
          ))}
          <span className="w-px h-6 bg-border dark:bg-white/10 mx-1" aria-hidden />
          <button
            type="button"
            onClick={() => {
              setSelectionMode((v) => !v);
              if (selectionMode) setSelectedIds(new Set());
            }}
            className="bg-surface/80 text-fg border border-border dark:border-white/10 px-4 py-2 rounded-xl hover:bg-surface font-medium transition-colors text-sm"
          >
            {selectionMode ? "Annulla" : "Seleziona"}
          </button>
          {selectionMode && (
            <>
              <button
                type="button"
                onClick={selectAllAcrossPages}
                disabled={selectingAll}
                className="bg-surface/80 text-fg border border-border dark:border-white/10 px-4 py-2 rounded-xl hover:bg-surface font-medium transition-colors text-sm"
              >
                {selectingAll ? "Selezione..." : "Tutti"}
              </button>
              {selectedIds.size > 0 && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Nascondere ${selectedIds.size} evento/i da Home e Esplora?`)) return;
                      try {
                        const res = await fetch("/api/admin/events/hide", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ eventIds: Array.from(selectedIds) }),
                        });
                        const data = await res.json();
                        if (res.ok && data.updated != null) {
                          setSelectedIds(new Set());
                          setSelectionMode(false);
                          fetchEvents();
                          alert(`${data.updated} nascosti.`);
                        } else alert(data.error || "Errore.");
                      } catch {
                        alert("Errore di rete.");
                      }
                    }}
                    className="bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 font-medium transition-colors text-sm"
                  >
                    Nascondi ({selectedIds.size})
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/admin/events/show", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ eventIds: Array.from(selectedIds) }),
                        });
                        const data = await res.json();
                        if (res.ok && data.updated != null) {
                          setSelectedIds(new Set());
                          setSelectionMode(false);
                          fetchEvents();
                          alert(`${data.updated} resi visibili.`);
                        } else alert(data.error || "Errore.");
                      } catch {
                        alert("Errore di rete.");
                      }
                    }}
                    className="bg-success/90 text-white px-4 py-2 rounded-xl hover:bg-success font-medium transition-colors text-sm"
                  >
                    Mostra ({selectedIds.size})
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        !confirm(
                          `Eliminare definitivamente ${selectedIds.size} evento/i? Verranno rimossi da piattaforma e database. L'operazione non si può annullare.`
                        )
                      )
                        return;
                      try {
                        const res = await fetch("/api/admin/events/delete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ eventIds: Array.from(selectedIds) }),
                        });
                        const data = await res.json();
                        if (res.ok && data.deleted != null) {
                          setSelectedIds(new Set());
                          setSelectionMode(false);
                          fetchEvents();
                          alert(`${data.deleted} eliminati.`);
                        } else alert(data.error || "Errore.");
                      } catch {
                        alert("Errore di rete.");
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 font-medium transition-colors text-sm"
                  >
                    Elimina ({selectedIds.size})
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Tabella eventi unica */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="mt-4 text-fg-muted">Caricamento eventi...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white/[0.08] border border-white/10">
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
            <div className="rounded-2xl overflow-hidden bg-white/[0.08] border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/[0.06]">
                    <tr>
                      {selectionMode && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider w-10">
                          <span className="sr-only">Seleziona</span>
                        </th>
                      )}
                      <th className="px-5 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider text-right">
                        Previsioni
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider text-right">
                        Crediti
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Tipo mercato
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Visibilità
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-fg-muted uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {events.map((event) => {
                      const isHidden = event.hidden || event.sourceType === "HIDDEN";
                      return (
                        <tr
                          key={event.id}
                          className={`hover:bg-white/[0.06] transition-colors ${selectedIds.has(event.id) ? "bg-primary/10" : ""}`}
                        >
                          {selectionMode && (
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(event.id)}
                                onChange={(e) => {
                                  setSelectedIds((prev) => {
                                    const next = new Set(prev);
                                    if (e.target.checked) next.add(event.id);
                                    else next.delete(event.id);
                                    return next;
                                  });
                                }}
                                className="rounded border-border"
                                aria-label={`Seleziona ${event.title.slice(0, 30)}`}
                              />
                            </td>
                          )}
                          <td className="px-5 py-3">
                            <div>
                              <Link
                                href={`/events/${event.id}`}
                                className="text-sm font-medium text-fg hover:text-primary transition-colors line-clamp-2"
                              >
                                {event.title}
                              </Link>
                              {event.description && (
                                <p className="text-xs text-fg-muted mt-0.5 line-clamp-1">
                                  {event.description}
                                </p>
                              )}
                              <p className="text-xs text-fg-subtle mt-0.5">
                                Chiude {new Date(event.closesAt).toLocaleDateString("it-IT")}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                                event.category
                              )}`}
                            >
                              {event.category}
                            </span>
                            {event.sourceType === "SPORT" && (
                              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success" title="Visibile in /sport">
                                Sport
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-sm text-fg font-numeric text-right">
                            {event._count.predictions}
                          </td>
                          <td className="px-5 py-3 text-sm text-fg font-numeric text-right">
                            {(event.totalCredits ?? 0).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-sm text-fg-muted">
                            {event.marketType
                              ? getMarketTypeLabel(event.marketType as MarketTypeId)
                              : "—"}
                          </td>
                          <td className="px-5 py-3">
                            {event.resolved ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  event.outcome === "YES"
                                    ? "bg-success/10 text-success"
                                    : "bg-danger/10 text-danger"
                                }`}
                              >
                                {event.outcome === "YES" ? "SÌ" : "NO"}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                                Aperto
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {isHidden ? (
                              <span className="text-xs text-fg-muted">Nascosto</span>
                            ) : (
                              <span className="text-xs text-success">Visibile</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {!event.resolved && (
                                <>
                                  <button
                                    onClick={() => handleResolve(event.id, "YES")}
                                    className="text-success hover:opacity-80 bg-success/10 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    SÌ
                                  </button>
                                  <button
                                    onClick={() => handleResolve(event.id, "NO")}
                                    className="text-danger hover:opacity-80 bg-danger/10 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    NO
                                  </button>
                                </>
                              )}
                              <Link
                                href={`/admin/events/${event.id}/edit`}
                                className="text-xs text-fg-subtle hover:text-primary transition-colors"
                              >
                                Modifica
                              </Link>
                              {isHidden ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch("/api/admin/events/show", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ eventIds: [event.id] }),
                                      });
                                      if (res.ok) fetchEvents();
                                    } catch {}
                                  }}
                                  className="text-xs text-success hover:underline"
                                >
                                  Mostra
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch("/api/admin/events/hide", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ eventIds: [event.id] }),
                                      });
                                      if (res.ok) fetchEvents();
                                    } catch {}
                                  }}
                                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                                >
                                  Nascondi
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      "Eliminare definitivamente questo evento? Verrà rimosso da piattaforma e database. L'operazione non si può annullare."
                                    )
                                  )
                                    return;
                                  try {
                                    const res = await fetch("/api/admin/events/delete", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ eventIds: [event.id] }),
                                    });
                                    const data = await res.json();
                                    if (res.ok && data.deleted != null) {
                                      fetchEvents();
                                    } else alert(data.error || "Errore.");
                                  } catch {
                                    alert("Errore di rete.");
                                  }
                                }}
                                className="text-xs text-red-600 dark:text-red-400 hover:underline"
                              >
                                Elimina
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

        {/* Popup congratulazioni dopo generazione eventi */}
        {successCreatedCount != null && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-popup-title"
          >
            <div className="bg-admin-bg border border-border dark:border-white/10 rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
              <button
                type="button"
                onClick={() => setSuccessCreatedCount(null)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-fg-muted hover:bg-surface/80 hover:text-fg transition-colors"
                aria-label="Chiudi"
              >
                <span className="text-xl leading-none">×</span>
              </button>
              <h2 id="success-popup-title" className="text-lg font-semibold text-fg pr-8">
                Congratulazioni!
              </h2>
              <p className="mt-2 text-fg-muted">
                {successCreatedCount === 1
                  ? "1 evento creato!"
                  : `${successCreatedCount} eventi creati!`}
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
