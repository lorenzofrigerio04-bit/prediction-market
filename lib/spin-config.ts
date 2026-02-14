/**
 * Configurazione Spin of the Day: solo moltiplicatori, 7 segmenti.
 * Probabilità ponderate: bassi più frequenti, alti più rari.
 */

export type SpinRewardKind = "BOOST";

export interface SpinRewardBoost {
  kind: "BOOST";
  multiplier: number;
  durationMinutes: number;
}

export type SpinReward = SpinRewardBoost;

export interface WeightedReward {
  weight: number;
  reward: SpinReward;
  label: string; // per UI: "x1.2", "x2.5", etc.
}

/** Moltiplicatori sulla ruota (ordine = segmenti 0..6). */
export const WHEEL_MULTIPLIERS = [1.2, 1.5, 2, 2.5, 3, 4, 5] as const;

/** Reward possibili: solo BOOST, durata 24h. Pesi: bassi più probabili. */
export const SPIN_WEIGHTED_REWARDS: WeightedReward[] = [
  { weight: 28, reward: { kind: "BOOST", multiplier: 1.2, durationMinutes: 24 * 60 }, label: "x1.2" },
  { weight: 24, reward: { kind: "BOOST", multiplier: 1.5, durationMinutes: 24 * 60 }, label: "x1.5" },
  { weight: 20, reward: { kind: "BOOST", multiplier: 2, durationMinutes: 24 * 60 }, label: "x2" },
  { weight: 14, reward: { kind: "BOOST", multiplier: 2.5, durationMinutes: 24 * 60 }, label: "x2.5" },
  { weight: 8, reward: { kind: "BOOST", multiplier: 3, durationMinutes: 24 * 60 }, label: "x3" },
  { weight: 4, reward: { kind: "BOOST", multiplier: 4, durationMinutes: 24 * 60 }, label: "x4" },
  { weight: 2, reward: { kind: "BOOST", multiplier: 5, durationMinutes: 24 * 60 }, label: "x5" },
];

const TOTAL_WEIGHT = SPIN_WEIGHTED_REWARDS.reduce((s, r) => s + r.weight, 0);

export function pickSpinReward(): WeightedReward {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const w of SPIN_WEIGHTED_REWARDS) {
    r -= w.weight;
    if (r <= 0) return w;
  }
  return SPIN_WEIGHTED_REWARDS[SPIN_WEIGHTED_REWARDS.length - 1];
}

export function getRewardIndex(reward: WeightedReward): number {
  return SPIN_WEIGHTED_REWARDS.findIndex(
    (r) =>
      r.reward.kind === "BOOST" &&
      reward.reward.kind === "BOOST" &&
      r.reward.multiplier === reward.reward.multiplier
  );
}

export const SPIN_SEGMENT_COUNT = SPIN_WEIGHTED_REWARDS.length;
