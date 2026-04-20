"use client";

import { MOCK_PLAYER_TOKENS } from "../utils/mockTokenData";
import { formatValue, formatChange } from "../utils/calculateOdds";

const TICKER_PLAYERS = MOCK_PLAYER_TOKENS.slice(0, 12);

function TickerItem({ player }: { player: (typeof MOCK_PLAYER_TOKENS)[0] }) {
  const isUp = player.change24h >= 0;
  const color = isUp ? "#10b981" : "#ef4444";
  const arrow = isUp ? "↗" : "↘";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "0 24px",
        whiteSpace: "nowrap",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.01em",
        }}
      >
        {player.name}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {formatValue(player.currentValue)}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.72rem",
          fontWeight: 700,
          color,
        }}
      >
        {arrow} {formatChange(player.change24h)}
      </span>
    </span>
  );
}

export default function PriceTicker() {
  const doubled = [...TICKER_PLAYERS, ...TICKER_PLAYERS];

  return (
    <div
      style={{
        background: "rgba(6,6,10,0.9)",
        borderBottom: "1px solid rgba(80,245,252,0.12)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        height: 34,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fade edges */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background: "linear-gradient(90deg, rgba(6,6,10,0.9), transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background: "linear-gradient(270deg, rgba(6,6,10,0.9), transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            animation: "sm-ticker-scroll 50s linear infinite",
            width: "max-content",
          }}
          className="sm-ticker-track"
        >
          {doubled.map((p, i) => (
            <TickerItem key={`${p.id}-${i}`} player={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
