"use client";

import Image from "next/image";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { MOCK_PLAYER_TOKENS, type PlayerToken } from "../utils/mockTokenData";

/* ─── Data ─────────────────────────────────────────────────── */
const TOP_PLAYERS = [...MOCK_PLAYER_TOKENS]
  .filter((p) => p.change30d > 0)
  .sort((a, b) => b.change30d - a.change30d)
  .slice(0, 10);

/* ─── Rank stroke — identical to homepage Top 5 ────────────── */
const RANK_STROKE = "1.5px rgba(255,255,255,0.22)";

/* ─── Top-edge hairline ─────────────────────────────────────── */
const PODIUM_LINE: Record<number, string> = {
  1: "linear-gradient(90deg,transparent,rgba(251,191,36,.75) 50%,transparent)",
  2: "linear-gradient(90deg,transparent,rgba(210,215,225,.50) 50%,transparent)",
  3: "linear-gradient(90deg,transparent,rgba(194,120,70,.48) 50%,transparent)",
};

/* ─── Team accent colors (bg behind photo) ──────────────────── */
const TEAM_HUE: Record<string, string> = {
  Inter:        "#001f6b",
  Napoli:       "#085299",
  Milan:        "#7a0518",
  Juventus:     "#111111",
  Roma:         "#5c0000",
  Liverpool:    "#8c0a1f",
  "Real Madrid":"#9a7e20",
  PSG:          "#002a5c",
  "Man City":   "#3a7ab3",
  Barcellona:   "#6e002e",
};

