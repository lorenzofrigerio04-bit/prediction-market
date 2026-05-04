/**
 * Dati di sola presentazione per lo shop.
 * Prezzi EUR/Crediti e premi mystery box sono placeholder fino a pricing finale e backend punti fedeltà.
 * Per integrare punti / acquisti reali: usare gli `id` stabili qui sotto da mappare alle API.
 */

export type MysteryTier = "bronze" | "silver" | "gold";

export type MysteryPrizeKind = "credits" | "gift_card" | "experience";

export interface ShopMysteryPrize {
  label: string;
  sublabel?: string;
  kind: MysteryPrizeKind;
}

export interface CreditBundleEurDisplay {
  id: "credit_bundle_starter" | "credit_bundle_pro" | "credit_bundle_elite";
  name: string;
  credits: number;
  priceEur: number;
  emphasis: "default" | "popular";
}

export interface MysteryBoxDisplay {
  id: "mystery_bronze" | "mystery_silver" | "mystery_gold";
  tier: MysteryTier;
  name: string;
  description: string;
  /** Prezzo in punti fedeltà (placeholder) */
  loyaltyPointsPrice: number;
  /** Durata animazione anteprima premi (secondi) */
  marqueeDurationSec: number;
  prizes: ShopMysteryPrize[];
}

/** Pacchetti crediti acquistabili con denaro reale (flusso pagamento da collegare) */
export const CREDIT_BUNDLES_EUR: CreditBundleEurDisplay[] = [
  {
    id: "credit_bundle_starter",
    name: "Starter",
    credits: 10_000,
    priceEur: 0.99,
    emphasis: "default",
  },
  {
    id: "credit_bundle_pro",
    name: "Pro",
    credits: 50_000,
    priceEur: 3.99,
    emphasis: "popular",
  },
  {
    id: "credit_bundle_elite",
    name: "Elite",
    credits: 150_000,
    priceEur: 9.99,
    emphasis: "default",
  },
];

export const MYSTERY_BOXES: MysteryBoxDisplay[] = [
  {
    id: "mystery_bronze",
    tier: "bronze",
    name: "Bronze box",
    description:
      "Solo crediti virtuali: montanti vari dentro una mystery box pensata per chi accumula punti.",
    loyaltyPointsPrice: 2_400,
    marqueeDurationSec: 36,
    prizes: [
      { label: "500 crediti", kind: "credits" },
      { label: "1.000 crediti", kind: "credits" },
      { label: "2.500 crediti", kind: "credits", sublabel: "Frequente" },
      { label: "5.000 crediti", kind: "credits" },
      { label: "8.000 crediti", kind: "credits", sublabel: "Raro" },
      { label: "10.000 crediti", kind: "credits" },
      { label: "Jackpot · 10.000 crediti", kind: "credits", sublabel: "Ultra raro" },
      { label: "1.500 crediti", kind: "credits" },
      { label: "3.200 crediti", kind: "credits" },
      { label: "6.500 crediti", kind: "credits", sublabel: "Speciale" },
    ],
  },
  {
    id: "mystery_silver",
    tier: "silver",
    name: "Silver box",
    description:
      "Crediti più alti (20k–100k) con possibilità di gift card sul tier leggendario: probabilità sul rail sotto.",
    loyaltyPointsPrice: 8_750,
    marqueeDurationSec: 30,
    prizes: [
      { label: "20.000 crediti", kind: "credits", sublabel: "Comuni · 60%" },
      { label: "50.000 crediti", kind: "credits", sublabel: "Rari · 20%" },
      { label: "100.000 crediti", kind: "credits", sublabel: "Epici · 10%" },
      { label: "Gift card", kind: "gift_card", sublabel: "Leggendari · 10%" },
      { label: "20.000 crediti", kind: "credits" },
      { label: "50.000 crediti", kind: "credits" },
      { label: "100.000 crediti", kind: "credits" },
      { label: "Gift card", kind: "gift_card" },
    ],
  },
  {
    id: "mystery_gold",
    tier: "gold",
    name: "Gold box",
    description:
      "Gift card e premi premium. Drop: comuni 60%, rari 20%, epici 15%, leggendari 5% — sul rail le tier alte compaiono spesso in anteprima.",
    loyaltyPointsPrice: 24_500,
    marqueeDurationSec: 38,
    prizes: [
      { label: "Gift card · comuni", kind: "gift_card", sublabel: "60%" },
      { label: "Gift card · rari", kind: "gift_card", sublabel: "20%" },
      { label: "Gift card · epici", kind: "gift_card", sublabel: "15%" },
      { label: "Gift card · leggendari", kind: "gift_card", sublabel: "5%" },
      { label: "Partner retail", kind: "gift_card" },
      { label: "Event & hospitality", kind: "experience", sublabel: "Surprise" },
    ],
  },
];
