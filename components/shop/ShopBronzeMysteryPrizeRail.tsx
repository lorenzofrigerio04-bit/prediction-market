"use client";

import Image from "next/image";
import { useLayoutEffect, useMemo, useRef } from "react";
import { newsRailEdgeMaskStyle } from "@/lib/news-rail-mask";
import { MysteryRailPremiumFx, mysteryRailPremiumMotion } from "@/components/shop/MysteryRailPremiumFx";
import {
  BRONZE_MYSTERY_PRIZE_TIERS,
  BRONZE_MYSTERY_RAIL_RARITY_CYCLE,
  type BronzeMysteryRarity,
} from "@/lib/shop-bronze-mystery-prizes";

const creditsFmt = new Intl.NumberFormat("it-IT");
const pctFmt = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

/** Misure card: solo cornice 1px (gradiente sul guscio, niente glow dietro). */
const RAIL_CARD_SHELL =
  "w-[176px] min-w-[176px] shrink-0 sm:w-[184px] sm:min-w-[184px] rounded-[0.9rem] p-px shadow-none";

/**
 * Contorno tier — comune bianco, raro blu, epico viola, leggendario oro.
 * Solo bordo metallico (via p-px + bg gradient), zero box-shadow.
 */
const RARITY_PREMIUM_OUTLINE: Record<BronzeMysteryRarity, string> = {
  comune: "bg-gradient-to-br from-white via-zinc-100 to-zinc-400",
  raro: "bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-700",
  epico: "bg-gradient-to-br from-violet-300 via-fuchsia-400 to-violet-900",
  leggendario: "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700",
};

/** Arte tier comuni: immagine = intera card, full-bleed. */
const BRONZE_COMUNI_PRIZE_SRC = "/shop/bronze-mystery-comuni-1000.png";

/** Arte tier rari (5.000 crediti): immagine = intera card, full-bleed. */
const BRONZE_RARI_PRIZE_SRC = "/shop/bronze-mystery-rari-5000.png";

/** Arte tier epici (10.000 crediti): immagine = intera card, full-bleed. */
const BRONZE_EPICI_PRIZE_SRC = "/shop/bronze-mystery-epici-10000.png";

/** Arte tier leggendari (20.000 crediti): immagine = intera card, full-bleed. */
const BRONZE_LEGGENDARI_PRIZE_SRC = "/shop/bronze-mystery-leggendari-20000.png";

const TIER_IMAGE: Record<BronzeMysteryRarity, string> = {
  comune: BRONZE_COMUNI_PRIZE_SRC,
  raro: BRONZE_RARI_PRIZE_SRC,
  epico: BRONZE_EPICI_PRIZE_SRC,
  leggendario: BRONZE_LEGGENDARI_PRIZE_SRC,
};

function BronzePrizeRailCard({ rarity }: { rarity: BronzeMysteryRarity }) {
  const tier = BRONZE_MYSTERY_PRIZE_TIERS[rarity];
  const src = TIER_IMAGE[rarity];
  const premium = mysteryRailPremiumMotion(rarity);

  return (
    <div
      className={[RAIL_CARD_SHELL, RARITY_PREMIUM_OUTLINE[rarity], premium ? "shop-mystery-rail-premium-shell" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <article
        className={[
          "relative isolate h-[12rem] w-full overflow-hidden rounded-[0.85rem] bg-black/20",
        ].join(" ")}
        aria-label={`${tier.label}: ${creditsFmt.format(tier.credits)} crediti, circa ${pctFmt.format(tier.chancePct)} per cento`}
      >
        <Image
          src={src}
          alt={`Premio ${tier.label}: pacchetto ${creditsFmt.format(tier.credits)} crediti virtuali`}
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

export default function ShopBronzeMysteryPrizeRail() {
  const cycle = BRONZE_MYSTERY_RAIL_RARITY_CYCLE;
  const ordered = useMemo(
    () => cycle.map((rarity, i) => ({ rarity, key: `bronze-slot-${i}` })),
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

    /** Subito dopo il layout (stesso tick, prima del paint): ticker già corretto all’ingresso in shop. */
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
        "shop-mystery-marquee-rail shop-bronze-mystery-rail group/shop-bronze-mystery-rail relative left-1/2 my-4 w-screen max-w-[100vw] -translate-x-1/2 sm:my-5",
        "bg-[linear-gradient(180deg,rgba(80,245,252,0.045)_0%,transparent_36%,transparent_64%,rgba(80,245,252,0.035)_100%),radial-gradient(90%_120%_at_50%_0%,rgba(255,255,255,0.048),transparent_55%),linear-gradient(180deg,rgba(24,16,8,0.35)_0%,transparent_45%),#03050c]",
      ].join(" ")}
      role="region"
      aria-label="Premi possibili della bronze box"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(80,245,252,0.055)_50%,transparent_100%)] bg-[length:200%_100%] opacity-50 motion-safe:animate-home-news-ticker-wash motion-reduce:opacity-28"
      />

      <div className="relative py-3.5 sm:py-4">
        <div
          className="shop-mystery-marquee-scrollport shop-mystery-stage shop-mystery-stage--bronze relative isolate overflow-hidden"
          style={newsRailEdgeMaskStyle}
        >
          {/* Sfumatura verticale premium (respira come ticker news / homepage). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-14 bg-gradient-to-b from-[#03050c] via-[#03050c]/40 to-transparent sm:h-16"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-14 bg-gradient-to-t from-[#03050c] via-[#03050c]/40 to-transparent sm:h-16"
          />

          <div className="relative px-page-x">
            {/* Stesso sfondo unificato della piattaforma (admin-bg: vedi .app-background-unified; le pagine sono trasparenti). */}
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
                  <BronzePrizeRailCard key={`a-${key}`} rarity={rarity} />
                ))}
                {ordered.map(({ rarity, key }) => (
                  <BronzePrizeRailCard key={`b-${key}`} rarity={rarity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
