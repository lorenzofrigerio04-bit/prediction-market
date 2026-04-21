"use client";

import Image from "next/image";
import { MOCK_PLAYER_TOKENS, type PlayerToken } from "../utils/mockTokenData";

/* ─── Data ────────────────────────────────────────────────────── */

const FEATURED: PlayerToken[] = [...MOCK_PLAYER_TOKENS]
  .sort((a, b) => b.currentValue - a.currentValue)
  .slice(0, 5);

/* ─── Mini token pill ─────────────────────────────────────────── */

function TokenPill({ player }: { player: PlayerToken }) {
  const isUp = player.change24h >= 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        minWidth: 190,
        flexShrink: 0,
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          background: "rgba(56,228,238,0.08)",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {player.photo ? (
          <Image
            src={player.photo}
            alt={player.name}
            fill
            sizes="32px"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        ) : (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              fontSize: "0.85rem",
              color: "#38e4ee",
              fontWeight: 700,
            }}
          >
            {player.name[0]}
          </span>
        )}
      </div>

      {/* Name + change */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "white",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {player.name.split(" ").slice(-1)[0]}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: isUp ? "#10b981" : "#ef4444",
            marginTop: 1,
          }}
        >
          {isUp ? "+" : ""}
          {player.change24h.toFixed(1)}%
        </div>
      </div>

      {/* Value */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.80rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #38e4ee, #80faff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
          }}
        >
          €{player.currentValue.toFixed(2)}
        </div>
        <div
          style={{
            fontSize: "0.55rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            color: "rgba(255,255,255,0.22)",
            marginTop: 3,
          }}
        >
          token
        </div>
      </div>
    </div>
  );
}

/* ─── Section ─────────────────────────────────────────────────── */

export default function StarcksCTA() {
  return (
    <section aria-label="Acquista Token su Starcks" style={{ marginBottom: 48 }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          border: "1px solid rgba(56,228,238,0.18)",
          background: "linear-gradient(135deg, rgba(19,19,28,0.95) 0%, rgba(11,11,18,0.98) 100%)",
          padding: "32px 28px 28px",
        }}
      >
        {/* Top accent hairline */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(56,228,238,0.55) 50%, transparent)",
          }}
          aria-hidden
        />

        {/* Ambient glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 280,
            height: 200,
            background: "radial-gradient(ellipse, rgba(56,228,238,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
          aria-hidden
        />

        {/* Header */}
        <div style={{ marginBottom: 22, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#38e4ee",
                boxShadow: "0 0 12px rgba(56,228,238,0.60)",
              }}
              aria-hidden
            />
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                color: "#38e4ee",
              }}
            >
              Starcks Platform
            </span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-kalshi, 'Oswald', sans-serif)",
              fontSize: "clamp(1.55rem, 3.5vw, 1.85rem)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1,
              letterSpacing: "0.01em",
              margin: "0 0 10px",
            }}
          >
            Compra i Player Token
          </h2>

          <p
            style={{
              fontSize: "0.84rem",
              color: "rgba(255,255,255,0.36)",
              lineHeight: 1.65,
              maxWidth: 420,
              margin: 0,
            }}
          >
            Acquista, vendi e scambia i token dei calciatori direttamente sulla piattaforma Starcks.
          </p>
        </div>

        {/* Token pills horizontal scroll */}
        <div
          className="sm-hide-scrollbar"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            marginBottom: 24,
            paddingBottom: 2,
            position: "relative",
            zIndex: 1,
          }}
        >
          {FEATURED.map((player) => (
            <TokenPill key={player.id} player={player} />
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            marginBottom: 22,
          }}
          aria-hidden
        />

        {/* CTA row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.25)",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 320,
            }}
          >
            Oltre 18.000 holder attivi · Token al portatore · Liquidità istantanea
          </p>

          <a
            href="https://app.starcks.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 26px",
              borderRadius: 13,
              background: "linear-gradient(135deg, #38e4ee 0%, #51dce8 60%, #29c6d5 100%)",
              color: "#030f18",
              fontWeight: 800,
              fontSize: "0.875rem",
              letterSpacing: "0.02em",
              textDecoration: "none",
              boxShadow: "0 0 32px rgba(56,228,238,0.30), 0 8px 24px -8px rgba(0,0,0,0.65)",
              transition: "transform 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-1px)";
              el.style.boxShadow = "0 0 44px rgba(56,228,238,0.45), 0 12px 32px -8px rgba(0,0,0,0.7)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "0 0 32px rgba(56,228,238,0.30), 0 8px 24px -8px rgba(0,0,0,0.65)";
            }}
          >
            Vai su Starcks
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
