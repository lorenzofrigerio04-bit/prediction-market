"use client";

import Header from "@/components/Header";
import TopStarcksPlayers from "./components/TopStarcksPlayers";
import TokenEventsSection from "./components/TokenEventsSection";
import StarcksCTA from "./components/StarcksCTA";

const PAGE_STYLES = `
  .starcks-root {
    --sm-cyan: #38e4ee;
  }
  .sm-market-card:hover {
    border-color: rgba(80,245,252,0.35) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(80,245,252,0.12) !important;
    transform: translateY(-2px);
  }
  .sm-hide-scrollbar::-webkit-scrollbar { display: none; }
  .sm-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .starcks-root ::-webkit-scrollbar { width: 4px; height: 4px; }
  .starcks-root ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 100px; }
  .starcks-root ::-webkit-scrollbar-thumb { background: rgba(80,245,252,0.4); border-radius: 100px; }
  .starcks-root ::-webkit-scrollbar-thumb:hover { background: rgba(128,250,255,0.6); }
  @keyframes sm-fade-in-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sm-fade-in { animation: sm-fade-in-up 0.5s cubic-bezier(0.4,0,0.2,1) both; }
`;

export default function StarcksPage() {
  return (
    <>
      <style>{PAGE_STYLES}</style>

      <div
        className="starcks-root"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #050508 0%, #0a0a12 40%, #08080f 100%)",
          position: "relative",
        }}
      >
        {/* Ambient glow orbs */}
        <div
          style={{
            position: "fixed",
            top: "15%",
            left: "20%",
            width: 600,
            height: 600,
            background: "radial-gradient(ellipse, rgba(80,245,252,0.06) 0%, transparent 65%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
          aria-hidden
        />
        <div
          style={{
            position: "fixed",
            top: "55%",
            right: "10%",
            width: 400,
            height: 400,
            background: "radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 65%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
          aria-hidden
        />

        <Header showCategoryStrip={false} />

        <main
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px 16px calc(var(--bottom-nav-total, 80px) + 32px)",
          }}
        >
          {/* ── Page header ── */}
          <div className="sm-fade-in" style={{ marginBottom: 48 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px",
                borderRadius: 100,
                background: "rgba(56,228,238,0.10)",
                border: "1px solid rgba(56,228,238,0.22)",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "#80faff",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  fontFamily: "'Oswald', sans-serif",
                }}
              >
                In Partnership con Starcks
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-kalshi, 'Oswald', sans-serif)",
                fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                fontWeight: 900,
                color: "white",
                lineHeight: 1,
                letterSpacing: "-0.015em",
                marginBottom: 10,
              }}
            >
              Starcks Market
            </h1>

            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.38)",
                lineHeight: 1.65,
                maxWidth: 460,
              }}
            >
              Mercati di prediction sui Player Token. Scommetti sull&apos;andamento dei calciatori.
            </p>
          </div>

          {/* ── Top 10 ── */}
          <TopStarcksPlayers />

          {/* ── Token prediction events ── */}
          <TokenEventsSection />

          {/* ── Buy tokens CTA ── */}
          <StarcksCTA />
        </main>
      </div>
    </>
  );
}
