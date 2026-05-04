export type BronzeMysteryRarity = "comune" | "raro" | "epico" | "leggendario";

export interface BronzeMysteryPrizeTier {
  id: BronzeMysteryRarity;
  /** Label UI (plurale come richiesto). */
  label: string;
  chancePct: number;
  credits: number;
}

export const BRONZE_MYSTERY_PRIZE_TIERS: Record<BronzeMysteryRarity, BronzeMysteryPrizeTier> = {
  comune: { id: "comune", label: "Comuni", chancePct: 60, credits: 1_000 },
  raro: { id: "raro", label: "Rari", chancePct: 20, credits: 5_000 },
  epico: { id: "epico", label: "Epici", chancePct: 15, credits: 10_000 },
  leggendario: {
    id: "leggendario",
    label: "Leggendari",
    chancePct: 5,
    credits: 20_000,
  },
};

/**
 * Ciclo di 20 card: blocco comune → raro → epico → leggendario ripetuto 5 volte
 * (leggendaria ogni 4 card sul nastro). Le probabilità di drop restano nei tier.
 */
export const BRONZE_MYSTERY_RAIL_RARITY_CYCLE: BronzeMysteryRarity[] = [
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
