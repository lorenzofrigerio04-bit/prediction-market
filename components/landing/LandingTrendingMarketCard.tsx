"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getCategoryFallbackGradient } from "@/lib/category-slug";
import { getEventDisplayTitle } from "@/lib/market-types";

interface LandingTrendingMarketCardProps {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  onNavigate?: () => void;
}

export default function LandingTrendingMarketCard({
  id,
  title,
  category,
  imageUrl,
  onNavigate,
}: LandingTrendingMarketCardProps) {
  const fallbackGradient = getCategoryFallbackGradient(category);
  const displayTitle = getEventDisplayTitle(title);
  const generatedImageUrl = useMemo(
    () => `/api/ai/landing-market-image?eventId=${encodeURIComponent(id)}`,
    [id]
  );
  const [resolvedImage, setResolvedImage] = useState(imageUrl?.trim() || generatedImageUrl);
  const [useGradientOnly, setUseGradientOnly] = useState(false);

  return (
    <Link
      href={`/events/${id}`}
      onClick={onNavigate}
      className="group landing-trending-card relative block overflow-hidden rounded-lg border border-white/10 bg-black/25 shadow-[0_10px_24px_rgba(0,0,0,0.38)] transition-transform duration-300 hover:scale-[1.03] focus-visible:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.06]"
        style={{ background: fallbackGradient }}
      />
      {!useGradientOnly && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          onError={() => {
            if (resolvedImage !== generatedImageUrl) {
              setResolvedImage(generatedImageUrl);
              return;
            }
            setUseGradientOnly(true);
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-black/8" />
      <div className="relative z-10 flex h-full flex-col justify-end p-2.5">
        <p className="line-clamp-3 text-[0.72rem] font-semibold leading-[1.25] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {displayTitle}
        </p>
      </div>
    </Link>
  );
}
