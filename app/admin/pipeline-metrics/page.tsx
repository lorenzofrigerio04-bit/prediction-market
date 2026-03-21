"use client";

import { useState, useEffect } from "react";

interface PipelineMetrics {
  markets_generated_count: number;
  markets_rejected_count: number;
  avg_quality_score: number | null;
  active_markets_count: number;
  image_generation_success_rate: number | null;
}

interface MetricsResponse {
  ok: boolean;
  hoursBack: number;
  metrics: PipelineMetrics;
  timestamp: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  format = "number",
}: {
  title: string;
  value: number | null;
  subtitle?: string;
  format?: "number" | "percent";
}) {
  const display =
    value == null
      ? "—"
      : format === "percent"
        ? `${(value * 100).toFixed(1)}%`
        : value.toLocaleString();
  return (
    <div className="rounded-xl border border-border dark:border-white/10 bg-surface/30 p-4">
      <p className="text-sm text-fg-muted mb-1">{title}</p>
      <p className="text-2xl font-bold text-fg">{display}</p>
      {subtitle && <p className="text-xs text-fg-subtle mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AdminPipelineMetricsPage() {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoursBack, setHoursBack] = useState(24);

  useEffect(() => {
    fetchMetrics();
  }, [hoursBack]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pipeline-metrics?hoursBack=${hoursBack}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.details || `HTTP ${res.status}`);
      }
      const data: MetricsResponse = await res.json();
      setMetrics(data.metrics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore caricamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg text-fg p-6 md:p-8">
      <h1 className="text-2xl font-bold text-fg mb-2">
        Pipeline Event Gen v2
      </h1>
      <p className="text-fg-muted mb-6">
        Metriche della pipeline di generazione eventi (Trend → Candidate → Validator → Scoring → Publish).
      </p>

      <div className="mb-6 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-fg-muted">Periodo:</span>
          <select
            value={hoursBack}
            onChange={(e) => setHoursBack(Number(e.target.value))}
            className="px-3 py-2 border border-border dark:border-white/10 rounded-xl bg-white/5 text-fg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value={24}>Ultime 24 ore</option>
            <option value={48}>Ultime 48 ore</option>
            <option value={168}>Ultimi 7 giorni</option>
          </select>
        </label>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-primary text-primary-fg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Caricamento…" : "Aggiorna"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && !metrics ? (
        <p className="text-fg-muted">Caricamento metriche…</p>
      ) : metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard
            title="Markets generati"
            value={metrics.markets_generated_count}
            subtitle={`ultime ${hoursBack}h`}
          />
          <MetricCard
            title="Markets rifiutati"
            value={metrics.markets_rejected_count}
            subtitle={`ultime ${hoursBack}h`}
          />
          <MetricCard
            title="Qualità media"
            value={metrics.avg_quality_score}
            subtitle="0–1"
            format="percent"
          />
          <MetricCard
            title="Markets attivi"
            value={metrics.active_markets_count}
            subtitle="status=OPEN, sourceType=NEWS"
          />
          <MetricCard
            title="Successo immagini"
            value={metrics.image_generation_success_rate}
            subtitle="SUCCESS / (SUCCESS + FAILED)"
            format="percent"
          />
        </div>
      ) : null}
    </div>
  );
}
