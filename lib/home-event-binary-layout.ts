import type { FootballEvent } from "@/types/homepage";

function bestOfTris(
  probs: Array<{ key: string; label: string; probabilityPct: number }>
) {
  const home = probs.find((p) => /^(1|home)$/i.test(p.key));
  const draw = probs.find((p) => /^(x|draw|pareggio)$/i.test(p.key));
  const away = probs.find((p) => /^(2|away)$/i.test(p.key));
  if (home && draw && away) {
    return { home, draw, away };
  }
  return null;
}

/**
 * True when the homepage should use the compact binary (Sì/No) layout
 * with a single probability badge — same branching as `OddsBlock` variant 3.
 */
export function isBinaryYesNoRailLayout(event: FootballEvent): boolean {
  const op = event.outcomeProbabilities;
  if (op && op.length >= 3) {
    const tris = bestOfTris(op);
    if (tris) return false;
  }
  if (op && op.length >= 2) return false;
  return true;
}

/** Quota più alta tra Sì e No (≥50%) e chi comanda il mercato binario — per badge / UI. */
export function getBinaryLeadingDisplay(yesPct: number): {
  leadingPct: number;
  leadingSide: "yes" | "no" | "neutral";
} {
  const yesR = Math.max(0, Math.min(100, Math.round(Number(yesPct))));
  const leadingPct = Math.max(yesR, 100 - yesR);
  const leadingSide: "yes" | "no" | "neutral" =
    yesR > 50 ? "yes" : yesR < 50 ? "no" : "neutral";
  return { leadingPct, leadingSide };
}
