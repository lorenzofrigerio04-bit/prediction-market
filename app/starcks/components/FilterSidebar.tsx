"use client";

import { FilterState, SortOption } from "../hooks/usePlayerTokens";
import { Competition, Position, Volatility } from "../utils/mockTokenData";

interface FilterSidebarProps {
  filters: FilterState;
  sort: SortOption;
  onSort: (s: SortOption) => void;
  onToggleCompetition: (c: Competition) => void;
  onTogglePosition: (p: Position) => void;
  onSetVolatility: (v: Volatility | null) => void;
  onReset: () => void;
  // mobile drawer
  isOpen?: boolean;
  onClose?: () => void;
}

const COMPETITIONS: Competition[] = ["Serie A", "Premier League", "La Liga", "Champions League"];
const POSITIONS: Position[] = ["Attaccante", "Centrocampo", "Difesa", "Portiere"];
const VOLATILITIES: { label: string; value: Volatility | null }[] = [
  { label: "Tutti", value: null },
  { label: "Alta (>10%)", value: "high" },
  { label: "Media (5-10%)", value: "medium" },
  { label: "Bassa (<5%)", value: "low" },
];
const SORTS: { label: string; value: SortOption }[] = [
  { label: "Volume", value: "volume" },
  { label: "Scadenza", value: "closing" },
  { label: "Volatilità", value: "volatility" },
  { label: "A-Z", value: "alphabetical" },
];

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        padding: "4px 0",
        fontSize: "0.8rem",
        color: checked ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
        transition: "color 0.15s",
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${checked ? "#38e4ee" : "rgba(255,255,255,0.2)"}`,
          background: checked ? "rgba(80,245,252,0.4)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#80faff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </div>
      {label}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function SidebarContent({
  filters,
  sort,
  onSort,
  onToggleCompetition,
  onTogglePosition,
  onSetVolatility,
  onReset,
}: FilterSidebarProps) {
  const activeVolatility = filters.volatilities[0] ?? null;

  return (
    <div>
      <Section title="Ordina per">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => onSort(s.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 7,
                fontSize: "0.8rem",
                fontWeight: sort === s.value ? 700 : 500,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                background: sort === s.value ? "rgba(80,245,252,0.2)" : "transparent",
                color: sort === s.value ? "#80faff" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s",
              }}
            >
              {sort === s.value && "→ "}
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Competizione">
        {COMPETITIONS.map((c) => (
          <CheckRow
            key={c}
            label={c}
            checked={filters.competitions.includes(c)}
            onChange={() => onToggleCompetition(c)}
          />
        ))}
      </Section>

      <Section title="Ruolo">
        {POSITIONS.map((p) => (
          <CheckRow
            key={p}
            label={p}
            checked={filters.positions.includes(p)}
            onChange={() => onTogglePosition(p)}
          />
        ))}
      </Section>

      <Section title="Volatilità">
        {VOLATILITIES.map((v) => (
          <label
            key={String(v.value)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              padding: "4px 0",
              fontSize: "0.8rem",
              color: activeVolatility === v.value ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `1.5px solid ${activeVolatility === v.value ? "#38e4ee" : "rgba(255,255,255,0.2)"}`,
                background: activeVolatility === v.value ? "#38e4ee" : "transparent",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
              onClick={() => onSetVolatility(v.value)}
            />
            {v.label}
          </label>
        ))}
      </Section>

      <button
        onClick={onReset}
        style={{
          width: "100%",
          padding: "9px",
          borderRadius: 10,
          fontSize: "0.78rem",
          fontWeight: 600,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.35)",
          cursor: "pointer",
          transition: "all 0.15s",
          letterSpacing: "0.02em",
        }}
      >
        Azzera filtri
      </button>
    </div>
  );
}

export default function FilterSidebar(props: FilterSidebarProps) {
  const { isOpen, onClose } = props;

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className="sm-filter-desktop"
        style={{
          background: "rgba(19,19,26,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "20px 16px",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 80,
          height: "fit-content",
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#80faff",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ⚙️ Filtri
        </div>
        <SidebarContent {...props} />
      </div>

      {/* Mobile bottom drawer */}
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 8000 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(19,19,26,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "20px 20px 32px",
              maxHeight: "80vh",
              overflowY: "auto",
              backdropFilter: "blur(20px)",
              animation: "sm-drawer-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            {/* Handle */}
            <div
              style={{
                width: 36,
                height: 4,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 100,
                margin: "0 auto 20px",
              }}
            />
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "white",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              ⚙️ Filtri
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
            <SidebarContent {...props} />
          </div>
        </div>
      )}
    </>
  );
}
