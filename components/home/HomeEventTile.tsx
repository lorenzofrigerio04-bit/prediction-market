"use client";

import Link from "next/link";
import { getCategoryFallbackGradient } from "@/lib/category-slug";

interface HomeEventTileProps {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability?: number;
}

function formatTimeLeft(closesAt: string): string {
  const ms = new Date(closesAt).getTime() - Date.now();
  if (ms <= 0) return "Chiuso";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}g`;
  if (h > 0) return `${h}h`;
  const m = Math.floor(ms / (1000 * 60));
  return m > 0 ? `${m}min` : "Presto";
}

export default function HomeEventTile({
  id,
  title,
  category,
  closesAt,
  probability = 50,
}: HomeEventTileProps) {
  const gradient = getCategoryFallbackGradient(category);

  return (
    <Link
      href={`/events/${id}`}
      className="home-event-tile relative block rounded-2xl overflow-hidden border border-white/15 bg-transparent min-h-[100px] sm:min-h-[110px] active:scale-[0.99] hover:border-primary/30 hover:shadow-glow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
      style={{
        background: gradient,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="relative flex flex-col justify-end p-3 sm:p-4 h-full min-h-[100px] sm:min-h-[110px]">
        <p className="text-ds-body-sm font-semibold text-white line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          {title}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-ds-micro text-white/90">
          <span>{category}</span>
          <span>{formatTimeLeft(closesAt)}</span>
        </div>
      </div>
    </Link>
  );
}
