"use client";

import { useState, useEffect } from "react";
import { potentialWinnings } from "../utils/calculateOdds";
import PlayerAvatar from "./PlayerAvatar";

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerTeam: string;
  playerPhoto?: string;
  question: string;
  side: "YES" | "NO";
  odds: number;
  isHot?: boolean;
}

const QUICK_AMOUNTS = [50, 100, 250, 500];
const MAX_CREDITS = 1000;

export default function BetModal({
  isOpen,
  onClose,
  playerName,
  playerTeam,
  playerPhoto,
  question,
  side,
  odds,
  isHot = false,
}: BetModalProps) {
  const [amount, setAmount] = useState(100);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmed(false);
      setAmount(100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const winnings = potentialWinnings(amount, odds);
  const profit = winnings - amount;
  const isYes = side === "YES";
  const sideColor = isYes ? "#10b981" : "#ef4444";
  const sideBg = isYes ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)";
  const sideBorder = isYes ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)";

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(12px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          background: "rgba(19,19,26,0.97)",
          border: "1px solid rgba(80,245,252,0.4)",
          borderRadius: 20,
          padding: "28px 24px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(80,245,252,0.15)",
          backdropFilter: "blur(20px)",
          animation: "sm-modal-in 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {confirmed ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎉</div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "white",
                marginBottom: 8,
              }}
            >
              Scommessa confermata!
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
              Hai scommesso{" "}
              <span style={{ color: sideColor, fontWeight: 700 }}>{amount} crediti</span>{" "}
              su <span style={{ color: sideColor, fontWeight: 700 }}>{side}</span>
            </div>
            <div
              style={{
                marginTop: 12,
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.75rem",
              }}
            >
              Vincita potenziale: {winnings} crediti
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <PlayerAvatar name={playerName} team={playerTeam} photo={playerPhoto} size="sm" isHot={isHot} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 3,
                  }}
                >
                  {playerName}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.45)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {question}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Side badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 10,
                background: sideBg,
                border: `1px solid ${sideBorder}`,
                marginBottom: 20,
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1rem" }}>{isYes ? "✅" : "❌"}</span>
                <span style={{ color: sideColor, fontWeight: 700, fontSize: "0.95rem" }}>
                  Stai scommettendo su {side}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.8rem",
                  color: sideColor,
                  fontWeight: 600,
                }}
              >
                {odds.toFixed(2)}x
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />

            {/* Amount input */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Importo
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(80,245,252,0.3)",
                  borderRadius: 12,
                  padding: "10px 16px",
                  gap: 8,
                  transition: "border-color 0.15s",
                }}
              >
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Math.min(MAX_CREDITS, Number(e.target.value))))}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: "center",
                  }}
                  min={1}
                  max={MAX_CREDITS}
                />
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", fontWeight: 500 }}>
                  Credits
                </span>
              </div>
            </div>

            {/* Quick amounts */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {QUICK_AMOUNTS.map((qa) => (
                <button
                  key={qa}
                  onClick={() => setAmount(qa)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    borderRadius: 8,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: amount === qa ? "rgba(80,245,252,0.25)" : "rgba(255,255,255,0.05)",
                    borderColor: amount === qa ? "rgba(80,245,252,0.6)" : "rgba(255,255,255,0.1)",
                    color: amount === qa ? "#80faff" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {qa}
                </button>
              ))}
              <button
                onClick={() => setAmount(MAX_CREDITS)}
                style={{
                  flex: 1,
                  padding: "7px 4px",
                  borderRadius: 8,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  background: amount === MAX_CREDITS ? "rgba(80,245,252,0.25)" : "rgba(255,255,255,0.05)",
                  borderColor: amount === MAX_CREDITS ? "rgba(80,245,252,0.6)" : "rgba(255,255,255,0.1)",
                  color: amount === MAX_CREDITS ? "#80faff" : "rgba(255,255,255,0.4)",
                  transition: "all 0.15s",
                }}
              >
                MAX
              </button>
            </div>

            {/* Winnings display */}
            <div
              style={{
                background: "rgba(80,245,252,0.08)",
                border: "1px solid rgba(80,245,252,0.2)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>
                  VINCITA POTENZIALE
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "#80faff",
                  }}
                >
                  💰 {winnings}
                </div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                  +{profit} crediti di profitto
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>
                  ODDS
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: sideColor,
                  }}
                >
                  {odds.toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: "0 0 auto",
                  padding: "13px 20px",
                  borderRadius: 12,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: "13px 20px",
                  borderRadius: 12,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${sideColor}, ${isYes ? "#059669" : "#dc2626"})`,
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  boxShadow: `0 4px 16px ${sideColor}44`,
                  transition: "all 0.15s",
                  letterSpacing: "0.01em",
                }}
              >
                Conferma Scommessa {side} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
