"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceArea,
} from "recharts";

interface Point {
  t: string;
  yesPct: number;
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
}: EventProbabilityChartProps) {
  const isStandalone = layout === "standalone";
  const isLight = theme === "light";
  const chartHeadingText =
    valueUnit === "credits" ? "Prezzo SÌ / NO nel tempo" : "Andamento SÌ / NO nel tempo";
  const gridStroke = isLight ? "rgb(229 231 235)" : "rgb(255 255 255 / 0.06)";
  const axisStroke = isLight ? "rgb(156 163 175)" : "rgb(255 255 255 / 0.35)";
  const tickFill = isLight ? "rgb(107 114 128)" : "rgb(255 255 255 / 0.6)";
  const axisLineStroke = isLight ? "rgb(229 231 235)" : "rgb(255 255 255 / 0.12)";
  const formatValue = useCallback(
    (value: number | null | undefined) => {
      if (value == null || !Number.isFinite(value)) return "—";
      return valueUnit === "credits" ? `${Number(value).toFixed(1)}c` : `${Number(value).toFixed(1)}%`;
    },
    [valueUnit]
  );
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(() => {
    return fetch(`/api/events/${eventId}/probability-history?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore caricamento");
        return res.json();
      })
      .then((data: { points: Point[] }) => data.points ?? []);
  }, [eventId, range]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    fetchHistory()
      .then((pts) => {
        if (!cancelled) setPoints(pts);
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
        .then((pts) => setPoints(pts))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [eventId, fetchHistory]);

  const { data, isEmpty, timeDomain } = useMemo(() => {
    const withNo = points.map((p) => {
      const time = new Date(p.t).getTime();
      return {
        ...p,
        time,
        noPct: Math.round((100 - p.yesPct) * 10) / 10,
        label: formatAxisTime(p.t, range),
      };
    });
    const empty = withNo.length === 0;
    let domain: [number, number] | undefined;
    if (!empty && withNo.length > 0) {
      const times = withNo.map((d) => d.time);
      const minT = Math.min(...times);
      const maxT = Math.max(...times);
      const padding = Math.max((maxT - minT) * 0.02, 60 * 1000);
      domain = [minT - padding, maxT + padding];
    }
    return {
      data: withNo,
      isEmpty: empty,
      timeDomain: domain,
    };
  }, [points, range]);

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
            Andamento probabilità SÌ e NO nel tempo
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
              .then((data: { points: Point[] }) => setPoints(data.points ?? []))
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
        return [
          { t: past.toISOString(), time: tPast, yesPct: 50, noPct: 50, label: formatAxisTime(past.toISOString(), range) },
          { t: now.toISOString(), time: tNow, yesPct: 50, noPct: 50, label: formatAxisTime(now.toISOString(), range) },
        ];
      })()
    : data;

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
          Andamento probabilità SÌ e NO nel tempo
        </span>
      )}
      <div className={`event-probability-chart-area w-full relative ${chartAreaH}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={
              embeddedInPage
                ? { top: 12, right: 8, left: 0, bottom: 20 }
                : isStandalone
                  ? { top: 16, right: 20, left: 8, bottom: 24 }
                  : { top: 8, right: 12, left: 4, bottom: 16 }
            }
          >
            <CartesianGrid
              strokeDasharray="2 2"
              stroke={gridStroke}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              type="number"
              domain={timeDomain ?? ["dataMin", "dataMax"]}
              tickFormatter={(ts) => formatAxisTime(new Date(ts).toISOString(), range)}
              stroke={axisStroke}
              tick={{ fontSize: 10, fill: tickFill }}
              tickLine={false}
              axisLine={{ stroke: axisLineStroke }}
              allowDataOverflow
            />
            <YAxis
              domain={[0, 100]}
              stroke={axisStroke}
              tick={{ fontSize: 10, fill: tickFill }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatValue(Number(v))}
              width={valueUnit === "credits" ? 40 : 28}
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
                <Tooltip
                  contentStyle={{
                    background: isLight ? "#ffffff" : "rgb(var(--surface) / 0.98)",
                    border: isLight ? "1px solid #e5e7eb" : "1px solid rgb(255 255 255 / 0.12)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  labelFormatter={(_, payload) => {
                    const t = payload?.[0]?.payload?.t;
                    return t
                      ? new Date(t).toLocaleString("it-IT", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";
                  }}
                  formatter={(value, name) => [
                    formatValue(value as number),
                    name === "yesPct" ? "SÌ" : "NO",
                  ]}
                  itemStyle={{ paddingTop: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="yesPct"
                  name="yesPct"
                  stroke={isLight ? "#0AC285" : "rgb(var(--primary))"}
                  fill={isLight ? "rgb(10 194 133 / 0.18)" : "rgb(var(--primary) / 0.18)"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={400}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="noPct"
                  name="noPct"
                  stroke={isLight ? "#6b7280" : "rgb(148 163 184 / 0.9)"}
                  fill={isLight ? "rgb(107 114 128 / 0.14)" : "rgb(148 163 184 / 0.12)"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={400}
                  connectNulls
                />
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
    </div>
  );
}
