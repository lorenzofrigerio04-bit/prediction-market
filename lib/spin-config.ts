/**
 * Configurazione Spin of the Day: reward con probabilità ponderate.
 * Economia controllata: valori e pesi definiti qui.
 */

export type SpinRewardKind = "CREDITS" | "BOOST";

export interface SpinRewardCredits {
  kind: "CREDITS";
  amount: number;
}

export interface SpinRewardBoost {
  kind: "BOOST";
  multiplier: number;
  durationMinutes: number;
}

export type SpinReward = SpinRewardCredits | SpinRewardBoost;

export interface WeightedReward {
  weight: number; // peso relativo (più alto = più probabile)
  reward: SpinReward;
  label: string; // per UI, es. "50 crediti", "Boost x1.25 (1h)"
}

/** Reward possibili con probabilità ponderate. Somma pesi = 100 per lettura facile. */
export const SPIN_WEIGHTED_REWARDS: WeightedReward[] = [
  { weight: 35, reward: { kind: "CREDITS", amount: 10 }, label: "10 crediti" },
  { weight: 28, reward: { kind: "CREDITS", amount: 25 }, label: "25 crediti" },
  { weight: 18, reward: { kind: "CREDITS", amount: 50 }, label: "50 crediti" },
  { weight: 10, reward: { kind: "CREDITS", amount: 100 }, label: "100 crediti" },
  { weight: 6, reward: { kind: "BOOST", multiplier: 1.25, durationMinutes: 60 }, label: "Boost x1.25 (1h)" },
  { weight: 3, reward: { kind: "BOOST", multiplier: 1.5, durationMinutes: 30 }, label: "Boost x1.5 (30 min)" },
];

const TOTAL_WEIGHT = SPIN_WEIGHTED_REWARDS.reduce((s, r) => s + r.weight, 0);

/**
 * Estrae un reward casuale in base ai pesi.
 */
export function pickSpinReward(): WeightedReward {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const w of SPIN_WEIGHTED_REWARDS) {
    r -= w.weight;
    if (r <= 0) return w;
  }
  return SPIN_WEIGHTED_REWARDS[SPIN_WEIGHTED_REWARDS.length - 1];
}

/**
 * Indice del reward nell'array (per far fermare la ruota sul segmento corretto).
 */
export function getRewardIndex(reward: WeightedReward): number {
  return SPIN_WEIGHTED_REWARDS.findIndex((r) => {
    if (r.reward.kind !== reward.reward.kind) return false;
    if (r.reward.kind === "CREDITS" && reward.reward.kind === "CREDITS")
      return r.reward.amount === reward.reward.amount;
    if (r.reward.kind === "BOOST" && reward.reward.kind === "BOOST")
      return r.reward.multiplier === reward.reward.multiplier && r.reward.durationMinutes === reward.reward.durationMinutes;
    return false;
  });
}

export const SPIN_SEGMENT_COUNT = SPIN_WEIGHTED_REWARDS.length;
