/** Percentuali Sì/No per la barra: 50/50 se nessuna previsione */
export function getYesNoPct(
  probability: number | undefined | null,
  predictionsCount: number
): { yes: number; no: number } {
  if (predictionsCount === 0) return { yes: 50, no: 50 };
  const p =
    typeof probability === "number" && Number.isFinite(probability) ? probability : 50;
  return { yes: Math.round(p), no: Math.round(100 - p) };
}
