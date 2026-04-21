"use client";

import { MOCK_PLAYER_TOKENS, type PlayerToken, type Market } from "../utils/mockTokenData";

/* ─── Data helpers ────────────────────────────────────────────── */

type EventItem = { player: PlayerToken; market: Market };

function getEvents(): EventItem[] {
  const items: EventItem[] = [];
  for (const player of MOCK_PLAYER_TOKENS) {
    for (const market of player.markets) {
      items.push({ player, market });
    }
  }
  return items.sort((a, b) => b.market.bets - a.market.bets).slice(0, 6);
}

function countdown(closingTime: string): string {
  const diff = new Date(closingTime).getTime() - Date.now();
  if (diff <= 0) return "Chiuso";
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}g ${h % 24}h`;
  if (h > 0) return `${h}h`;
  return "<1h";
}

/* ─── Card ────────────────────────────────────────────────────── */
/* Visual language mirrors Top24hSection / LandingTrendingMarketCard */

function TokenEventCard({ player, market, index }: EventItem & { index: number }) {
  const isUrgent = new Date(market.closingTime).getTime() - Date.now() < 6 * 3600_000;
  const time = countdown(market.closingTime);

  return (
    <a
      href={`https://app.starcks.io/token/${player.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
      style={{
        display: "block",
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#060c1a",
        aspectRatio: "4 / 3",
        textDecoration: "none",
        transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
        animation: "sm-fade-in-up 0.5s cubic-bezier(0.4,0,0.2,1) both",
        animationDelay: `${index * 70}ms`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(255,255,255,0.14)";
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 20px 48px -16px rgba(0,0,0,0.85)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      {/* ── Background: player photo ───────────────────────────── */}
      {player.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.photo}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
          className="group-hover:[transform:scale(1.04)]"
        />
      )}

      {/* ── Gradient layers (same as homepage RankedEventCard) ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0.18) 100%)",
        }}
        aria-hidden
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(4,7,13,0.72) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      {/* ── Top glimmer ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 50%, transparent)",
        }}
        aria-hidden
      />

      {/* ── Top row: team badge + hot tag ───────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 100,
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
            padding: "3px 10px",
            fontSize: "0.60rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {player.team}
        </span>

        {market.isHot && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 100,
              background: "rgba(239,68,68,0.18)",
              border: "1px solid rgba(239,68,68,0.32)",
              backdropFilter: "blur(8px)",
              padding: "3px 8px",
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#f87171",
            }}
          >
            HOT
          </span>
        )}
      </div>

      {/* ── Bottom content ───────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Player name */}
        <div
          style={{
            fontSize: "0.62rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {player.name}
        </div>

        {/* Market question */}
        <p
          style={{
            fontFamily: "var(--font-kalshi, 'Oswald', sans-serif)",
            fontSize: "0.95rem",
            fontWeight: 700,
            lineHeight: 1.22,
            letterSpacing: "0.005em",
            color: "white",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textShadow: "0 2px 12px rgba(0,0,0,0.95)",
          }}
        >
          {market.question}
        </p>

        {/* Bottom row: sentiment + countdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {/* Yes% bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
            <div
              style={{
                height: 3,
                width: 56,
                flexShrink: 0,
                borderRadius: 100,
                background: "rgba(255,255,255,0.10)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${market.yesPct}%`,
                  borderRadius: 100,
                  background: market.yesPct >= 50 ? "#10b981" : "#ef4444",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.67rem",
                fontWeight: 700,
                color: market.yesPct >= 50 ? "#10b981" : "#f87171",
              }}
            >
              {market.yesPct}% SÌ
            </span>
          </div>

          {/* Countdown */}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.60rem",
              fontWeight: 600,
              color: isUrgent ? "#f59e0b" : "rgba(255,255,255,0.30)",
              whiteSpace: "nowrap",
            }}
          >
            {time}
          </span>
        </div>
      </div>
    </a>
  );
}

/* ─── Section ─────────────────────────────────────────────────── */

export default function TokenEventsSection() {
  const events = getEvents();

  return (
    <section aria-label="Mercati Prediction Token" style={{ marginBottom: 52 }}>

      {/* Header — same language as TopStarcksPlayers */}
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
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
            Mercati Attivi
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-kalshi, 'Oswald', sans-serif)",
            fontSize: "clamp(1.75rem, 4vw, 2rem)",
            fontWeight: 700,
            color: "white",
            lineHeight: 1,
            letterSpacing: "0.02em",
            margin: 0,
          }}
        >
          Prediction Markets
        </h2>

        <p
          style={{
            marginTop: 8,
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.32)",
            lineHeight: 1.55,
          }}
        >
          Scommetti sull&apos;andamento dei Player Token
        </p>

        <div
          style={{
            marginTop: 12,
            height: 1,
            background: "linear-gradient(90deg, rgba(56,228,238,0.70), rgba(56,228,238,0.16), transparent)",
          }}
          aria-hidden
        />
      </header>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 10,
        }}
      >
        {events.map(({ player, market }, i) => (
          <TokenEventCard key={market.id} player={player} market={market} index={i} />
        ))}
      </div>
    </section>
  );
}
