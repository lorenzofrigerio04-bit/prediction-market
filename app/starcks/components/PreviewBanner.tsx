"use client";

import { useState } from "react";

export default function PreviewBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      style={{
        background: "rgba(80,245,252,0.08)",
        border: "1px solid rgba(80,245,252,0.2)",
        borderRadius: 12,
        padding: "10px 16px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "0.9rem" }}>ⓘ</span>
        <div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#80faff",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            PREVIEW MODE
          </span>
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>
            I valori token sono simulati per demo · Integrazione API Starcks in arrivo
          </span>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.25)",
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0 4px",
          flexShrink: 0,
        }}
        aria-label="Chiudi banner"
      >
        ×
      </button>
    </div>
  );
}
