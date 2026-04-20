"use client";

import { formatBets } from "../utils/calculateOdds";

interface SentimentBarProps {
  yesPct: number;
  bets: number;
  yesOdds: number;
  noOdds: number;
  compact?: boolean;
}

export default function SentimentBar({
  yesPct,
  bets,
  yesOdds,
  noOdds,
  compact = false,
}: SentimentBarProps) {
  const noPct = 100 - yesPct;
  const yesBets = Math.round(bets * (yesPct / 100));
  const noBets = bets - yesBets;

  return (
    <div style={{ width: "100%" }}>
      {/* Labels row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: "0.8rem",
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span style={{ color: "#10b981" }}>YES {yesPct}%</span>
        <span style={{ color: "#ef4444" }}>NO {noPct}%</span>
      </div>

      {/* Bar */}
      <div
        style={{
          display: "flex",
          height: compact ? 6 : 8,
          borderRadius: 100,
          overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            width: `${yesPct}%`,
            background: "linear-gradient(90deg, #059669, #10b981)",
            boxShadow: "0 0 10px rgba(16,185,129,0.5)",
            transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
        <div
          style={{
            flex: 1,
            background: "linear-gradient(90deg, #dc2626, #ef4444)",
            boxShadow: "0 0 10px rgba(239,68,68,0.4)",
          }}
        />
      </div>

      {/* Volume row */}
      {!compact && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>{formatBets(yesBets)} bets · {yesOdds.toFixed(2)}x</span>
          <span>{noOdds.toFixed(2)}x · {formatBets(noBets)} bets</span>
        </div>
      )}
    </div>
  );
}
