export function oddsFromProbability(pct: number): number {
  const p = Math.max(1, Math.min(99, pct)) / 100;
  return parseFloat((1 / p).toFixed(2));
}

export function potentialWinnings(amount: number, odds: number): number {
  return Math.floor(amount * odds);
}

export function formatOdds(odds: number): string {
  return `${odds.toFixed(2)}x`;
}

export function formatValue(value: number): string {
  return `€${value.toFixed(2)}`;
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export function formatBets(bets: number): string {
  if (bets >= 1000) return `${(bets / 1000).toFixed(1)}K`;
  return `${bets}`;
}
