export type SilverMysteryRarity = "comune" | "raro" | "epico" | "leggendario";

export type SilverMysteryPrizeKind = "credits" | "gift_card";

type SilverMysteryPrizeTierBase = {
  id: SilverMysteryRarity;
  /** Label UI (plurale). */
  label: string;
  chancePct: number;
};

export type SilverCreditsTier = SilverMysteryPrizeTierBase & {
  kind: "credits";
  credits: number;
};

export type SilverGiftCardTier = SilverMysteryPrizeTierBase & {
  kind: "gift_card";
  /** Testo per accessibilità / copy (la card grafica è nell'immagine). */
  rewardLabel: string;
};

export type SilverMysteryPrizeTier = SilverCreditsTier | SilverGiftCardTier;

export const SILVER_MYSTERY_PRIZE_TIERS: Record<SilverMysteryRarity, SilverMysteryPrizeTier> = {
  comune: { id: "comune", label: "Comuni", chancePct: 60, kind: "credits", credits: 20_000 },
  raro: { id: "raro", label: "Rari", chancePct: 20, kind: "credits", credits: 50_000 },
  epico: { id: "epico", label: "Epici", chancePct: 10, kind: "credits", credits: 100_000 },
  leggendario: {
    id: "leggendario",
    label: "Leggendari",
    chancePct: 10,
    kind: "gift_card",
    rewardLabel: "Gift card",
  },
};

/**
 * Ciclo di 20 card: blocco comune → raro → epico → leggendario ×5
 * (leggendaria ogni 4 card). Le probabilità di drop restano nei tier.
 */
export const SILVER_MYSTERY_RAIL_RARITY_CYCLE: SilverMysteryRarity[] = [
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
