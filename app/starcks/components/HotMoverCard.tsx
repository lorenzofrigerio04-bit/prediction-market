"use client";

import { useState } from "react";
import { PlayerToken } from "../utils/mockTokenData";
import { formatValue, formatChange } from "../utils/calculateOdds";
import PlayerAvatar from "./PlayerAvatar";
import PlayerTokenChart from "./PlayerTokenChart";
import BetModal from "./BetModal";
import SentimentBar from "./SentimentBar";

interface HotMoverCardProps {
  player: PlayerToken;
}

export default function HotMoverCard({ player }: HotMoverCardProps) {
  const [betModal, setBetModal] = useState<{ side: "YES" | "NO"; odds: number } | null>(null);
  const market = player.markets[0];
  const isUp = player.change24h >= 0;
  const changeColor = isUp ? "#10b981" : "#ef4444";
  const changeArrow = isUp ? "↗" : "↘";

  return (
    <>
      <div
        style={{
          flexShrink: 0,
          width: 220,
          background: "rgba(19,19,26,0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 18,
          padding: "18px 16px",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          cursor: "pointer",
        }}
        className="sm-hot-card"
      >
        {/* Top gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: player.isHot
              ? "linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)"
              : "linear-gradient(90deg, transparent, rgba(80,245,252,0.3), transparent)",
          }}
        />

        {/* HOT badge */}
        {player.isHot && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "2px 7px",
              borderRadius: 100,
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              boxShadow: "0 0 10px rgba(239,68,68,0.45)",
            }}
          >
            🔥 HOT
          </div>
        )}

        {/* Player info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <PlayerAvatar name={player.name} team={player.team} photo={player.photo} size="sm" isHot={player.isHot} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.82rem",
                fontWeight: 800,
                color: "white",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 110,
              }}
            >
              {player.name}
            </div>
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)" }}>
              {player.team}
            </div>
          </div>
        </div>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.4rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #38e4ee, #80faff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {formatValue(player.currentValue)}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: changeColor,
            }}
          >
            {changeArrow} {formatChange(player.change24h)}
          </span>
        </div>

        {/* Sparkline */}
        <div style={{ marginBottom: 10, marginLeft: -4, marginRight: -4 }}>
          <PlayerTokenChart
            priceHistory={player.priceHistory}
            isUp={isUp}
            compact
            playerName={player.name}
          />
        </div>

        {/* Question preview */}
        {market && (
          <>
            <div
              style={{
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.4,
                marginBottom: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              &ldquo;{market.question}&rdquo;
            </div>

            <SentimentBar
              yesPct={market.yesPct}
              bets={market.bets}
              yesOdds={market.yesOdds}
              noOdds={market.noOdds}
              compact
            />

            <button
              onClick={() =>
                setBetModal({ side: market.yesPct >= 50 ? "YES" : "NO", odds: market.yesPct >= 50 ? market.yesOdds : market.noOdds })
              }
              style={{
                marginTop: 10,
                width: "100%",
                padding: "8px",
                borderRadius: 10,
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                background: "linear-gradient(135deg, #38e4ee, #80faff)",
                border: "none",
                color: "white",
                boxShadow: "0 4px 12px rgba(80,245,252,0.35)",
                transition: "all 0.15s",
                letterSpacing: "0.01em",
              }}
            >
              Quick Bet →
            </button>
          </>
        )}
      </div>

      {betModal && market && (
        <BetModal
          isOpen={true}
          onClose={() => setBetModal(null)}
          playerName={player.name}
          playerTeam={player.team}
          playerPhoto={player.photo}
          question={market.question}
          side={betModal.side}
          odds={betModal.odds}
          isHot={player.isHot}
        />
      )}
    </>
  );
}
