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
      className="group landing-trending-card relative block overflow-hidden rounded-[24px] bg-[#050913] shadow-[0_20px_55px_-22px_rgba(0,0,0,0.95)] transition-[transform,box-shadow,filter,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:shadow-[0_26px_68px_-20px_rgba(0,0,0,1)] focus-visible:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03050b]"
      aria-label={`Apri evento: ${displayTitle}`}
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
      <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(4,7,13,0.94)_0%,rgba(6,10,18,0.66)_35%,rgba(6,10,18,0.2)_70%,rgba(6,10,18,0.74)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(95%_78%_at_13%_10%,rgba(186,230,253,0.2)_0%,rgba(186,230,253,0.07)_32%,rgba(3,5,10,0)_68%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-white/95 backdrop-blur-sm sm:text-[0.67rem]">
            {category}
          </span>
        </div>

        <div className="space-y-2.5">
          <p className="line-clamp-2 font-kalshi text-[1.18rem] sm:text-[1.32rem] md:text-[1.45rem] font-bold leading-[1.06] tracking-[0.005em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.95)]">
            {displayTitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
