export type GoldMysteryRarity = "comune" | "raro" | "epico" | "leggendario";

export type GoldMysteryPrizeKind = "gift_card" | "experience";

export interface GoldMysteryPrizeTier {
  id: GoldMysteryRarity;
  label: string;
  /** Probabilità dichiarata (drop). */
  chancePct: number;
  kind: GoldMysteryPrizeKind;
  /** Copy accessibilità; il dettaglio visivo è nelle immagini card. */
  rewardLabel: string;
}

export const GOLD_MYSTERY_PRIZE_TIERS: Record<GoldMysteryRarity, GoldMysteryPrizeTier> = {
  comune: {
    id: "comune",
    label: "Comuni",
    chancePct: 60,
    kind: "gift_card",
    rewardLabel: "Gift card · tier comune",
  },
  raro: {
    id: "raro",
    label: "Rari",
    chancePct: 20,
    kind: "gift_card",
    rewardLabel: "Gift card · tier raro",
  },
  epico: {
    id: "epico",
    label: "Epici",
    chancePct: 15,
    kind: "gift_card",
    rewardLabel: "Gift card · tier epico",
  },
  leggendario: {
    id: "leggendario",
    label: "Leggendari",
    chancePct: 5,
    kind: "gift_card",
    rewardLabel: "Gift card 100 €",
  },
};

/**
 * Ciclo di 20 card: comune → raro → epico → leggendario ×5 (leggendaria ogni 4 card).
 * Le probabilità reali di drop restano in `GOLD_MYSTERY_PRIZE_TIERS` (60 / 20 / 15 / 5).
 */
export const GOLD_MYSTERY_RAIL_RARITY_CYCLE: GoldMysteryRarity[] = [
  "comune",
  "raro",
  "epico",
  "leggendario",
  "comune",
  "raro",
  "epico",
  "leggendario",
  "comune",
  "raro",
  "epico",
  "leggendario",
  "comune",
  "raro",
  "epico",
  "leggendario",
  "comune",
  "raro",
  "epico",
  "leggendario",
];
