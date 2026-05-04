"use client";

import { SectionHeader } from "@/components/home/football/premium/SectionHeader";
import ShopBronzeMysteryPrizeRail from "@/components/shop/ShopBronzeMysteryPrizeRail";
import ShopGoldMysteryPrizeRail from "@/components/shop/ShopGoldMysteryPrizeRail";
import ShopSilverMysteryPrizeRail from "@/components/shop/ShopSilverMysteryPrizeRail";

const tiers = [
  { title: "Bronze box", accent: "bronze" as const },
  { title: "Silver box", accent: "silver" as const },
  { title: "Gold box", accent: "gold" as const },
];

export default function ShopMysteryTierSections() {
  return (
    <div className="mt-7 md:mt-9 space-y-10 md:space-y-12">
      {tiers.map(({ title, accent }) => (
        <section key={accent} aria-label={title}>
          <SectionHeader
            title={title}
            accent={accent}
            articleHeadlineTitle
          />
          {accent === "bronze" ? <ShopBronzeMysteryPrizeRail /> : null}
          {accent === "silver" ? <ShopSilverMysteryPrizeRail /> : null}
          {accent === "gold" ? <ShopGoldMysteryPrizeRail /> : null}
        </section>
      ))}
    </div>
  );
}
