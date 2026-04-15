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
  Area,
  Tooltip,
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
  refetchTrigger?: number;
  layout?: "default" | "standalone";
  predictionsCount?: number;
  theme?: "light" | "dark";
  valueUnit?: "percent" | "credits";
  embeddedInPage?: boolean;
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

function CustomTooltip({ active, payload, label, formatValue, seriesDefs, range }: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: number;
  formatValue: (v: number | null | undefined) => string;
  seriesDefs: ChartSeries[];
  range: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const time = formatAxisTime(new Date(label).toISOString(), range);
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(12,14,20,0.94) 0%, rgba(10,42,106,0.25) 100%)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(80,245,252,0.1)",
        borderRadius: "14px",
        padding: "10px 14px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <p style={{ fontSize: "10px", color: "rgba(169,180,208,0.5)", marginBottom: "8px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {time}
      </p>
      {payload.map((entry) => {
        const series = seriesDefs.find((s) => s.field === entry.dataKey);
        return (
          <div key={entry.dataKey} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: entry.color,
                boxShadow: `0 0 8px ${entry.color}50`,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "12px", color: "rgba(244,246,252,0.8)", fontWeight: 500, flex: 1 }}>
              {series?.label ?? entry.dataKey}
            </span>
            <span style={{ fontSize: "12px", color: entry.color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {formatValue(entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
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
  const gridStroke = isLight ? "rgb(148 163 184 / 0.28)" : "rgba(80,245,252,0.04)";
  const axisStroke = isLight ? "rgb(100 116 139 / 0.7)" : "rgba(80,245,252,0.12)";
  const tickFill = isLight ? "rgb(71 85 105)" : "rgba(169,180,208,0.45)";
  const axisLineStroke = isLight ? "rgb(148 163 184 / 0.35)" : "rgba(80,245,252,0.08)";
  const colorPalette = isLight
    ? ["#2BA890", "#4A8AD4", "#9A6FD9", "#D48F3E", "#D46060", "#6FAF54"]
    : ["#2DD4BF", "#50A5FC", "#A882FF", "#F8A348", "#F87171", "#82DC64"];
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
        return {
          field: `outcome_${idx}`,
          key: opt.key,
          label: opt.label,
          color,
          glow: isLight ? "none" : `drop-shadow(0 0 6px ${color}50)`,
        };
      });
    }
    return [
      {
        field: "yesPct",
        key: "YES",
        label: "SÌ",
        color: isLight ? "#35C38A" : "#2DD4BF",
        glow: isLight ? "none" : "drop-shadow(0 0 8px rgba(45,212,191,0.35))",
      },
      {
        field: "noPct",
        key: "NO",
        label: "NO",
        color: isLight ? "#FF6B7A" : "#F87171",
        glow: isLight ? "none" : "drop-shadow(0 0 8px rgba(248,113,113,0.35))",
      },
    ];
  }, [isMultiOutcome, outcomeDefs, colorPalette, isLight]);

  const { data, isEmpty, timeDomain, yDomain, yTicks } = useMemo(() => {
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

    let yMin = 0;
    let yMax = 100;
    const tickArr = [0, 25, 50, 75, 100];

    if (!empty && rows.length > 1) {
      const allValues: number[] = [];
      for (const row of rows) {
        for (const series of seriesDefs) {
          const v = row[series.field];
          if (typeof v === "number" && Number.isFinite(v)) allValues.push(v);
        }
      }
      if (allValues.length > 0) {
        const dataMin = Math.min(...allValues);
        const dataMax = Math.max(...allValues);
        const spread = dataMax - dataMin;

        if (spread < 15) {
          const mid = (dataMin + dataMax) / 2;
          const halfRange = Math.max(spread * 1.5, 3);
          yMin = Math.max(0, Math.floor(mid - halfRange));
          yMax = Math.min(100, Math.ceil(mid + halfRange));
          if (yMax - yMin < 4) {
            yMin = Math.max(0, yMin - 2);
            yMax = Math.min(100, yMax + 2);
          }
          const step = Math.max(1, Math.round((yMax - yMin) / 4));
          tickArr.length = 0;
          for (let v = yMin; v <= yMax; v += step) tickArr.push(v);
          if (tickArr[tickArr.length - 1] < yMax) tickArr.push(yMax);
        }
      }
    }

    return {
      data: rows,
      isEmpty: empty,
      timeDomain: domain,
      yDomain: [yMin, yMax] as [number, number],
      yTicks: tickArr,
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
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(80,245,252,0.08)",
              border: "1px solid rgba(80,245,252,0.15)",
            }}
          >
            <svg className="w-5 h-5" style={{ color: "rgba(80,245,252,0.6)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className={`text-sm max-w-sm ${isLight ? "text-gray-600" : "text-fg-muted"}`}>
            Diventa il primo a prevedere questo evento
          </p>
          <a
            href="#prediction-section"
            className="inline-flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 transition-all duration-200"
            style={{
              color: "rgb(80,245,252)",
              background: "rgba(80,245,252,0.08)",
              border: "1px solid rgba(80,245,252,0.2)",
            }}
          >
            <span>Fai la tua previsione</span>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "rgba(80,245,252,0.4)", borderTopColor: "transparent" }}
          />
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
          className={`flex flex-col items-center justify-center gap-3 text-sm ${isLight ? "text-gray-600" : "text-fg-muted"} ${embeddedInPage ? "min-h-[min(44vh,260px)] sm:min-h-[240px] text-center px-3" : isStandalone ? "h-[260px] md:h-[300px] text-center" : "h-[180px]"}`}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            <svg className="w-5 h-5" style={{ color: "rgb(248,113,113)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
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
            className="font-semibold text-sm px-4 py-1.5 rounded-lg transition-all duration-200"
            style={{
              color: "rgb(80,245,252)",
              background: "rgba(80,245,252,0.08)",
              border: "1px solid rgba(80,245,252,0.2)",
            }}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

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
    ? (seriesDefs.length === 2 && !isMultiOutcome
        ? seriesDefs.map((series) => {
            const rawValue = latestPoint?.[series.field];
            const value = typeof rawValue === "number" ? rawValue : null;
            return { ...series, value };
          })
        : [])
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

      <div
        className={`event-probability-chart-area w-full relative ${chartAreaH} rounded-2xl overflow-hidden`}
        style={{
          background: isLight
            ? "rgb(249 250 251)"
            : "linear-gradient(135deg, rgba(80,245,252,0.03) 0%, rgba(45,212,191,0.01) 50%, rgba(248,113,113,0.01) 100%)",
          border: isLight ? "1px solid rgba(148,163,184,0.2)" : "1px solid rgba(80,245,252,0.08)",
          boxShadow: isLight ? "none" : "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 40px -20px rgba(80,245,252,0.06)",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={
              embeddedInPage
                ? { top: 14, right: 26, left: 0, bottom: 18 }
                : isStandalone
                  ? { top: 14, right: 34, left: 4, bottom: 22 }
                  : { top: 8, right: 28, left: 2, bottom: 14 }
            }
          >
            <defs>
              {seriesDefs.map((series) => (
                <linearGradient key={`grad-${series.field}`} id={`areaGrad-${series.field}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={series.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={series.color} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 12"
              stroke={gridStroke}
              vertical={false}
              strokeLinecap="round"
            />
            <XAxis
              dataKey="time"
              type="number"
              domain={timeDomain ?? ["dataMin", "dataMax"]}
              tickFormatter={(ts) => formatAxisTime(new Date(ts).toISOString(), range)}
              stroke={axisStroke}
              tick={{ fontSize: 10, fill: tickFill, fontWeight: 600, letterSpacing: "0.02em" }}
              tickLine={false}
              axisLine={{ stroke: axisLineStroke, strokeWidth: 1 }}
              minTickGap={28}
              tickMargin={10}
              allowDataOverflow
            />
            <YAxis
              domain={yDomain}
              orientation="right"
              stroke={axisStroke}
              ticks={yTicks}
              tick={{ fontSize: 10, fill: tickFill, fontWeight: 600, letterSpacing: "0.02em" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatValue(Number(v))}
              tickMargin={10}
              width={valueUnit === "credits" ? 44 : 40}
            />
            <Tooltip
              content={<CustomTooltip formatValue={formatValue} seriesDefs={seriesDefs} range={range} />}
              cursor={{
                stroke: "rgba(80,245,252,0.1)",
                strokeWidth: 1,
              }}
            />
            {isEmpty && chartData[0] && "time" in chartData[0] && (
              <ReferenceArea
                x1={(chartData[0] as { time: number }).time}
                x2={(chartData[chartData.length - 1] as { time: number }).time}
                y1={yDomain[0]}
                y2={yDomain[1]}
                fill="transparent"
              />
            )}
            {!isEmpty && (
              <>
                {seriesDefs.map((series) => (
                  <Area
                    key={`area-${series.field}`}
                    type={isMultiOutcome ? "linear" : "monotone"}
                    dataKey={series.field}
                    stroke="none"
                    fill={`url(#areaGrad-${series.field})`}
                    isAnimationActive
                    animationDuration={600}
                    connectNulls
                  />
                ))}
                {seriesDefs.map((series) => (
                  <Line
                    key={series.field}
                    type={isMultiOutcome ? "linear" : "monotone"}
                    dataKey={series.field}
                    name={series.label}
                    stroke={series.color}
                    strokeWidth={isMultiOutcome ? 2 : 2.5}
                    dot={false}
                    isAnimationActive
                    animationDuration={600}
                    connectNulls
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: series.glow }}
                    activeDot={{
                      r: 5,
                      fill: series.color,
                      stroke: "rgb(12,14,20)",
                      strokeWidth: 2,
                      style: { filter: `drop-shadow(0 0 6px ${series.color}60)` },
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

      {/* Multi-outcome legend */}
      {isMultiOutcome && seriesDefs.length >= 2 && (
        <div className="mt-4 px-1 overflow-x-auto scrollbar-hide">
          <div className="inline-grid grid-flow-col grid-rows-3 auto-cols-[minmax(165px,1fr)] gap-x-2 gap-y-1.5 min-w-full">
            {legendRows.map((series) => (
              <div
                key={`legend-${series.field}`}
                className="min-w-0 px-2 py-1.5 rounded-lg transition-colors"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: series.color,
                        boxShadow: `0 0 6px ${series.color}40`,
                      }}
                      aria-hidden
                    />
                    <span
                      className="truncate text-[11px] sm:text-xs font-semibold"
                      style={{ color: series.color }}
                    >
                      {series.label}
                    </span>
                  </div>
                  <span
                    className="shrink-0 text-[11px] sm:text-xs font-bold tabular-nums"
                    style={{ color: series.color }}
                  >
                    {series.value == null ? "—" : formatValue(series.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
