"use client";

import { CSSProperties, useMemo } from "react";
import { getCategoryFallbackGradient } from "@/lib/category-slug";

interface BackdropMarket {
  id: string;
  category: string;
  aiImageUrl?: string | null;
}

interface LandingMarketsBackdropWallProps {
  markets: BackdropMarket[];
}

interface EventCoverCardProps {
  market: BackdropMarket;
  index: number;
}

const CARD_LAYOUT = [
  { col: 2, row: 3 },
  { col: 3, row: 4 },
  { col: 2, row: 4 },
  { col: 3, row: 5 },
  { col: 2, row: 3 },
  { col: 2, row: 4 },
  { col: 3, row: 4 },
  { col: 2, row: 5 },
] as const;

function EventCoverCard({ market, index }: EventCoverCardProps) {
  const generatedImageUrl = `/api/ai/landing-market-image?eventId=${encodeURIComponent(market.id)}`;
  const primaryImage = market.aiImageUrl?.trim();
  const layout = CARD_LAYOUT[index % CARD_LAYOUT.length];
  const yOffset = ((index * 11) % 16) - 8;
  const xOffset = ((index * 7) % 10) - 5;
  const scale = 1 + (((index * 13) % 9) - 4) / 240;
  const rotate = (((index * 5) % 7) - 3) * 0.35;
  const style: CSSProperties = {
    gridColumn: `span ${layout.col}`,
    gridRow: `span ${layout.row}`,
    transform: `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${scale}) rotate(${rotate}deg)`,
    zIndex: 1 + (index % 6),
  };
  const backgroundLayers = [
    primaryImage ? `url("${primaryImage}")` : null,
    `url("${generatedImageUrl}")`,
    getCategoryFallbackGradient(market.category),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="landing-markets-backdrop-wall__event-card" style={style} aria-hidden>
      <div
        className="landing-markets-backdrop-wall__event-card-bg"
        style={{
          backgroundImage: backgroundLayers,
        }}
      />
    </div>
  );
}

export default function LandingMarketsBackdropWall({ markets }: LandingMarketsBackdropWallProps) {
  const tiledMarkets = useMemo(() => {
    const fallbackCategories = ["Politica", "Sport", "Economia", "Tecnologia", "Scienza", "Cultura", "Intrattenimento"];
    const source =
      markets.length > 0
        ? markets.slice(0, 50)
        : fallbackCategories.map((category, idx) => ({
            id: `fallback-${idx}`,
            category,
            aiImageUrl: null,
          }));
    const targetTiles = 220;
    return Array.from({ length: Math.max(targetTiles, source.length) }, (_, i) => source[i % source.length]);
  }, [markets]);

  return (
    <div className="landing-markets-backdrop-wall" aria-hidden>
      <div className="landing-markets-backdrop-wall__plane">
        <div className="landing-markets-backdrop-wall__grid">
          {tiledMarkets.map((market, index) => (
            <EventCoverCard key={`${market.id}-${index}`} market={market} index={index} />
          ))}
        </div>
      </div>
      <div className="landing-markets-backdrop-wall__readability-layer" />
      <div className="landing-markets-backdrop-wall__vertical-gradient" />
      <div className="landing-markets-backdrop-wall__center-calm" />
      <div className="landing-markets-backdrop-wall__arc" />
    </div>
  );
}
