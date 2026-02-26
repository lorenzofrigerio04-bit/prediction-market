/**
 * Price Display Helper
 * 
 * Helper functions for displaying LMSR prices in the UI.
 */

import { getPrice } from "./lmsr";
import { DEFAULT_B } from "./initialization";

/**
 * Get event probability from LMSR parameters
 * 
 * @param event - Event object with LMSR fields (q_yes, q_no, b); all optional (undefined treated as missing)
 * @returns Probability as percentage (0-100)
 */
export function getEventProbability(event: {
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
}): number {
  const qYes = event.q_yes ?? 0;
  const qNo = event.q_no ?? 0;
  const b = event.b ?? DEFAULT_B;

  return getPrice(qYes, qNo, b, "YES") * 100;
}
