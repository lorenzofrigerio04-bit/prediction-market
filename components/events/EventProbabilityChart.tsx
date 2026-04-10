"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceArea,
} from "recharts";

interface BinaryPoint {
  t: string;
  yesPct: number;
}

interface MultiPoint {
  t: string;
  outcomePctByKey: Record<string, number>;
}

interface OutcomeOption {
  key: string;
  label: string;
}

interface HistoryResponse {
  mode?: "binary" | "multi";
  points?: Array<BinaryPoint | MultiPoint>;
  outcomes?: OutcomeOption[];
}

interface ChartSeries {
  field: string;
  key: string;
  label: string;
  color: string;
  glow: string;
}

interface EventProbabilityChartProps {
  eventId: string;
  range?: "24h" | "7d" | "30d";
  /** Quando cambia (es. dopo una previsione), il grafico si aggiorna */
  refetchTrigger?: number;
  /** Layout standalone: titolo centrato, grafico centrato con assi bilanciati */
  layout?: "default" | "standalone";
  /** Numero di previsioni sull’evento: se 0 si mostra CTA "Diventa il primo...", altrimenti il grafico */
  predictionsCount?: number;
  /** Tema: light per sfondo bianco (Kalshi), dark per sfondo scuro */
  theme?: "light" | "dark";
  /** Formattazione asse/tooltip: percent oppure crediti (0-100c) */
  valueUnit?: "percent" | "credits";
  /** Pagina dettaglio: niente titolo sopra, niente box, altezza mobile-first */
  embeddedInPage?: boolean;
  /** Multi-outcome: opzioni da usare come fallback label legenda */
  outcomeOptions?: OutcomeOption[];
}

