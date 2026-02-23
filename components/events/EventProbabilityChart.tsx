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
}: EventProbabilityChartProps) {
  const isStandalone = layout === "standalone";
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
    setLoading(true);
    setError(null);
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

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${isStandalone ? "h-[260px] md:h-[300px]" : "h-[220px]"}`}
      >
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">Caricamento grafico...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 text-ds-body-sm text-fg-muted ${isStandalone ? "h-[260px] md:h-[300px] text-center" : "h-[180px]"}`}
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
          className="text-primary hover:text-primary-hover font-medium underline"
        >
          Riprova
        </button>
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

  return (
    <div className={isStandalone ? "event-chart-standalone py-4" : "py-2"}>
      <h2
        id="chart-heading"
        className={`text-ds-body-sm font-semibold text-fg mb-4 ${isStandalone ? "text-center" : ""}`}
      >
        Andamento SÌ / NO nel tempo
      </h2>
      <div
        className={`event-probability-chart-area w-full relative ${isStandalone ? "h-[240px] md:h-[280px] mx-auto event-chart-area-centered" : "h-[200px]"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={
              isStandalone
                ? { top: 16, right: 20, left: 8, bottom: 24 }
                : { top: 8, right: 12, left: 4, bottom: 16 }
            }
          >
            <CartesianGrid
              strokeDasharray="2 2"
              stroke="rgb(255 255 255 / 0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              type="number"
              domain={timeDomain ?? ["dataMin", "dataMax"]}
              tickFormatter={(ts) => formatAxisTime(new Date(ts).toISOString(), range)}
              stroke="rgb(255 255 255 / 0.35)"
              tick={{ fontSize: 10, fill: "rgb(255 255 255 / 0.6)" }}
              tickLine={false}
              axisLine={{ stroke: "rgb(255 255 255 / 0.12)" }}
              allowDataOverflow
            />
            <YAxis
              domain={[0, 100]}
              stroke="rgb(255 255 255 / 0.35)"
              tick={{ fontSize: 10, fill: "rgb(255 255 255 / 0.6)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={28}
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
                    background: "rgb(var(--surface) / 0.98)",
                    border: "1px solid rgb(255 255 255 / 0.12)",
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
                    `${value != null ? Number(value).toFixed(1) : "—"}%`,
                    name === "yesPct" ? "SÌ" : "NO",
                  ]}
                  itemStyle={{ paddingTop: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="yesPct"
                  name="yesPct"
                  stroke="rgb(var(--prediction-si-from))"
                  fill="rgb(var(--prediction-si-from) / 0.18)"
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
                  stroke="rgb(var(--prediction-no-from))"
                  fill="rgb(var(--prediction-no-from) / 0.18)"
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
            <p className="text-ds-body-sm text-fg-muted text-center px-4 max-w-[240px]">
              Diventa il primo a prevedere questo evento!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
