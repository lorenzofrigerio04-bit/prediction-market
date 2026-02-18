/**
 * Event Verifier Types
 * BLOCCO 4: Verifier formale
 */

export type VerificationResult =
  | { ok: true }
  | { ok: false; reasons: string[] };
