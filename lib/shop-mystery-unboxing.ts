import {
  BRONZE_MYSTERY_PRIZE_TIERS,
  type BronzeMysteryRarity,
} from "@/lib/shop-bronze-mystery-prizes";
import {
  SILVER_MYSTERY_PRIZE_TIERS,
  type SilverMysteryRarity,
} from "@/lib/shop-silver-mystery-prizes";
import {
  GOLD_MYSTERY_PRIZE_TIERS,
  type GoldMysteryRarity,
} from "@/lib/shop-gold-mystery-prizes";

export type MysteryUnboxingTier = "bronze" | "silver" | "gold";
export type MysteryUnboxingRarity =
  | BronzeMysteryRarity
  | SilverMysteryRarity
  | GoldMysteryRarity;

/** Catalogo "drop" per tier — chancePct sommano 100. */
export const MYSTERY_TIER_DROP_TABLE: Record<
  MysteryUnboxingTier,
  Array<{ rarity: MysteryUnboxingRarity; chancePct: number }>
> = {
  bronze: Object.values(BRONZE_MYSTERY_PRIZE_TIERS).map((t) => ({
    rarity: t.id,
    chancePct: t.chancePct,
  })),
  silver: Object.values(SILVER_MYSTERY_PRIZE_TIERS).map((t) => ({
    rarity: t.id,
    chancePct: t.chancePct,
  })),
  gold: Object.values(GOLD_MYSTERY_PRIZE_TIERS).map((t) => ({
    rarity: t.id,
    chancePct: t.chancePct,
  })),
};

/** Costo apertura box in Master coin (loyalty). Allineato alla curva di valore dei premi. */
export const MYSTERY_TIER_COST_MASTER_COINS: Record<MysteryUnboxingTier, number> = {
  bronze: 100,
  silver: 500,
  gold: 2_000,
};

/** Asset card vincitrice — full bleed, stessi path dei rail. */
export const MYSTERY_TIER_RARITY_IMAGE: Record<MysteryUnboxingTier, Record<string, string>> = {
  bronze: {
    comune: "/shop/bronze-mystery-comuni-1000.png",
    raro: "/shop/bronze-mystery-rari-5000.png",
    epico: "/shop/bronze-mystery-epici-10000.png",
    leggendario: "/shop/bronze-mystery-leggendari-20000.png",
  },
  silver: {
    comune: "/shop/silver-mystery-comuni-20000.png",
    raro: "/shop/silver-mystery-rari-50000.png",
    epico: "/shop/silver-mystery-epici-100000.png",
    leggendario: "/shop/silver-mystery-leggendari-giftcard.png",
  },
  gold: {
    comune: "/shop/gold-box-rail-comune.png",
    raro: "/shop/gold-box-rail-raro.png",
    epico: "/shop/gold-box-rail-epico.png",
    leggendario: "/shop/gold-box-rail-giftcard-100eur-leggendario.png",
  },
};

const creditsFmt = new Intl.NumberFormat("it-IT");

/** Label premium da mostrare al reveal — derivata dalla lib del tier. */
export function getMysteryPrizeRevealCopy(
  tier: MysteryUnboxingTier,
  rarity: MysteryUnboxingRarity
): { title: string; subtitle: string; rarityLabel: string } {
  if (tier === "bronze") {
    const t = BRONZE_MYSTERY_PRIZE_TIERS[rarity as BronzeMysteryRarity];
    return {
      title: `${creditsFmt.format(t.credits)} crediti`,
      subtitle: t.label,
      rarityLabel: t.label,
    };
  }
  if (tier === "silver") {
    const t = SILVER_MYSTERY_PRIZE_TIERS[rarity as SilverMysteryRarity];
    if (t.kind === "credits") {
      return {
        title: `${creditsFmt.format(t.credits)} crediti`,
        subtitle: t.label,
        rarityLabel: t.label,
      };
    }
    return { title: t.rewardLabel, subtitle: t.label, rarityLabel: t.label };
  }
  const t = GOLD_MYSTERY_PRIZE_TIERS[rarity as GoldMysteryRarity];
  return { title: t.rewardLabel, subtitle: t.label, rarityLabel: t.label };
}

/**
 * Estrazione weighted del rarity vincitore (client-side).
 * NOTE: la verità di estrazione/contabilità Master coin **deve** essere server-side
 * (TODO: collegare endpoint dedicato `/api/shop/mystery/open`). Qui il random
 * è un placeholder per costruire l'esperienza UX completa.
 */
export function pickMysteryWinner(tier: MysteryUnboxingTier): MysteryUnboxingRarity {
  const drops = MYSTERY_TIER_DROP_TABLE[tier];
  const total = drops.reduce((s, d) => s + d.chancePct, 0);
  let roll = Math.random() * total;
  for (const d of drops) {
    roll -= d.chancePct;
    if (roll <= 0) return d.rarity;
  }
  return drops[drops.length - 1].rarity;
}

/**
 * Costruisce la sequenza di card per l'arena unboxing.
 *
 * - lunghezza fissa (≥ winnerIndex + 6 card di "coda" per il decel)
 * - il rarity al `winnerIndex` è il vincitore reale
 * - le altre posizioni sono campionate dalle 4 rarità per dare varietà visiva
 *
 * Garantisce inoltre che la card a `winnerIndex - 2 .. winnerIndex - 1`
 * **non** sia dello stesso rarity del vincitore (per non "smorzare" il colpo
 * di scena se è leggendaria).
 */
export interface MysteryArenaSequence<R extends string> {
  cards: R[];
  winnerIndex: number;
}

export function buildMysteryArenaSequence<R extends MysteryUnboxingRarity>(
  cycle: readonly R[],
  winner: R,
  opts: { length?: number; winnerIndex?: number } = {}
): MysteryArenaSequence<R> {
  const length = Math.max(60, opts.length ?? 64);
  const winnerIndex = Math.min(length - 6, Math.max(40, opts.winnerIndex ?? length - 8));

  const cards: R[] = new Array(length);
  for (let i = 0; i < length; i++) {
    cards[i] = cycle[i % cycle.length];
  }
  cards[winnerIndex] = winner;

  /** Le 2 card subito prima del vincitore = rarity diversa dal vincitore (più suspense). */
  const others = cycle.filter((c) => c !== winner);
  if (others.length > 0) {
    cards[winnerIndex - 1] = others[(winnerIndex - 1) % others.length];
    cards[winnerIndex - 2] = others[(winnerIndex - 2 + others.length) % others.length];
  }

  return { cards, winnerIndex };
}
