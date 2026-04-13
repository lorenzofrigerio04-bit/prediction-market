"use client";

import Link from "next/link";
import { useState } from "react";
import { getCategoryFallbackGradient } from "@/lib/category-slug";
import { getEventDisplayTitle } from "@/lib/market-types";

interface PreloginEventHeroCardProps {
  rank: number;
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  onNavigate?: () => void;
}

export default function PreloginEventHeroCard({
  rank,
  id,
  title,
  category,
  imageUrl,
  onNavigate,
}: PreloginEventHeroCardProps) {
  const fallbackGradient = getCategoryFallbackGradient(category);
  const displayTitle = getEventDisplayTitle(title);
  const generatedImageUrl = `/api/ai/landing-market-image?eventId=${encodeURIComponent(id)}`;
  const [resolvedImage, setResolvedImage] = useState(generatedImageUrl);
  const [useGradientOnly, setUseGradientOnly] = useState(false);
  const isDoubleDigit = rank >= 10;

  return (
    <div
      className={`relative flex w-full items-stretch ${
        isDoubleDigit ? "pl-11 sm:pl-13" : "pl-8 sm:pl-9"
      }`}
    >
      <span
        className={`pointer-events-none absolute bottom-[-4px] z-30 font-kalshi leading-[0.8] ${
          isDoubleDigit ? "left-0 text-[5.2rem] sm:text-[5.8rem]" : "left-1 text-[6rem] sm:text-[6.7rem]"
        }`}
        style={{
          fontFamily: "var(--font-levels), 'Bebas Neue', 'Arial Narrow', sans-serif",
          fontWeight: 700,
          letterSpacing: "0.01em",
          color: "#f8fafc",
          WebkitTextFillColor: "#f8fafc",
          WebkitTextStroke: "1.8px rgba(8, 10, 14, 0.86)",
          textShadow:
            "0 4px 12px rgba(0,0,0,0.72), 0 12px 26px rgba(0,0,0,0.55), 0 0 18px rgba(255,255,255,0.18)",
        }}
        aria-hidden
      >
        {rank}
      </span>
      <Link
        href={`/events/${id}`}
        onClick={onNavigate}
        className="group prelogin-hero-card relative block min-h-[176px] w-full overflow-hidden rounded-2xl border border-white/18 bg-black/20 shadow-[0_10px_30px_rgba(0,0,0,0.42)] sm:min-h-[192px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ background: fallbackGradient }}
        />
        {!useGradientOnly && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => {
              if (resolvedImage !== (imageUrl?.trim() || "")) {
                if (imageUrl?.trim()) {
                  setResolvedImage(imageUrl.trim());
                  return;
                }
                setUseGradientOnly(true);
                return;
              }
              setUseGradientOnly(true);
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(102deg, rgba(3,6,12,0.96) 0%, rgba(6,9,16,0.84) 36%, rgba(7,10,17,0.5) 70%, rgba(7,10,17,0.18) 100%), radial-gradient(65% 95% at 12% 52%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.02) 38%, rgba(255,255,255,0) 100%)",
          }}
        />
        <div className="relative z-20 flex h-full flex-col justify-between p-3.5 sm:p-4">
          <div className="max-w-[72%] rounded-xl border border-white/14 bg-black/26 px-3 py-2 backdrop-blur-[1.5px]">
            <h3
              className="font-kalshi text-[1.02rem] font-bold leading-[1.12] tracking-[0.004em] text-white sm:text-[1.2rem]"
              style={{ textShadow: "0 6px 18px rgba(0,0,0,0.82)" }}
            >
              {displayTitle}
            </h3>
          </div>
          <div className="flex items-end justify-between gap-3">
            <span className="inline-flex rounded-md border border-white/30 bg-black/35 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-white/90 sm:text-[0.66rem]">
              {category}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
