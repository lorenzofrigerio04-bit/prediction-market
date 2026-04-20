"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyStatsPayload, FieRun } from "@/app/api/admin/daily-stats/route";

const REFRESH_MS = 60_000;

function useTimeAgo(isoDate: string | null): string {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!isoDate) { setLabel("—"); return; }
    const update = () => {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffMin = Math.floor(diffMs / 60_000);
      const diffH = Math.floor(diffMin / 60);
      if (diffMin < 1) setLabel("Adesso");
      else if (diffMin < 60) setLabel(`${diffMin} min fa`);
      else if (diffH < 24) setLabel(`${diffH}h fa`);
      else setLabel("Ieri");
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [isoDate]);
  return label;
}

function useCountdown(isoDate: string): string {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const update = () => {
      const diffMs = new Date(isoDate).getTime() - Date.now();
      if (diffMs <= 0) { setLabel("Ora"); return; }
      const h = Math.floor(diffMs / 3_600_000);
      const m = Math.floor((diffMs % 3_600_000) / 60_000);
      setLabel(h > 0 ? `${h}h ${m}m` : `${m} min`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [isoDate]);
  return label;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 60_000) return `${(ms / 1000).toFixed(0)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

// Mini sparkline: 3 slot (00:00, 08:00, 16:00 UTC) → shows bar per slot
function RunSparkline({ runs, date }: { runs: FieRun[]; date: string }) {
  const SLOTS = [0, 8, 16]; // UTC hours

  const slotData = SLOTS.map((h) => {
    const slotStart = new Date(`${date}T${String(h).padStart(2, "0")}:00:00Z`);
    const slotEnd = new Date(slotStart.getTime() + 8 * 3_600_000);
    const slotRuns = runs.filter((r) => {
      const t = new Date(r.runAt).getTime();
      return t >= slotStart.getTime() && t < slotEnd.getTime();
    });
    const total = slotRuns.reduce((s, r) => s + r.eventsCreated, 0);
    const ran = slotRuns.length > 0;
    return { label: `${String(h).padStart(2, "0")}:00`, total, ran };
  });

  const maxVal = Math.max(...slotData.map((s) => s.total), 1);

  return (
    <div className="flex items-end gap-2" aria-label="Grafico run giornalieri FIE" role="img">
      {slotData.map((slot) => {
        const heightPct = slot.ran ? Math.max(18, (slot.total / maxVal) * 100) : 12;
        return (
          <div key={slot.label} className="flex flex-col items-center gap-1 group/bar">
            <span className="text-[9px] font-semibold tabular-nums text-white/60 opacity-0 group-hover/bar:opacity-100 transition-opacity">
              {slot.ran ? slot.total : "—"}
            </span>
            <div className="relative w-7 rounded-t-md transition-all duration-500 ease-out"
              style={{
                height: `${heightPct}%`,
                minHeight: "4px",
                maxHeight: "100%",
                background: slot.ran
                  ? "linear-gradient(to top, #10b981, #34d399)"
                  : "rgba(255,255,255,0.08)",
                boxShadow: slot.ran ? "0 0 10px rgba(52,211,153,0.4)" : "none",
              }}
            />
            <span className="text-[9px] font-medium text-white/40">{slot.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCell({
  label,
  value,
  accent = false,
  sublabel,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-widest text-white/35">
        {label}
      </span>
      <span
        className={`text-xl font-bold tabular-nums leading-none ${
          accent ? "text-emerald-400" : "text-white/90"
        }`}
      >
        {value}
      </span>
      {sublabel && (
        <span className="text-[10px] text-white/40">{sublabel}</span>
      )}
    </div>
  );
}

function RunHistoryRow({ run, index }: { run: FieRun; index: number }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/[0.06] last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden />
        <span className="text-xs font-mono text-white/60">{formatTime(run.runAt)}</span>
      </div>
      <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
          style={{ width: `${Math.min(100, (run.eventsCreated / 20) * 100)}%` }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums text-emerald-400 w-14 text-right">
        {run.eventsCreated} eventi
      </span>
      <span className="text-[10px] text-white/35 w-10 text-right">
        {formatDuration(run.durationMs)}
      </span>
      {run.diagnostics && (
        <div className="hidden sm:flex items-center gap-2 text-[9px] text-white/30">
          {run.diagnostics.radarMatchCount != null && (
            <span>⚽ {run.diagnostics.radarMatchCount}</span>
          )}
          {run.diagnostics.brainApprovedCount != null && (
            <span>🧠 {run.diagnostics.brainApprovedCount}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function DailyStatsBanner() {
  const [data, setData] = useState<DailyStatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetch_ = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/daily-stats", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => {
    const id = setInterval(() => fetch_(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [fetch_]);

  const lastRunAgo = useTimeAgo(data?.fie.lastRunAt ?? null);
  const nextRunIn = useCountdown(data?.fie.nextRunAt ?? new Date(Date.now() + 3_600_000).toISOString());

  const today = data
    ? new Date(data.date).toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).replace(/^\w/, (c) => c.toUpperCase())
    : "";

  return (
    <div
      className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.12]"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,42,80,0.95) 0%, rgba(5,28,58,0.98) 50%, rgba(2,18,42,1) 100%)",
        boxShadow:
          "0 0 0 1px rgba(16,185,129,0.15) inset, 0 20px 60px -20px rgba(0,0,0,0.7), 0 0 80px -40px rgba(16,185,129,0.12)",
      }}
    >
      {/* Ambient glow top-left */}
      <div
        className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Header row */}
      <div className="relative flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          {/* Pulse indicator */}
          <div className="relative flex items-center justify-center">
            <span className="absolute h-5 w-5 rounded-full bg-emerald-500/25 animate-ping" aria-hidden />
            <span className="relative h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white/95">
              Pipeline Monitor
            </h2>
            <p className="text-[11px] text-white/40">{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetch_(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-white/50 transition-all hover:bg-white/10 hover:text-white/80"
            aria-label="Aggiorna statistiche"
          >
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Aggiorna
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-white/50 transition-all hover:bg-white/10 hover:text-white/80"
            aria-expanded={expanded}
          >
            {expanded ? "Comprimi" : "Dettagli"}
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden
            >
              <path fillRule="evenodd" d="M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main metrics */}
      {loading && !data ? (
        <div className="animate-pulse px-6 py-5 flex gap-8">
          {[40, 28, 32, 24].map((w, i) => (
            <div key={i} className="space-y-2">
              <div className={`h-2 w-${w} rounded bg-white/10`} />
              <div className="h-6 w-16 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="px-6 py-5">
          {/* Metric grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 mb-5">
            <StatCell
              label="Eventi oggi"
              value={data.fie.eventsToday}
              accent={data.fie.eventsToday > 0}
              sublabel="dalla FIE"
            />
            <StatCell
              label="Run oggi"
              value={`${data.fie.runsToday} / 3`}
              sublabel="pianificati"
            />
            <StatCell
              label="Ultima run"
              value={lastRunAgo}
              sublabel={
                data.fie.lastRunAt
                  ? `${data.fie.lastRunEventsCreated} eventi · ${formatDuration(data.fie.lastRunDurationMs)}`
                  : "nessuna run oggi"
              }
            />
            <StatCell
              label="Prossima run"
              value={nextRunIn}
              sublabel="ogni 8h · 00/08/16 UTC"
            />
          </div>

          {/* Second row: sparkline + total active */}
          <div className="flex items-center gap-8">
            {/* Sparkline */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1">
                Run giornaliere
              </span>
              <div className="h-16">
                <RunSparkline runs={data.fie.runs} date={data.date} />
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-white/[0.06]" aria-hidden />

            {/* Total active events */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                Mercati attivi
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums text-white/95">
                  {data.totalSportEventsActive}
                </span>
                <span className="text-xs text-white/40">sport 2.0</span>
              </div>
              <span className="text-[10px] text-white/35">sourceType = SPORT, open</span>
            </div>

            {/* Status badge */}
            <div className="ml-auto">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3.5 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" aria-hidden />
                <span className="text-xs font-semibold text-emerald-400">FIE Attiva</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Expanded: run history */}
      {expanded && data && data.fie.runs.length > 0 && (
        <div className="border-t border-white/[0.07] px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
            Storico run di oggi
          </p>
          <div>
            {data.fie.runs.map((run, i) => (
              <RunHistoryRow key={run.runAt} run={run} index={i} />
            ))}
          </div>
        </div>
      )}

      {expanded && data && data.fie.runs.length === 0 && (
        <div className="border-t border-white/[0.07] px-6 py-4">
          <p className="text-xs text-white/30 text-center py-2">
            Nessuna run registrata oggi. La prima è alle 00:00 UTC.
          </p>
        </div>
      )}
    </div>
  );
}
