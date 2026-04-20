"use client";

export type TabId = "hot" | "active" | "longterm" | "featured";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "hot", label: "HOT", icon: "🔥" },
  { id: "active", label: "ATTIVI", icon: "⚡" },
  { id: "longterm", label: "LONG-TERM", icon: "📊" },
  { id: "featured", label: "FEATURED", icon: "⭐" },
];

interface MarketTabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function MarketTabs({ active, onChange }: MarketTabsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        marginBottom: 24,
        background: "rgba(19,19,26,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "5px",
        backdropFilter: "blur(12px)",
      }}
      className="sm-hide-scrollbar"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: "0 0 auto",
              scrollSnapAlign: "start",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              background: isActive
                ? "linear-gradient(135deg, rgba(80,245,252,0.5), rgba(128,250,255,0.3))"
                : "transparent",
              color: isActive ? "white" : "rgba(255,255,255,0.35)",
              boxShadow: isActive
                ? "0 0 16px rgba(80,245,252,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "none",
              outline: isActive ? "1px solid rgba(80,245,252,0.4)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
