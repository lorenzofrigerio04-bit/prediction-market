/**
 * Spin of the Day: due ruote.
 * 1) Ruota crediti: 0–500, probabilità bilanciate (vantaggioso e divertente).
 * 2) Ruota moltiplicatrice: x0–x100, rischio/opportunità.
 */

// —— Prima ruota: crediti 0–500 ——
export interface CreditsSegment {
  credits: number;
  weight: number;
  label: string;
}

/** Segmenti prima ruota: 0, 50, 100, 150, 200, 300, 400, 500. Pesi bilanciati. */
export const CREDITS_WHEEL_SEGMENTS: CreditsSegment[] = [
  { credits: 0, weight: 5, label: "0" },
  { credits: 50, weight: 22, label: "50" },
  { credits: 100, weight: 20, label: "100" },
  { credits: 150, weight: 18, label: "150" },
  { credits: 200, weight: 15, label: "200" },
  { credits: 300, weight: 10, label: "300" },
  { credits: 400, weight: 6, label: "400" },
  { credits: 500, weight: 4, label: "500" },
];

const CREDITS_TOTAL_WEIGHT = CREDITS_WHEEL_SEGMENTS.reduce((s, r) => s + r.weight, 0);

export function pickFirstSpinCredits(): CreditsSegment {
  let r = Math.random() * CREDITS_TOTAL_WEIGHT;
  for (const seg of CREDITS_WHEEL_SEGMENTS) {
    r -= seg.weight;
    if (r <= 0) return seg;
  }
  return CREDITS_WHEEL_SEGMENTS[CREDITS_WHEEL_SEGMENTS.length - 1];
}

export function getCreditsSegmentIndex(credits: number): number {
  const i = CREDITS_WHEEL_SEGMENTS.findIndex((s) => s.credits === credits);
  return i >= 0 ? i : 0;
}

export const CREDITS_SEGMENT_COUNT = CREDITS_WHEEL_SEGMENTS.length;

// —— Seconda ruota: moltiplicatori x0–x100 ——
export interface MultiplierSegment {
  multiplier: number;
  weight: number;
  label: string;
}

export const MULTIPLIER_WHEEL_SEGMENTS: MultiplierSegment[] = [
  { multiplier: 0, weight: 8, label: "×0" },
  { multiplier: 0.5, weight: 10, label: "×0.5" },
  { multiplier: 1, weight: 24, label: "×1" },
  { multiplier: 2, weight: 22, label: "×2" },
  { multiplier: 5, weight: 14, label: "×5" },
  { multiplier: 10, weight: 10, label: "×10" },
  { multiplier: 25, weight: 6, label: "×25" },
  { multiplier: 50, weight: 4, label: "×50" },
  { multiplier: 100, weight: 2, label: "×100" },
];

const MULTIPLIER_TOTAL_WEIGHT = MULTIPLIER_WHEEL_SEGMENTS.reduce((s, r) => s + r.weight, 0);

export function pickMultiplier(): MultiplierSegment {
  let r = Math.random() * MULTIPLIER_TOTAL_WEIGHT;
  for (const seg of MULTIPLIER_WHEEL_SEGMENTS) {
    r -= seg.weight;
    if (r <= 0) return seg;
  }
  return MULTIPLIER_WHEEL_SEGMENTS[MULTIPLIER_WHEEL_SEGMENTS.length - 1];
}

export function getMultiplierSegmentIndex(multiplier: number): number {
  const i = MULTIPLIER_WHEEL_SEGMENTS.findIndex((s) => s.multiplier === multiplier);
  return i >= 0 ? i : 0;
}

export const MULTIPLIER_SEGMENT_COUNT = MULTIPLIER_WHEEL_SEGMENTS.length;

// —— Payload DailySpin (rewardPayload quando rewardType = CREDITS) ——
export type SpinPayloadStatus = "PENDING_CHOICE" | "CASHED" | "MULTIPLIED";

export interface DailySpinCreditsPayload {
  amount: number;
  status: SpinPayloadStatus;
  multiplierUsed?: number;
}