function formatAxisTime(iso: string, range: string): string {
  const d = new Date(iso);
  if (range === "24h") {
    return d.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (range === "7d" || range === "30d") {
    return d.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    });
  }
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export default function EventProbabilityChart({
  eventId,
  range = "7d",
  refetchTrigger,
  layout = "default",
  predictionsCount = 0,
  theme = "dark",
  valueUnit = "percent",
  embeddedInPage = false,
  outcomeOptions,
}: EventProbabilityChartProps) {
  const isStandalone = layout === "standalone";
  const isLight = theme === "light";
  const chartHeadingText = valueUnit === "credits" ? "Prezzi nel tempo" : "Andamento probabilità nel tempo";
  const gridStroke = isLight ? "rgb(148 163 184 / 0.28)" : "rgb(148 163 184 / 0.24)";
  const axisStroke = isLight ? "rgb(100 116 139 / 0.7)" : "rgb(148 163 184 / 0.7)";
  const tickFill = isLight ? "rgb(71 85 105)" : "rgb(148 163 184 / 0.9)";
  const axisLineStroke = isLight ? "rgb(148 163 184 / 0.35)" : "rgb(148 163 184 / 0.35)";
  // Palette multi-outcome stile market chart (come riferimenti Polymarket/Kalshi).
  const colorPalette = isLight
    ? ["#2F8DFF", "#6AB8FF", "#F2B705", "#ED8A1C", "#30CFAF", "#9D8CFF", "#FF6E84", "#5B9DFF"]
    : ["#338FFF", "#82C5FF", "#F5C324", "#F59A23", "#3AD8B8", "#A897FF", "#FF7F97", "#6DAEFF"];
  const formatValue = useCallback(
    (value: number | null | undefined) => {
      if (value == null || !Number.isFinite(value)) return "—";
      return valueUnit === "credits" ? `${Number(value).toFixed(1)}c` : `${Number(value).toFixed(1)}%`;
    },
    [valueUnit]
  );
  const [history, setHistory] = useState<HistoryResponse>({ mode: "binary", points: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(() => {
    return fetch(`/api/events/${eventId}/probability-history?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore caricamento");
        return res.json();
      })
      .then((data: HistoryResponse) => ({
        mode: data.mode ?? "binary",
        points: data.points ?? [],
        outcomes: data.outcomes ?? outcomeOptions ?? [],
      }));
  }, [eventId, range, outcomeOptions]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    fetchHistory()
      .then((res) => {
        if (!cancelled) setHistory(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Errore");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, range, refetchTrigger, fetchHistory]);

  useEffect(() => {
    if (!eventId) return;
    const interval = setInterval(() => {
      fetchHistory()
        .then((res) => setHistory(res))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [eventId, fetchHistory]);

  const isMultiOutcome = history.mode === "multi";
  const outcomeDefs = (history.outcomes && history.outcomes.length >= 2 ? history.outcomes : outcomeOptions ?? []).map((o) => ({
    key: o.key,
    label: o.label,
  }));

  const seriesDefs: ChartSeries[] = useMemo(() => {
    if (isMultiOutcome && outcomeDefs.length >= 2) {
      return outcomeDefs.map((opt, idx) => {
        const color = colorPalette[idx % colorPalette.length];
        const glow = "none";
        return {
          field: `outcome_${idx}`,
          key: opt.key,
          label: opt.label,
          color,
          glow,
        };
      });
    }
    return [
      {
        field: "yesPct",
        key: "YES",
        label: "SÌ",
        color: isLight ? "#35C38A" : "#4ED9A0",
        glow: isLight ? "none" : "drop-shadow(0 0 5px rgb(78 217 160 / 0.28))",
      },
      {
        field: "noPct",
        key: "NO",
        label: "NO",
        color: isLight ? "#FF6B7A" : "#FF7F90",
        glow: isLight ? "none" : "drop-shadow(0 0 5px rgb(255 127 144 / 0.28))",
      },
    ];
  }, [isMultiOutcome, outcomeDefs, colorPalette, isLight]);

  const { data, isEmpty, timeDomain } = useMemo(() => {
    const rows = (history.points ?? []).map((rawPoint) => {
      const p = rawPoint as MultiPoint & BinaryPoint;
      const time = new Date(p.t).getTime();
      const base = {
        t: p.t,
        time,
        label: formatAxisTime(p.t, range),
      } as Record<string, number | string>;
      if (isMultiOutcome && p.outcomePctByKey) {
        for (const series of seriesDefs) {
          const value = p.outcomePctByKey[series.key];
          if (Number.isFinite(value)) {
            base[series.field] = Math.round(Number(value) * 10) / 10;
          }
        }
        return base;
      }
      const yesPct = Number.isFinite(p.yesPct) ? Number(p.yesPct) : 50;
      base.yesPct = Math.round(yesPct * 10) / 10;
      base.noPct = Math.round((100 - yesPct) * 10) / 10;
      return base;
    });

    const empty = rows.length === 0;
    let domain: [number, number] | undefined;
    if (!empty && rows.length > 0) {
      const times = rows.map((d) => Number(d.time));
      const minT = Math.min(...times);
      const maxT = Math.max(...times);
      const padding = Math.max((maxT - minT) * 0.02, 60 * 1000);
      domain = [minT - padding, maxT + padding];
    }
    return {
      data: rows,
      isEmpty: empty,
      timeDomain: domain,
    };
  }, [history.points, range, isMultiOutcome, seriesDefs]);

  if (predictionsCount === 0) {
    const emptyH = embeddedInPage
      ? "min-h-[min(52vh,320px)] sm:min-h-[280px] md:min-h-[300px]"
      : isStandalone
        ? "h-[240px] md:h-[280px]"
        : "h-[200px]";
    return (
      <div className={embeddedInPage ? "py-2 md:py-3" : isStandalone ? "event-chart-standalone py-4" : "py-2"}>
        {!embeddedInPage && (
          <h2
            id="chart-heading"
            className={`text-sm font-semibold mb-3 md:mb-4 ${isLight ? "text-gray-900" : "text-fg"} ${isStandalone ? "text-center" : "text-left px-3 md:px-0"}`}
          >
            {chartHeadingText}
          </h2>
        )}
        {embeddedInPage && (
          <span id="chart-heading" className="sr-only">
            Andamento probabilità nel tempo
          </span>
        )}
        <div
          className={`flex flex-col items-center justify-center gap-4 text-center ${emptyH} ${embeddedInPage ? "px-3" : ""}`}
          style={
            embeddedInPage
              ? undefined
              : { background: isLight ? "rgb(249 250 251)" : "rgb(255 255 255 / 0.03)", borderRadius: "var(--radius-lg)" }
          }
        >
          <p className={`text-sm max-w-sm ${isLight ? "text-gray-600" : "text-fg-muted"}`}>
            Diventa il primo a prevedere questo evento
          </p>
          <a
            href="#prediction-section"
            className={`inline-flex flex-col items-center gap-1 text-sm font-semibold underline rounded px-2 py-1 focus-visible:ring-2 focus-visible:ring-offset-2 ${isLight ? "text-[#0AC285] hover:text-[#09a870] focus-visible:ring-[#0AC285] focus-visible:ring-offset-gray-50" : "text-primary hover:text-primary-hover focus-visible:ring-primary focus-visible:ring-offset-bg"}`}
          >
            <span>Fai la tua previsione</span>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={embeddedInPage ? "py-2 md:py-3" : undefined}>
        {embeddedInPage && (
          <span id="chart-heading" className="sr-only">
            Caricamento andamento probabilità
          </span>
        )}
        <div
          className={`flex items-center justify-center ${embeddedInPage ? "min-h-[min(44vh,260px)] sm:min-h-[240px]" : isStandalone ? "h-[260px] md:h-[300px]" : "h-[220px]"}`}
        >
          <div className={`inline-block h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${isLight ? "border-[#0AC285]" : "border-primary"}`} />
          <span className="sr-only">Caricamento grafico...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={embeddedInPage ? "py-2 md:py-3" : undefined}>
        {embeddedInPage && (
          <span id="chart-heading" className="sr-only">
            Errore caricamento grafico probabilità
          </span>
        )}
        <div
          className={`flex flex-col items-center justify-center gap-2 text-sm ${isLight ? "text-gray-600" : "text-fg-muted"} ${embeddedInPage ? "min-h-[min(44vh,260px)] sm:min-h-[240px] text-center px-3" : isStandalone ? "h-[260px] md:h-[300px] text-center" : "h-[180px]"}`}
        >
        <p>Non è stato possibile caricare lo storico.</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            fetch(`/api/events/${eventId}/probability-history?range=${range}`)
              .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Errore"))))
              .then((data: HistoryResponse) =>
                setHistory({
                  mode: data.mode ?? "binary",
                  points: data.points ?? [],
                  outcomes: data.outcomes ?? outcomeOptions ?? [],
                })
              )
              .catch(() => setError("Errore"))
              .finally(() => setLoading(false));
          }}
          className={`font-medium underline ${isLight ? "text-[#0AC285] hover:text-[#09a870]" : "text-primary hover:text-primary-hover"}`}
        >
          Riprova
        </button>
        </div>
      </div>
    );
  }

  // Empty state: due punti per far disegnare assi X (tempo) e Y (%)
  const chartData = isEmpty
    ? (() => {
        const now = new Date();
        const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tPast = past.getTime();
        const tNow = now.getTime();
        if (isMultiOutcome && seriesDefs.length >= 2) {
          const even = Math.round((100 / seriesDefs.length) * 10) / 10;
          const pastPoint: Record<string, number | string> = {
            t: past.toISOString(),
            time: tPast,
            label: formatAxisTime(past.toISOString(), range),
          };
          const nowPoint: Record<string, number | string> = {
            t: now.toISOString(),
            time: tNow,
            label: formatAxisTime(now.toISOString(), range),
          };
          for (const series of seriesDefs) {
            pastPoint[series.field] = even;
            nowPoint[series.field] = even;
          }
          return [pastPoint, nowPoint];
        }
        return [
          { t: past.toISOString(), time: tPast, yesPct: 50, noPct: 50, label: formatAxisTime(past.toISOString(), range) },
          { t: now.toISOString(), time: tNow, yesPct: 50, noPct: 50, label: formatAxisTime(now.toISOString(), range) },
        ];
      })()
    : data;

  const latestPoint = chartData.length > 0 ? (chartData[chartData.length - 1] as Record<string, number | string>) : null;
  const legendRows = !isMultiOutcome || seriesDefs.length < 2
    ? []
    : seriesDefs
        .map((series) => {
          const rawValue = latestPoint?.[series.field];
          const value = typeof rawValue === "number" ? rawValue : null;
          return { ...series, value };
        })
        .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));

  const chartAreaH = embeddedInPage
    ? "h-[min(52vh,340px)] sm:h-[300px] md:h-[320px]"
    : isStandalone
      ? "h-[240px] md:h-[280px] mx-auto event-chart-area-centered"
      : "h-[200px]";

  return (
    <div className={embeddedInPage ? "py-2 md:py-3" : isStandalone ? "event-chart-standalone py-4" : "py-2"}>
      {!embeddedInPage && (
        <h2
          id="chart-heading"
          className={`text-sm font-semibold mb-3 md:mb-4 ${isLight ? "text-gray-900" : "text-fg"} ${isStandalone ? "text-center" : "text-left px-3 md:px-0"}`}
        >
          {chartHeadingText}
        </h2>
      )}
      {embeddedInPage && (
        <span id="chart-heading" className="sr-only">
          Andamento probabilità nel tempo
        </span>
      )}
      <div className={`event-probability-chart-area w-full relative ${chartAreaH}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={
              embeddedInPage
                ? { top: 10, right: 26, left: 0, bottom: 18 }
                : isStandalone
                  ? { top: 14, right: 34, left: 4, bottom: 22 }
                  : { top: 8, right: 28, left: 2, bottom: 14 }
            }
          >
            <CartesianGrid
              strokeDasharray="1 5"
              stroke={gridStroke}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              type="number"
              domain={timeDomain ?? ["dataMin", "dataMax"]}
              tickFormatter={(ts) => formatAxisTime(new Date(ts).toISOString(), range)}
              stroke={axisStroke}
              tick={{ fontSize: 10, fill: tickFill, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: axisLineStroke }}
              minTickGap={24}
              tickMargin={10}
              allowDataOverflow
            />
            <YAxis
              domain={[0, 100]}
              orientation="right"
              stroke={axisStroke}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 11, fill: tickFill, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatValue(Number(v))}
              tickMargin={8}
              width={valueUnit === "credits" ? 44 : 38}
            />
            {isEmpty && chartData[0] && "time" in chartData[0] && (
              <ReferenceArea
                x1={(chartData[0] as { time: number }).time}
                x2={(chartData[chartData.length - 1] as { time: number }).time}
                y1={0}
                y2={100}
                fill="transparent"
              />
            )}
            {!isEmpty && (
              <>
                {seriesDefs.map((series) => (
                  <Line
                    key={series.field}
                    type={isMultiOutcome ? "linear" : "monotone"}
                    dataKey={series.field}
                    name={series.label}
                    stroke={series.color}
                    strokeWidth={isMultiOutcome ? 2.2 : 2.6}
                    dot={false}
                    isAnimationActive
                    animationDuration={400}
                    connectNulls
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: series.glow }}
                    activeDot={{
                      r: 4,
                      fill: series.color,
                      stroke: isLight ? "#ffffff" : "#0B0F14",
                      strokeWidth: 1.5,
                    }}
                  />
                ))}
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {isEmpty && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-live="polite"
          >
            <p className={`text-sm text-center px-4 max-w-[240px] ${isLight ? "text-gray-600" : "text-fg-muted"}`}>
              Diventa il primo a prevedere questo evento!
            </p>
          </div>
        )}
      </div>
      {isMultiOutcome && seriesDefs.length >= 2 && (
        <div className="mt-3 px-1 overflow-x-auto">
          <div className="inline-grid grid-flow-col grid-rows-3 auto-cols-[minmax(165px,1fr)] gap-x-2 gap-y-1.5 min-w-full">
          {legendRows.map((series) => {
            return (
              <div
                key={`legend-${series.field}`}
                className="min-w-0 px-1 py-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: series.color }}
                      aria-hidden
                    />
                    <span className="truncate text-[11px] sm:text-xs font-medium" style={{ color: series.color }}>
                      {series.label}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] sm:text-xs font-semibold tabular-nums" style={{ color: series.color }}>
                    {series.value == null ? "—" : formatValue(series.value)}
                  </span>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
