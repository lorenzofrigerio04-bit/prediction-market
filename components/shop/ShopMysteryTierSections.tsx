"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/home/football/premium/SectionHeader";
import ShopBronzeMysteryPrizeRail from "@/components/shop/ShopBronzeMysteryPrizeRail";
import ShopGoldMysteryPrizeRail from "@/components/shop/ShopGoldMysteryPrizeRail";
import ShopSilverMysteryPrizeRail from "@/components/shop/ShopSilverMysteryPrizeRail";
import MysteryUnboxingOverlay from "@/components/shop/MysteryUnboxingOverlay";
import type { MysteryTier } from "@/lib/shop-display-config";

const tiers: { title: string; accent: MysteryTier }[] = [
  { title: "Bronze box", accent: "bronze" },
  { title: "Silver box", accent: "silver" },
  { title: "Gold box", accent: "gold" },
];

const TIER_ACCENT: Record<MysteryTier, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#fbbf24",
};

export default function ShopMysteryTierSections() {
  const [openTier, setOpenTier] = useState<MysteryTier | null>(null);

  return (
    <>
      <div className="mt-7 md:mt-9 space-y-10 md:space-y-12">
        {tiers.map(({ title, accent }) => {
          const color = TIER_ACCENT[accent];
          return (
            <section key={accent} aria-label={title}>
              <SectionHeader title={title} accent={accent} articleHeadlineTitle />

              {accent === "bronze" ? <ShopBronzeMysteryPrizeRail /> : null}
              {accent === "silver" ? <ShopSilverMysteryPrizeRail /> : null}
              {accent === "gold" ? <ShopGoldMysteryPrizeRail /> : null}

              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setOpenTier(accent)}
                  className="group relative overflow-hidden rounded-full px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-transform duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${color}18, ${color}40)`,
                    border: `1px solid ${color}77`,
                    boxShadow: `0 0 22px ${color}33`,
                  }}
                >
                  <span className="relative z-[1]">Apri la {title}</span>
                  <span
                    className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `linear-gradient(135deg, ${color}28, transparent)` }}
                  />
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {openTier !== null && (
        <MysteryUnboxingOverlay
          tier={openTier}
          isOpen
          onClose={() => setOpenTier(null)}
        />
      )}
    </>
  );
}
