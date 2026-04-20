"use client";

import { useState } from "react";
import { LONG_TERM_MARKETS } from "../utils/mockTokenData";
import { formatBets, formatValue } from "../utils/calculateOdds";
import PlayerAvatar from "./PlayerAvatar";
import BetModal from "./BetModal";

export default function LongTermMarkets() {
  const [betModal, setBetModal] = useState<{
    side: "YES" | "NO";
    odds: number;
    question: string;
    playerName: string;
    playerTeam: string;
  } | null>(null);

  return (
    <>
      <div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: "white", marginBottom: 4 }}>
            📊 Long-term Bets
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
            Mercati a lungo termine — settimane e mesi
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {LONG_TERM_MARKETS.map((ltm) => (
            <div
              key={ltm.id}
              style={{
                background: "rgba(19,19,26,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(80,245,252,0.5), transparent)",
                }}
              />

              {/* Title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "#80faff",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                    }}
                  >
                    🏆 {ltm.title}
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "white", lineHeight: 1.4 }}>
                    &ldquo;{ltm.question}&rdquo;
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 16,
                  fontSize: "0.72rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                <span>📅 Chiude: {ltm.closingDate}</span>
                <span>🎲 {formatBets(ltm.totalBets)} scommesse</span>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ltm.options.map((opt, i) => {
                  const isLast = !opt.player;
                  const label = opt.player?.name ?? (opt as { label?: string }).label ?? "Altro";
                  const value = opt.player ? formatValue(opt.player.currentValue) : "";
                  const barWidth = opt.pct;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "1px solid rgba(255,255,255,0.04)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Progress background */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${barWidth}%`,
                          background: "rgba(80,245,252,0.08)",
                          transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                        }}
                      />

                      {/* Rank */}
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: i === 0 ? "#f59e0b" : "rgba(255,255,255,0.25)",
                          minWidth: 20,
                          zIndex: 1,
                        }}
                      >
                        {i + 1}.
                      </span>

                      {/* Avatar */}
                      {opt.player && (
                        <PlayerAvatar
                          name={opt.player.name}
                          team={opt.player.team}
                          photo={opt.player.photo}
                          size="sm"
                          isHot={opt.player.isHot}
                        />
                      )}
                      {!opt.player && (
                        <div
                          style={{
                            width: 48 + 6,
                            height: 48 + 6,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                        >
                          ?
                        </div>
                      )}

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "white" }}>
                          {label}
                        </div>
                        {value && (
                          <div
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "0.72rem",
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            {value}
                          </div>
                        )}
                      </div>

                      {/* Percentage */}
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.9rem",
                          fontWeight: 800,
                          color: i === 0 ? "#80faff" : "rgba(255,255,255,0.5)",
                          zIndex: 1,
                        }}
                      >
                        {opt.pct}%
                      </span>

                      {/* Bet button */}
                      {!isLast && opt.player && (
                        <button
                          onClick={() =>
                            setBetModal({
                              side: "YES",
                              odds: parseFloat((100 / opt.pct).toFixed(2)),
                              question: ltm.question,
                              playerName: opt.player!.name,
                              playerTeam: opt.player!.team,
                            })
                          }
                          style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            background: "rgba(80,245,252,0.25)",
                            border: "1px solid rgba(80,245,252,0.4)",
                            color: "#80faff",
                            transition: "all 0.15s",
                            zIndex: 1,
                            flexShrink: 0,
                          }}
                        >
                          Bet
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {betModal && (
        <BetModal
          isOpen={true}
          onClose={() => setBetModal(null)}
          playerName={betModal.playerName}
          playerTeam={betModal.playerTeam}
          question={betModal.question}
          side={betModal.side}
          odds={betModal.odds}
        />
      )}
    </>
  );
}
