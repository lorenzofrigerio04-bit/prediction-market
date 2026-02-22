"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface Point {
  t: string;
  yesPct: number;
}

interface EventProbabilityChartProps {
  eventId: string;
  range?: "24h" | "7d" | "30d";
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
}: EventProbabilityChartProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/events/${eventId}/probability-history?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore caricamento");
        return res.json();
      })
      .then((data: { points: Point[] }) => {
        if (!cancelled) setPoints(data.points ?? []);
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
  }, [eventId, range]);

  const data = points.map((p) => ({
    ...p,
    noPct: Math.round((100 - p.yesPct) * 10) / 10,
    label: formatAxisTime(p.t, range),
  }));

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-[220px] flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">Caricamento grafico...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-[180px] flex flex-col items-center justify-center gap-2 text-ds-body-sm text-fg-muted">
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

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-[180px] flex items-center justify-center text-ds-body-sm text-fg-muted">
        Non ci sono ancora dati per questo periodo.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-ds-body-sm font-semibold text-fg mb-3">
        Andamento SÌ/NO nel tempo
      </h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgb(255 255 255 / 0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="t"
              tickFormatter={(t) => formatAxisTime(t, range)}
              stroke="rgb(255 255 255 / 0.4)"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgb(255 255 255 / 0.1)" }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="rgb(255 255 255 / 0.4)"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "rgb(var(--surface) / 0.98)",
                border: "1px solid rgb(255 255 255 / 0.15)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
              }}
              labelFormatter={(label, payload) => {
                const t = payload?.[0]?.payload?.t;
                return t
                  ? new Date(t).toLocaleString("it-IT", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : label;
              }}
              formatter={(value) => [`${value != null ? Number(value).toFixed(1) : "—"}%`, "SÌ"]}
            />
            <Area
              type="monotone"
              dataKey="yesPct"
              stroke="rgb(var(--prediction-si-from))"
              fill="rgb(var(--prediction-si-from) / 0.2)"
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={400}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
