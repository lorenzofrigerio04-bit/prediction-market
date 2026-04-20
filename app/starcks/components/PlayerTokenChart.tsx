"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { PricePoint } from "../utils/mockTokenData";

interface PlayerTokenChartProps {
  priceHistory: PricePoint[];
  isUp: boolean;
  compact?: boolean;
  playerName?: string;
}

type Timeframe = "7d" | "30d";

const TIMEFRAMES: { label: string; value: Timeframe; days: number }[] = [
  { label: "7G", value: "7d", days: 7 },
  { label: "30G", value: "30d", days: 30 },
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(19,19,26,0.95)",
        border: "1px solid rgba(80,245,252,0.4)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: "0.75rem",
        color: "white",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.9rem" }}>
        €{payload[0].value.toFixed(2)}
      </div>
    </div>
  );
}

export default function PlayerTokenChart({
  priceHistory,
  isUp,
  compact = false,
  playerName,
}: PlayerTokenChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");

  const tf = TIMEFRAMES.find((t) => t.value === timeframe)!;
  const sliced = priceHistory.slice(-tf.days);

  const gradientId = `grad-${isUp ? "green" : "red"}-${playerName?.replace(/\s+/g, "") ?? "chart"}`;
  const strokeColor = isUp ? "#10b981" : "#ef4444";
  const gradientFrom = isUp ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)";
  const gradientTo = isUp ? "rgba(16,185,129,0.0)" : "rgba(239,68,68,0.0)";

  const values = sliced.map((p) => p.value);
  const minVal = Math.min(...values) * 0.995;
  const maxVal = Math.max(...values) * 1.005;

  const midPoint = sliced[0]?.value;

  if (compact) {
    return (
      <ResponsiveContainer width="100%" height={52}>
        <AreaChart data={sliced} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div>
      {/* Timeframe selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            style={{
              padding: "3px 10px",
              borderRadius: 6,
              fontSize: "0.7rem",
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              background:
                timeframe === tf.value
                  ? "rgba(80,245,252,0.3)"
                  : "rgba(255,255,255,0.06)",
              color:
                timeframe === tf.value
                  ? "#80faff"
                  : "rgba(255,255,255,0.4)",
              outline: timeframe === tf.value ? "1px solid rgba(80,245,252,0.5)" : "none",
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={sliced} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => {
              const date = new Date(d);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[minVal, maxVal]}
            tickFormatter={(v: number) => `€${v.toFixed(0)}`}
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />

          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine
            y={midPoint}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4 4"
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: strokeColor, stroke: "white", strokeWidth: 1.5 }}
            style={{ filter: `drop-shadow(0 0 6px ${strokeColor}66)` }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
