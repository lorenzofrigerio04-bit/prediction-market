/**
 * Spin of the Day (bonus giornaliero unico).
 * Una sola ruota: crediti base 50–500. Il risultato finale = base × moltiplicatore streak (1.0–2.0).
 * Lo spin non dà mai 0 crediti (minimo 1 dopo moltiplicatore).
 */

// —— Ruota crediti: 50–500 (nessuno 0) ——
export interface CreditsSegment {
  credits: number;
  weight: number;
  label: string;
}

/** Segmenti ruota: 50, 100, 150, 200, 300, 400, 500. Pesi bilanciati. */
export const CREDITS_WHEEL_SEGMENTS: CreditsSegment[] = [
  { credits: 50, weight: 24, label: "50" },
  { credits: 100, weight: 22, label: "100" },
  { credits: 150, weight: 18, label: "150" },
  { credits: 200, weight: 15, label: "200" },
  { credits: 300, weight: 10, label: "300" },
  { credits: 400, weight: 6, label: "400" },
  { credits: 500, weight: 5, label: "500" },
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

// —— Ruota moltiplicatrice: rimossa (sempre 1x); stub per compatibilità con MultiplierWheel ——
export const MULTIPLIER_WHEEL_SEGMENTS: { multiplier: number; label: string }[] = [{ multiplier: 1, label: "1x" }];
export const MULTIPLIER_SEGMENT_COUNT = MULTIPLIER_WHEEL_SEGMENTS.length;

// —— Payload storico (compatibilità) ——
export type SpinPayloadStatus = "CASHED";

export interface DailySpinCreditsPayload {
  amount: number;
  status: SpinPayloadStatus;
}