/* ─── Ghost chart — fills background of left panel ─────────── */
function GhostChart({ player }: { player: PlayerToken }) {
  const data = player.priceHistory.slice(-30);
  const id   = `ghost-${player.id}`;
  return (
    /*
     * absolute fill, pointer-events none so data labels stay clickable.
     * opacity on the wrapping div so the chart SVG itself stays full-color
     * and recharts doesn't interfere.
     */
    <div
      style={{
        position : "absolute",
        inset    : 0,
        opacity  : 0.13,
        pointerEvents: "none",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: -8, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2.5}
            fill={`url(#${id})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Card ──────────────────────────────────────────────────── */
function PlayerCard({ player, rank }: { player: PlayerToken; rank: number }) {
  const teamHue   = TEAM_HUE[player.team] ?? "#0d0d15";
  const podiumLine = PODIUM_LINE[rank];
  const PHOTO_W   = 112;
  const CARD_H    = 128;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>

      {/* ── rank — same as homepage Top 5 ──────────────────── */}
      <div
        style={{
          width         : 36,
          flexShrink    : 0,
          display       : "flex",
          justifyContent: "center",
          paddingBottom : 10,   /* anchored to card bottom, like pb-2.5 */
        }}
      >
        <span
          aria-hidden
          style={{
            fontFamily      : "'Oswald', sans-serif",
            fontSize        : "3.4rem",
            fontWeight      : 900,
            lineHeight      : 1,
            color           : "transparent",
            WebkitTextStroke: RANK_STROKE,
            userSelect      : "none",
            display         : "block",
          }}
        >
          {rank}
        </span>
      </div>

      {/* ── card body ───────────────────────────────────────── */}
      <div
        className="sm-market-card"
        style={{
          flex      : 1,
          minWidth  : 0,
          height    : CARD_H,
          display   : "flex",
          borderRadius : 16,
          overflow  : "hidden",
          border    : "1px solid rgba(255,255,255,0.07)",
          background: "#0b0b12",
          position  : "relative",
          transition: "border-color .22s, transform .22s, box-shadow .22s",
        }}
      >
        {/* top accent */}
        {podiumLine && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 1, background: podiumLine, zIndex: 5,
          }} aria-hidden />
        )}

        {/* ══════════════════════════════════════════════════
            LEFT panel — chart is the background texture
        ══════════════════════════════════════════════════ */}
        <div
          style={{
            flex    : 1,
            minWidth: 0,
            position: "relative",
            display : "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding : "14px 18px",
            background: "#0b0b12",
          }}
        >
          {/* ghost chart fills the whole left panel */}
          <GhostChart player={player} />

          {/* right-edge fade — softens transition toward photo */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            width: 80,
            background: "linear-gradient(90deg,transparent,#0b0b12 90%)",
            zIndex: 2,
            pointerEvents: "none",
          }} aria-hidden />

          {/* ── TOP: name + team ─────────── */}
          <div style={{ position: "relative", zIndex: 3 }}>
            <div style={{
              fontSize    : "0.90rem",
              fontWeight  : 800,
              color       : "white",
              letterSpacing: "-0.012em",
              lineHeight  : 1.15,
              whiteSpace  : "nowrap",
              overflow    : "hidden",
              textOverflow: "ellipsis",
            }}>
              {player.name}
            </div>
            <div style={{
              fontSize     : "0.63rem",
              color        : "rgba(255,255,255,0.30)",
              marginTop    : 3,
              fontFamily   : "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
              whiteSpace   : "nowrap",
            }}>
              {player.team} · {player.competition}
            </div>
          </div>

          {/* ── BOTTOM: return % + value ─── */}
          <div style={{
            position: "relative",
            zIndex  : 3,
            display : "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}>

            {/* Return % — hero number */}
            <div>
              <div style={{
                fontFamily   : "'JetBrains Mono', monospace",
                fontSize     : "1.75rem",
                fontWeight   : 900,
                lineHeight   : 1,
                letterSpacing: "-0.04em",
                color        : "#10b981",
                textShadow   : "0 0 22px rgba(16,185,129,0.55)",
              }}>
                ↗&nbsp;+{player.change30d.toFixed(1)}%
              </div>
              <div style={{
                fontSize     : "0.56rem",
                fontWeight   : 600,
                textTransform: "uppercase",
                letterSpacing: "0.13em",
                color        : "rgba(255,255,255,0.22)",
                marginTop    : 4,
              }}>
                rendimento 30g
              </div>
            </div>

            {/* Current value */}
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily   : "'JetBrains Mono', monospace",
                fontSize     : "1.20rem",
                fontWeight   : 800,
                lineHeight   : 1,
                letterSpacing: "-0.02em",
                background   : "linear-gradient(135deg,#38e4ee 0%,#80faff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor : "transparent",
                backgroundClip      : "text",
              }}>
                €{player.currentValue.toFixed(2)}
              </div>
              <div style={{
                fontSize     : "0.56rem",
                fontWeight   : 600,
                textTransform: "uppercase",
                letterSpacing: "0.13em",
                color        : "rgba(255,255,255,0.22)",
                marginTop    : 4,
              }}>
                valore token
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT panel — vertical photo rectangle
        ══════════════════════════════════════════════════ */}
        <div
          style={{
            width     : PHOTO_W,
            flexShrink: 0,
            position  : "relative",
            overflow  : "hidden",
            background: teamHue,
          }}
        >
          {player.photo && (
            <Image
              src={player.photo}
              alt={player.name}
              fill
              sizes={`${PHOTO_W}px`}
              style={{
                objectFit     : "cover",
                objectPosition: "center top",
              }}
              priority={rank <= 3}
            />
          )}

          {/* left fade — wide, smooth dissolve into data panel */}
          <div style={{
            position: "absolute", inset: 0,
            background: [
              "linear-gradient(90deg,",
              "#0b0b12 0%,",
              "#0b0b12 8%,",
              "rgba(11,11,18,0.92) 22%,",
              "rgba(11,11,18,0.70) 38%,",
              "rgba(11,11,18,0.38) 55%,",
              "rgba(11,11,18,0.10) 72%,",
              "transparent 88%",
              ")",
            ].join(""),
            zIndex: 1,
          }} aria-hidden />

          {/* bottom vignette */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg,transparent 55%,rgba(0,0,0,.55) 100%)",
            zIndex: 1,
          }} aria-hidden />
        </div>
      </div>
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────────── */
export default function TopStarcksPlayers() {
  return (
    <section aria-label="Top 10 Starcks Players" style={{ marginBottom: 44 }}>

      {/* header */}
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{
            display: "inline-block", width: 6, height: 6, borderRadius: "50%",
            background: "#fbbf24", boxShadow: "0 0 12px rgba(252,211,77,.60)",
          }} aria-hidden />
          <span style={{
            fontFamily   : "'Oswald', sans-serif",
            fontSize     : 10,
            fontWeight   : 600,
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            color        : "#fbbf24",
          }}>
            Rendimento 30 giorni
          </span>
        </div>

        <h2 style={{
          fontFamily   : "var(--font-kalshi,'Oswald',sans-serif)",
          fontSize     : "clamp(1.75rem,4vw,2rem)",
          fontWeight   : 700,
          color        : "white",
          lineHeight   : 1,
          letterSpacing: "0.02em",
          margin       : 0,
        }}>
          Top Starcks Players
        </h2>

        <div style={{
          marginTop : 12,
          height    : 1,
          background: "linear-gradient(90deg,rgba(251,191,36,.70),rgba(251,191,36,.16),transparent)",
        }} aria-hidden />
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {TOP_PLAYERS.map((player, i) => (
          <PlayerCard key={player.id} player={player} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
