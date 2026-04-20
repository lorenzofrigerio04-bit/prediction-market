"use client";

import { useState } from "react";
import { PlayerToken } from "../utils/mockTokenData";
import { formatChange, formatValue, formatBets } from "../utils/calculateOdds";
import PlayerAvatar from "./PlayerAvatar";
import PlayerTokenChart from "./PlayerTokenChart";
import SentimentBar from "./SentimentBar";
import BetModal from "./BetModal";

interface MarketCardProps {
  player: PlayerToken;
  index?: number;
}

function CountdownBadge({ closingTime }: { closingTime: string }) {
  const now = Date.now();
  const diff = new Date(closingTime).getTime() - now;
  if (diff <= 0) return <span style={{ color: "#ef4444", fontSize: "0.72rem", fontWeight: 600 }}>Chiuso</span>;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  let text = "";
  let urgent = false;
  if (days > 0) {
    text = `${days}g ${remHours}h`;
  } else if (hours > 0) {
    text = `${hours}h`;
    urgent = hours < 6;
  } else {
    text = "<1h";
    urgent = true;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: "0.72rem",
        fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        color: urgent ? "#f59e0b" : "rgba(255,255,255,0.35)",
      }}
    >
      ⏱ {text}
    </span>
  );
}

function VolatilityBadge({ level }: { level: PlayerToken["volatility"] }) {
  const config = {
    high: { label: "ALTA VOLATILITÀ", bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
    medium: { label: "MEDIA", bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
    low: { label: "STABILE", bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.25)" },
  };
  const c = config[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 100,
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {c.label}
    </span>
  );
}

export default function MarketCard({ player, index = 0 }: MarketCardProps) {
  const [betModal, setBetModal] = useState<{ side: "YES" | "NO"; odds: number; question: string } | null>(null);
  const market = player.markets[0];
  const isUp = player.change24h >= 0;
  const changeColor = isUp ? "#10b981" : "#ef4444";
  const changeArrow = isUp ? "↗" : "↘";

  return (
    <>
      <div
        className="sm-market-card"
        style={{
          background: "rgba(19,19,26,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "24px",
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          overflow: "hidden",
          animationDelay: `${index * 80}ms`,
        }}
      >
        {/* Subtle top gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(80,245,252,0.4), transparent)",
          }}
        />

        {/* HOT badge */}
        {player.isHot && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              borderRadius: 100,
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              boxShadow: "0 0 12px rgba(239,68,68,0.5)",
              animation: "sm-hot-pulse 2s ease-in-out infinite",
            }}
          >
            🔥 HOT
          </div>
        )}

        {/* Player header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
          <PlayerAvatar
            name={player.name}
            team={player.team}
            photo={player.photo}
            size="md"
            isHot={player.isHot}
            badge={player.isHot ? "hot" : player.volatility === "high" ? "volatile" : null}
          />
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <div
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.01em",
                marginBottom: 3,
              }}
            >
              {player.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
                {player.team} · {player.position}
              </span>
              <VolatilityBadge level={player.volatility} />
            </div>
          </div>
        </div>

        {/* Token value row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "2rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #38e4ee, #80faff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            {formatValue(player.currentValue)}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: changeColor,
            }}
          >
            {changeArrow} {formatChange(player.change24h)}
          </span>
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.3)",
            marginBottom: 16,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          7g: {formatChange(player.change7d)} · {player.holders.toLocaleString()} holders
        </div>

        {/* Chart */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 12,
            padding: "12px 8px 8px",
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <PlayerTokenChart
            priceHistory={player.priceHistory}
            isUp={isUp}
            playerName={player.name}
          />
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            marginBottom: 16,
            background: "rgba(255,255,255,0.02)",
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          {[
            { label: "Match", value: player.stats.matches },
            { label: "Gol", value: player.stats.goals },
            { label: "Assist", value: player.stats.assists },
            { label: "MOTM", value: player.stats.motm },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginTop: 1,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />

        {/* Market section */}
        {market && (
          <div>
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#80faff",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              💎 MERCATO PREDICTION
            </div>

            {/* Question */}
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                marginBottom: 8,
                lineHeight: 1.4,
              }}
            >
              &ldquo;{market.question}&rdquo;
            </div>

            {/* Event + closing time */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              {market.event && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.4)",
                    background: "rgba(255,255,255,0.05)",
                    padding: "2px 8px",
                    borderRadius: 5,
                  }}
                >
                  ⚽ {market.event}
                  {market.eventDate ? ` · ${market.eventDate}` : ""}
                </span>
              )}
              <CountdownBadge closingTime={market.closingTime} />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {formatBets(market.bets)} scommesse
              </span>
            </div>

            {/* Sentiment bar */}
            <div style={{ marginBottom: 14 }}>
              <SentimentBar
                yesPct={market.yesPct}
                bets={market.bets}
                yesOdds={market.yesOdds}
                noOdds={market.noOdds}
              />
            </div>

            {/* YES / NO buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={() =>
                  setBetModal({ side: "YES", odds: market.yesOdds, question: market.question })
                }
                style={{
                  padding: "12px",
                  borderRadius: 12,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.2))",
                  border: "1px solid rgba(16,185,129,0.4)",
                  color: "#10b981",
                  boxShadow: "0 0 12px rgba(16,185,129,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                ✅ YES · {market.yesOdds.toFixed(2)}x
              </button>
              <button
                onClick={() =>
                  setBetModal({ side: "NO", odds: market.noOdds, question: market.question })
                }
                style={{
                  padding: "12px",
                  borderRadius: 12,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.15))",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "#ef4444",
                  boxShadow: "0 0 12px rgba(239,68,68,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                ❌ NO · {market.noOdds.toFixed(2)}x
              </button>
            </div>

            {/* Starcks link */}
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <a
                href={`https://app.starcks.io/token/${player.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.3)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "color 0.15s",
                }}
              >
                📊 Vedi token su Starcks →
              </a>
            </div>
          </div>
        )}
      </div>

      {betModal && (
        <BetModal
          isOpen={true}
          onClose={() => setBetModal(null)}
          playerName={player.name}
          playerTeam={player.team}
          playerPhoto={player.photo}
          question={betModal.question}
          side={betModal.side}
          odds={betModal.odds}
          isHot={player.isHot}
        />
      )}
    </>
  );
}
