"use client";

import { useState } from "react";
import { FEATURED_MARKET } from "../utils/mockTokenData";
import PlayerAvatar from "./PlayerAvatar";
import BetModal from "./BetModal";

function TimeLeft({ closingTime }: { closingTime: string }) {
  const diff = new Date(closingTime).getTime() - Date.now();
  if (diff <= 0) return <span style={{ color: "#ef4444" }}>Chiuso</span>;
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  return (
    <span>
      {d > 0 ? `${d}g ${h % 24}h` : `${h}h`}
    </span>
  );
}

export default function FeaturedMarket() {
  const fm = FEATURED_MARKET;
  const [betModal, setBetModal] = useState<{
    playerName: string;
    playerTeam: string;
    question: string;
    odds: number;
  } | null>(null);

  return (
    <>
      <div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: "white", marginBottom: 4 }}>
            ⭐ Featured Markets
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
            Mercati curati dalla redazione
          </div>
        </div>

        {/* Feature card */}
        <div
          style={{
            background: "rgba(19,19,26,0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(80,245,252,0.2)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(80,245,252,0.08)",
          }}
        >
          {/* Hero banner */}
          <div
            style={{
              height: 120,
              background: "linear-gradient(135deg, #1a0533 0%, #2d1065 40%, #0f0a1e 100%)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Stars decoration */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: ((i * 17) % 3) + 1,
                  height: ((i * 17) % 3) + 1,
                  background: "white",
                  borderRadius: "50%",
                  left: `${(i * 37 + 11) % 100}%`,
                  top: `${(i * 53 + 7) % 100}%`,
                  opacity: 0.2 + ((i * 13) % 40) / 100,
                }}
              />
            ))}
            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, rgba(80,245,252,0.3) 0%, transparent 70%)",
              }}
            />
            <div style={{ position: "relative", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: "rgba(80,245,252,0.3)",
                  border: "1px solid rgba(128,250,255,0.4)",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>⭐</span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#80faff",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  {fm.badge}
                </span>
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.01em",
                }}
              >
                🔥 {fm.title}
              </div>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: "24px" }}>
            {/* Question */}
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "white",
                lineHeight: 1.4,
                marginBottom: 12,
              }}
            >
              &ldquo;{fm.question}&rdquo;
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              {fm.description}
            </p>

            {/* Meta */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.05)",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                ⚽ {fm.event} · {fm.eventDate}
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.05)",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                ⏱ Chiude tra:{" "}
                <span style={{ color: "#f59e0b" }}>
                  <TimeLeft closingTime={fm.closingTime} />
                </span>
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.05)",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                💰 Pool: €{fm.totalPool.toLocaleString("it-IT")}
              </span>
            </div>

            {/* Options grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {fm.options.map((opt, i) => {
                const label = opt.player?.name ?? (opt as { label?: string }).label ?? "Altro";
                const isLast = !opt.player;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const p = opt.player;
                      if (p) {
                        setBetModal({
                          playerName: p.name,
                          playerTeam: p.team,
                          question: fm.question,
                          odds: parseFloat((100 / opt.pct).toFixed(2)),
                        });
                      }
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: 12,
                      border: "1px solid rgba(80,245,252,0.2)",
                      background: "rgba(80,245,252,0.08)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {opt.player && (
                      <PlayerAvatar
                        name={opt.player.name}
                        team={opt.player.team}
                        photo={opt.player.photo}
                        size="sm"
                        isHot={opt.player.isHot}
                      />
                    )}
                    {isLast && (
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.2rem",
                        }}
                      >
                        ?
                      </div>
                    )}
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "white" }}>
                      {label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "1rem",
                        fontWeight: 800,
                        color: "#80faff",
                      }}
                    >
                      {opt.pct}%
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <button
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                background: "linear-gradient(135deg, #38e4ee, #80faff)",
                border: "none",
                color: "white",
                boxShadow: "0 4px 20px rgba(80,245,252,0.4)",
                letterSpacing: "0.01em",
                transition: "all 0.2s",
              }}
            >
              Partecipa al Mercato →
            </button>
          </div>
        </div>
      </div>

      {betModal && (
        <BetModal
          isOpen={true}
          onClose={() => setBetModal(null)}
          playerName={betModal.playerName}
          playerTeam={betModal.playerTeam}
          question={betModal.question}
          side="YES"
          odds={betModal.odds}
        />
      )}
    </>
  );
}
