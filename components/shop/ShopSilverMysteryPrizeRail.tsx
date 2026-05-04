"use client";

import Image from "next/image";
import { useLayoutEffect, useMemo, useRef } from "react";
import { newsRailEdgeMaskStyle } from "@/lib/news-rail-mask";
import { MysteryRailPremiumFx, mysteryRailPremiumMotion } from "@/components/shop/MysteryRailPremiumFx";
import {
  SILVER_MYSTERY_PRIZE_TIERS,
  SILVER_MYSTERY_RAIL_RARITY_CYCLE,
  type SilverMysteryRarity,
} from "@/lib/shop-silver-mystery-prizes";

const creditsFmt = new Intl.NumberFormat("it-IT");
const pctFmt = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

/** Stesse proporzioni del rail bronze. */
const RAIL_CARD_SHELL =
  "w-[176px] min-w-[176px] shrink-0 sm:w-[184px] sm:min-w-[184px] rounded-[0.9rem] p-px shadow-none";

const RARITY_PREMIUM_OUTLINE: Record<SilverMysteryRarity, string> = {
  comune: "bg-gradient-to-br from-white via-zinc-100 to-zinc-400",
  raro: "bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-700",
  epico: "bg-gradient-to-br from-violet-300 via-fuchsia-400 to-violet-900",
  leggendario: "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700",
};

/** Arte tier — sostituire con gli asset definitivi in `public/shop/`. */
const SILVER_COMUNI_PRIZE_SRC = "/shop/silver-mystery-comuni-20000.png";
const SILVER_RARI_PRIZE_SRC = "/shop/silver-mystery-rari-50000.png";
const SILVER_EPICI_PRIZE_SRC = "/shop/silver-mystery-epici-100000.png";
const SILVER_LEGGENDARI_PRIZE_SRC = "/shop/silver-mystery-leggendari-giftcard.png";

const TIER_IMAGE: Record<SilverMysteryRarity, string> = {
  comune: SILVER_COMUNI_PRIZE_SRC,
  raro: SILVER_RARI_PRIZE_SRC,
  epico: SILVER_EPICI_PRIZE_SRC,
  leggendario: SILVER_LEGGENDARI_PRIZE_SRC,
};

function silverTierAria(tier: (typeof SILVER_MYSTERY_PRIZE_TIERS)[SilverMysteryRarity]) {
  if (tier.kind === "credits") {
    return `${tier.label}: ${creditsFmt.format(tier.credits)} crediti, circa ${pctFmt.format(tier.chancePct)} per cento`;
  }
  return `${tier.label}: ${tier.rewardLabel}, circa ${pctFmt.format(tier.chancePct)} per cento`;
}

function silverTierImageAlt(tier: (typeof SILVER_MYSTERY_PRIZE_TIERS)[SilverMysteryRarity]) {
  if (tier.kind === "credits") {
    return `Premio ${tier.label}: pacchetto ${creditsFmt.format(tier.credits)} crediti virtuali`;
  }
  return `Premio ${tier.label}: ${tier.rewardLabel}`;
}

function SilverPrizeRailCard({ rarity }: { rarity: SilverMysteryRarity }) {
  const tier = SILVER_MYSTERY_PRIZE_TIERS[rarity];
  const src = TIER_IMAGE[rarity];
  const premium = mysteryRailPremiumMotion(rarity);

  return (
    <div
      className={[RAIL_CARD_SHELL, RARITY_PREMIUM_OUTLINE[rarity], premium ? "shop-mystery-rail-premium-shell" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <article
        className="relative isolate h-[12rem] w-full overflow-hidden rounded-[0.85rem] bg-black/20"
        aria-label={silverTierAria(tier)}
      >
        <Image
          src={src}
          alt={silverTierImageAlt(tier)}
          fill
          className="z-0 object-cover object-center"
          sizes="(max-width: 640px) 176px, 184px"
          priority={false}
          draggable={false}
        />
        {premium ? (
          <MysteryRailPremiumFx variant={rarity === "leggendario" ? "legend" : "epic"} />
        ) : null}
      </article>
    </div>
  );
}

export default function ShopSilverMysteryPrizeRail() {
  const cycle = SILVER_MYSTERY_RAIL_RARITY_CYCLE;
  const ordered = useMemo(
    () => cycle.map((rarity, i) => ({ rarity, key: `silver-slot-${i}` })),
    [cycle]
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const applyRafRef = useRef<number>(0);
  const applyQueuedRef = useRef(false);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || ordered.length < 2) return;

    const runApply = () => {
      const w = el.scrollWidth;
      if (w < 32) return;
      el.style.setProperty("--home-ticker-dx", `${-w / 2}px`);
    };

    const scheduleApply = () => {
      if (applyQueuedRef.current) return;
      applyQueuedRef.current = true;
      applyRafRef.current = requestAnimationFrame(() => {
        applyQueuedRef.current = false;
        runApply();
      });
    };

    runApply();
    scheduleApply();
    const ro = new ResizeObserver(scheduleApply);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(applyRafRef.current);
      ro.disconnect();
    };
  }, [ordered]);

  if (ordered.length < 2) return null;

  return (
    <div
      className={[
        "shop-mystery-marquee-rail shop-silver-mystery-rail group/shop-silver-mystery-rail relative left-1/2 my-4 w-screen max-w-[100vw] -translate-x-1/2 sm:my-5",
        "bg-[linear-gradient(180deg,rgba(203,213,225,0.06)_0%,transparent_36%,transparent_64%,rgba(148,163,184,0.05)_100%),radial-gradient(90%_120%_at_50%_0%,rgba(255,255,255,0.05),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.45)_0%,transparent_45%),#03050c]",
      ].join(" ")}
      role="region"
      aria-label="Premi possibili della silver box"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(203,213,225,0.06)_50%,transparent_100%)] bg-[length:200%_100%] opacity-50 motion-safe:animate-home-news-ticker-wash motion-reduce:opacity-28"
      />

      <div className="relative py-3.5 sm:py-4">
        <div
          className="shop-mystery-marquee-scrollport relative isolate overflow-hidden"
          style={newsRailEdgeMaskStyle}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-14 bg-gradient-to-b from-[#03050c] via-[#03050c]/40 to-transparent sm:h-16"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-14 bg-gradient-to-t from-[#03050c] via-[#03050c]/40 to-transparent sm:h-16"
          />

          <div className="relative px-page-x">
            <div className="shop-mystery-marquee-inner relative z-[3] w-fit max-w-full bg-admin-bg">
              <div
                ref={trackRef}
                className={[
                  "shop-mystery-marquee-track home-news-ticker-track flex w-max flex-row items-stretch gap-2.5",
                  "home-news-ticker-track--ltr",
                  "is-armed",
                  "motion-safe:will-change-[transform]",
                  "motion-safe:backface-hidden motion-safe:[-webkit-backface-visibility:hidden]",
                ].join(" ")}
              >
                {ordered.map(({ rarity, key }) => (
                  <SilverPrizeRailCard key={`a-${key}`} rarity={rarity} />
                ))}
                {ordered.map(({ rarity, key }) => (
                  <SilverPrizeRailCard key={`b-${key}`} rarity={rarity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
