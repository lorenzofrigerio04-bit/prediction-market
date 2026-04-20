"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "./components/HeroSection";
import MarketTabs, { TabId } from "./components/MarketTabs";
import MarketCard from "./components/MarketCard";
import FilterSidebar from "./components/FilterSidebar";
import ActiveMarketsList from "./components/ActiveMarketsList";
import LongTermMarkets from "./components/LongTermMarkets";
import FeaturedMarket from "./components/FeaturedMarket";
import PriceTicker from "./components/PriceTicker";
import { usePlayerTokens } from "./hooks/usePlayerTokens";

const PAGE_STYLES = `
  /* ── Starcks Market scoped vars ── */
  .starcks-root {
    --sm-purple: #38e4ee;
    --sm-purple-light: #80faff;
    --sm-purple-dark: #2dd4dc;
    --sm-bg: #0a0a0f;
    --sm-bg-2: #13131a;
    --sm-bg-3: #1a1a24;
    --sm-gold: #f59e0b;
    --sm-green: #10b981;
    --sm-red: #ef4444;
  }

  /* ── Animations ── */
  @keyframes sm-ring-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes sm-hot-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(239,68,68,0.5); }
    50%       { opacity: 0.85; box-shadow: 0 0 20px rgba(239,68,68,0.7); }
  }
  @keyframes sm-fade-in-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sm-modal-in {
    from { opacity: 0; transform: scale(0.94) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes sm-drawer-in {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes sm-ticker-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes sm-shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position: 800px 0; }
  }
  @keyframes sm-live-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  /* ── Market card hover ── */
  .sm-market-card:hover {
    border-color: rgba(80,245,252,0.35) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(80,245,252,0.12) !important;
    transform: translateY(-2px);
  }

  /* ── Hot card hover ── */
  .sm-hot-card:hover {
    border-color: rgba(239,68,68,0.3) !important;
    box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 20px rgba(239,68,68,0.1) !important;
    transform: translateY(-2px);
  }

  /* ── Active row hover ── */
  .sm-active-row:hover {
    border-color: rgba(80,245,252,0.2) !important;
    background: rgba(26,26,36,0.85) !important;
  }

  /* ── Ticker pause on hover ── */
  .sm-ticker-track:hover {
    animation-play-state: paused;
  }

  /* ── Hide scrollbar utility ── */
  .sm-hide-scrollbar::-webkit-scrollbar { display: none; }
  .sm-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* ── Stagger animation for market cards ── */
  .sm-card-stagger { animation: sm-fade-in-up 0.5s cubic-bezier(0.4,0,0.2,1) both; }

  /* ── Desktop filter column layout ── */
  @media (max-width: 767px) {
    .sm-filter-desktop { display: none; }
  }

  /* ── Premium scrollbar for inner containers ── */
  .starcks-root ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .starcks-root ::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.03);
    border-radius: 100px;
  }
  .starcks-root ::-webkit-scrollbar-thumb {
    background: rgba(80,245,252,0.4);
    border-radius: 100px;
  }
  .starcks-root ::-webkit-scrollbar-thumb:hover {
    background: rgba(128,250,255,0.6);
  }
`;

function HotMarketsTab() {
  const {
    players,
    totalFiltered,
    filters,
    sort,
    setSort,
    hasMore,
    loadMore,
    toggleCompetition,
    togglePosition,
    setVolatility,
    resetFilters,
  } = usePlayerTokens();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <div>
      {/* Mobile filter button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
          {totalFiltered} mercati trovati
        </div>
        <button
          className="sm-filter-mobile-btn"
          onClick={() => setMobileFilterOpen(true)}
          style={{
            display: "none",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 10,
            fontSize: "0.78rem",
            fontWeight: 600,
            background: "rgba(80,245,252,0.15)",
            border: "1px solid rgba(80,245,252,0.3)",
            color: "#80faff",
            cursor: "pointer",
          }}
        >
          ⚙️ Filtri
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 20,
          alignItems: "start",
        }}
        className="sm-content-grid"
      >
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          sort={sort}
          onSort={setSort}
          onToggleCompetition={toggleCompetition}
          onTogglePosition={togglePosition}
          onSetVolatility={setVolatility}
          onReset={resetFilters}
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
        />

        {/* Market cards */}
        <div>
          {players.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {players.map((player, i) => (
                  <div
                    key={player.id}
                    className="sm-card-stagger"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <MarketCard player={player} index={i} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button
                    onClick={loadMore}
                    style={{
                      padding: "12px 32px",
                      borderRadius: 12,
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: "rgba(80,245,252,0.15)",
                      border: "1px solid rgba(80,245,252,0.3)",
                      color: "#80faff",
                      transition: "all 0.2s",
                    }}
                  >
                    Carica altri →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile grid style override */}
      <style>{`
        @media (max-width: 767px) {
          .sm-content-grid {
            grid-template-columns: 1fr !important;
          }
          .sm-filter-mobile-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 24px",
        background: "rgba(19,19,26,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: 16 }}>📊✨</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: 8 }}>
        Nessun mercato attivo al momento
      </div>
      <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", maxWidth: 340, margin: "0 auto" }}>
        I nuovi mercati token vengono creati prima dei big match. Prova a rimuovere i filtri.
      </p>
    </div>
  );
}

export default function StarckMarketPage() {
  const [activeTab, setActiveTab] = useState<TabId>("hot");

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

        {/* App header */}
        <Header showCategoryStrip={false} />

        {/* Live price ticker */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <PriceTicker />
        </div>

        {/* Main content */}
        <main
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "28px 16px calc(var(--bottom-nav-total, 80px) + 28px)",
          }}
        >
          {/* Hero section with Hot Movers carousel */}
          <HeroSection />

          {/* Tabs */}
          <MarketTabs active={activeTab} onChange={setActiveTab} />

          {/* Tab content */}
          {activeTab === "hot" && <HotMarketsTab />}
          {activeTab === "active" && <ActiveMarketsList />}
          {activeTab === "longterm" && <LongTermMarkets />}
          {activeTab === "featured" && <FeaturedMarket />}
        </main>
      </div>
    </>
  );
}
