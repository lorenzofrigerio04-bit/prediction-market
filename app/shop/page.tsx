"use client";

import Header from "@/components/Header";

export default function ShopPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "rgb(var(--admin-bg))",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header showCategoryStrip={false} />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "clamp(40px,10vh,96px) clamp(20px,5vw,48px)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "rgba(56,228,238,0.08)",
            border: "1px solid rgba(56,228,238,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#38E4EE"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>

        {/* Label */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#38E4EE",
            marginBottom: 14,
          }}
        >
          Shop
        </p>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(2rem,5.5vw,3rem)",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: "#ffffff",
            marginBottom: 16,
          }}
        >
          Prossimamente
        </h1>

        {/* Description */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(14px,2.2vw,16px)",
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1.65,
            maxWidth: 400,
          }}
        >
          Lo shop di PredictionMaster è in arrivo. <br />
          Premi esclusivi, gadget e molto altro per i migliori predittori.
        </p>
      </main>
    </div>
  );
}
