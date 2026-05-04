"use client";

import type { CSSProperties } from "react";
import type { MysteryTier, ShopMysteryPrize } from "@/lib/shop-display-config";

const tierFrameClass: Record<MysteryTier, string> = {
  bronze:
    "from-amber-700/55 via-orange-300/25 to-amber-900/50 shadow-[0_0_40px_-8px_rgba(180,83,9,0.35)]",
  silver:
    "from-slate-200/45 via-white/20 to-slate-400/40 shadow-[0_0_48px_-8px_rgba(226,232,240,0.22)]",
  gold:
    "from-amber-200/55 via-yellow-100/30 to-amber-600/45 shadow-[0_0_56px_-6px_rgba(234,179,8,0.38)]",
};

function kindAccent(kind: ShopMysteryPrize["kind"], tier: MysteryTier): string {
  if (kind === "experience") {
    return tier === "gold"
      ? "border-amber-400/25 bg-gradient-to-r from-amber-500/15 to-transparent"
      : "border-primary/20 bg-primary/5";
  }
  if (kind === "gift_card") {
    return "border-emerald-400/20 bg-emerald-500/5";
  }
  return "border-white/10 bg-white/[0.04]";
}

function PrizeRow({ prize, tier }: { prize: ShopMysteryPrize; tier: MysteryTier }) {
  return (
    <div
      className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 backdrop-blur-sm ${kindAccent(
        prize.kind,
        tier
      )}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-left text-ds-body-sm font-semibold text-fg leading-snug">{prize.label}</span>
        {prize.kind === "experience" && (
          <span
            className="shrink-0 rounded border border-dashed border-amber-300/35 bg-black/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-100/90"
            aria-hidden
          >
            Ticket
          </span>
        )}
      </div>
      {prize.sublabel ? (
        <span className="text-ds-micro text-accent-secondary/90">{prize.sublabel}</span>
      ) : null}
    </div>
  );
}

interface MysteryBoxMarqueeProps {
  tier: MysteryTier;
  prizes: ShopMysteryPrize[];
  durationSec: number;
}

export default function MysteryBoxMarquee({ tier, prizes, durationSec }: MysteryBoxMarqueeProps) {
  const doubled = [...prizes, ...prizes];

  return (
    <div
      className={`shop-premium-frame-shimmer relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br ${tierFrameClass[tier]}`}
    >
      <div className="relative rounded-[15px] bg-background-secondary/95 backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-background-secondary to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-background-secondary to-transparent"
          aria-hidden
        />

        <div className="relative h-[220px] overflow-hidden md:h-[260px]">
          <div
            className="shop-mystery-prize-track flex flex-col gap-2 px-3 py-3"
            style={
              {
                ["--shop-marquee-duration" as string]: `${durationSec}s`,
              } as CSSProperties
            }
          >
            {doubled.map((prize, i) => (
              <PrizeRow key={`${prize.label}-${i}`} prize={prize} tier={tier} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
