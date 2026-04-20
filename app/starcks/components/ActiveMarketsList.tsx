"use client";

import { useState } from "react";
import { useActiveMarkets, SortOption } from "../hooks/usePlayerTokens";
import { formatBets, formatChange } from "../utils/calculateOdds";
import PlayerAvatar from "./PlayerAvatar";
import SentimentBar from "./SentimentBar";
import BetModal from "./BetModal";
import { PlayerToken, Market } from "../utils/mockTokenData";

function TimeLeft({ closingTime }: { closingTime: string }) {
  const diff = new Date(closingTime).getTime() - Date.now();
  if (diff <= 0) return <span style={{ color: "#ef4444", fontSize: "0.72rem" }}>Chiuso</span>;
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  const text = d > 0 ? `${d}g ${h % 24}h` : `${h}h`;
  const urgent = h < 6;
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.72rem",
        fontWeight: 700,
        color: urgent ? "#f59e0b" : "rgba(255,255,255,0.3)",
      }}
    >
      ⏱ {text}
    </span>
  );
}

function ActiveMarketRow({
  player,
  market,
  onBet,
}: {
  player: PlayerToken;
  market: Market;
  onBet: (side: "YES" | "NO", odds: number, question: string, player: PlayerToken) => void;
}) {
  const isUp = player.change24h >= 0;
  return (
    <div
      style={{
        background: "rgba(19,19,26,0.75)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "16px",
        transition: "all 0.2s",
      }}
      className="sm-active-row"
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <PlayerAvatar name={player.name} team={player.team} photo={player.photo} size="sm" isHot={player.isHot} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "white" }}>
                {player.name}
              </span>
              <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>
                {player.team}
              </span>
              {market.isHot && (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 100,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "white",
                  }}
                >
                  🔥
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: isUp ? "#10b981" : "#ef4444",
                }}
              >
                {isUp ? "↗" : "↘"} {formatChange(player.change24h)}
              </span>
              <TimeLeft closingTime={market.closingTime} />
            </div>
          </div>

          {/* Question */}
          <p
            style={{
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.4,
              marginBottom: 10,
            }}
          >
            &ldquo;{market.question}&rdquo;
          </p>

          {/* Sentiment + stats */}
          <div style={{ marginBottom: 10 }}>
            <SentimentBar
              yesPct={market.yesPct}
              bets={market.bets}
              yesOdds={market.yesOdds}
              noOdds={market.noOdds}
              compact
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 5,
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.25)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span>YES {market.yesPct}% · {market.yesOdds.toFixed(2)}x</span>
              <span>{formatBets(market.bets)} scommesse</span>
              <span>NO {100 - market.yesPct}% · {market.noOdds.toFixed(2)}x</span>
            </div>
          </div>

          {/* Quick bet buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onBet("YES", market.yesOdds, market.question, player)}
              style={{
                flex: 1,
                padding: "7px 8px",
                borderRadius: 8,
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                color: "#10b981",
                transition: "all 0.15s",
              }}
            >
              ✅ YES {market.yesOdds.toFixed(2)}x
            </button>
            <button
              onClick={() => onBet("NO", market.noOdds, market.question, player)}
              style={{
                flex: 1,
                padding: "7px 8px",
                borderRadius: 8,
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#ef4444",
                transition: "all 0.15s",
              }}
            >
              ❌ NO {market.noOdds.toFixed(2)}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActiveMarketsList() {
  const { markets, sortBy, setSortBy } = useActiveMarkets();
  const [betModal, setBetModal] = useState<{
    side: "YES" | "NO";
    odds: number;
    question: string;
    player: PlayerToken;
  } | null>(null);

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Scadenza", value: "closing" },
    { label: "Volume", value: "volume" },
  ];

  return (
    <>
      <div>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "white", marginBottom: 2 }}>
              ⚡ Mercati Aperti Oggi
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
              {markets.length} mercati attivi
            </div>
          </div>

          {/* Sort toggle */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "rgba(19,19,26,0.7)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 3,
            }}
          >
            {sortOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => setSortBy(s.value)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: sortBy === s.value ? "rgba(80,245,252,0.3)" : "transparent",
                  color: sortBy === s.value ? "#80faff" : "rgba(255,255,255,0.35)",
                  transition: "all 0.15s",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Market list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {markets.map(({ player, market }) => (
            <ActiveMarketRow
              key={market.id}
              player={player}
              market={market}
              onBet={(side, odds, question, p) =>
                setBetModal({ side, odds, question, player: p })
              }
            />
          ))}
        </div>
      </div>

      {betModal && (
        <BetModal
          isOpen={true}
          onClose={() => setBetModal(null)}
          playerName={betModal.player.name}
          playerTeam={betModal.player.team}
          playerPhoto={betModal.player.photo}
          question={betModal.question}
          side={betModal.side}
          odds={betModal.odds}
          isHot={betModal.player.isHot}
        />
      )}
    </>
  );
}
