"use client";

import { HOT_MOVERS } from "../utils/mockTokenData";
import HotMoverCard from "./HotMoverCard";

export default function HeroSection() {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Title block */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: 100,
            background: "rgba(80,245,252,0.12)",
            border: "1px solid rgba(80,245,252,0.3)",
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: "0.7rem" }}>💜</span>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#80faff",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            In Partnership con Starcks
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
            fontWeight: 900,
            color: "white",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          📈 Starcks Market
        </h1>

        <p
          style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          Scommetti sull&apos;andamento dei Player Token. Predici chi salirà, chi scenderà.
        </p>
      </div>

      {/* Hot Movers carousel */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              🔥 HOT MOVERS
            </span>
            <span
              style={{
                fontSize: "0.6rem",
                color: "rgba(255,255,255,0.2)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              · aggiornato 2 min fa
            </span>
          </div>
          <span
            style={{
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            scorri →
          </span>
        </div>

        {/* Horizontal scroll container */}
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 8,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
          className="sm-hide-scrollbar"
        >
          {HOT_MOVERS.map((player) => (
            <div key={player.id} style={{ scrollSnapAlign: "start" }}>
              <HotMoverCard player={player} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
