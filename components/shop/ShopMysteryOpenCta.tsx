"use client";

import { MYSTERY_TIER_COST_MASTER_COINS, type MysteryUnboxingTier } from "@/lib/shop-mystery-unboxing";
import { useMysteryUnboxing } from "@/components/shop/ShopMysteryUnboxingProvider";

const fmt = new Intl.NumberFormat("it-IT");

const TIER_LABEL: Record<MysteryUnboxingTier, string> = {
  bronze: "Apri Bronze box",
  silver: "Apri Silver box",
  gold: "Apri Gold box",
};

/** Bottone standard (centrato sotto il rail). */
export default function ShopMysteryOpenCta({ tier }: { tier: MysteryUnboxingTier }) {
  const { open, isOpen } = useMysteryUnboxing();
  const cost = MYSTERY_TIER_COST_MASTER_COINS[tier];

  return (
    <div className="mt-3 flex justify-center sm:mt-4">
      <button
        type="button"
        onClick={() => open(tier)}
        disabled={isOpen}
        className={[
          "shop-mystery-open-cta",
          `shop-mystery-open-cta--${tier}`,
          "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.06em] text-white",
          "transition-transform duration-200 ease-out",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "active:scale-[0.985] motion-safe:hover:scale-[1.015]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60",
        ].join(" ")}
        aria-label={`${TIER_LABEL[tier]} per ${fmt.format(cost)} master coin`}
      >
        <span className="shop-mystery-open-cta__bg" aria-hidden />
        <span className="shop-mystery-open-cta__sheen" aria-hidden />
        <span className="shop-mystery-open-cta__ring" aria-hidden />

        <span className="relative z-[2] flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="opacity-90"
          >
            <path
              d="M3 8.5L12 4l9 4.5M3 8.5L12 13M3 8.5v7L12 20m9-11.5L12 13m9-4.5v7L12 20m0-7v7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {TIER_LABEL[tier]}
        </span>

        <span
          aria-hidden
          className="relative z-[2] hidden h-4 w-px bg-white/20 sm:block"
        />

        <span className="relative z-[2] inline-flex items-center gap-1.5 text-white/85">
          <span className="font-semibold">{fmt.format(cost)}</span>
          <span className="text-[0.7rem] uppercase tracking-[0.18em] text-white/55">
            Master coin
          </span>
        </span>
      </button>
    </div>
  );
}

/**
 * Bottone compatto per l'header di sezione — stesso look del bottone
 * "Crea account" (signup-cta-premium-outline) ma con i colori del tier.
 */
export function ShopTierBuyBtn({ tier }: { tier: MysteryUnboxingTier }) {
  const { open, isOpen } = useMysteryUnboxing();
  const cost = MYSTERY_TIER_COST_MASTER_COINS[tier];

  return (
    <button
      type="button"
      onClick={() => open(tier)}
      disabled={isOpen}
      className={[
        "shop-tier-buy-btn",
        `shop-tier-buy-btn--${tier}`,
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60",
      ].join(" ")}
      aria-label={`${TIER_LABEL[tier]} per ${fmt.format(cost)} master coin`}
    >
      {/* Box icon */}
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="relative z-[2] shrink-0 opacity-90"
      >
        <path
          d="M3 8.5L12 4l9 4.5M3 8.5L12 13M3 8.5v7L12 20m9-11.5L12 13m9-4.5v7L12 20m0-7v7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="relative z-[2]">Apri</span>

      {/* Divisore */}
      <span className="relative z-[2] h-3.5 w-px bg-white/20" aria-hidden />

      {/* Prezzo */}
      <span className="relative z-[2] inline-flex items-baseline gap-1">
        <span className="font-bold tabular-nums">{fmt.format(cost)}</span>
        <span className="text-[0.62rem] uppercase tracking-[0.16em] opacity-60">mc</span>
      </span>
    </button>
  );
}
