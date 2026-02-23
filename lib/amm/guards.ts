/**
 * Runtime guards: tradingMode must match the path.
 * AMM path must never write Event.q_yes/q_no or Prediction.
 * Legacy path must never call executeBuyShares or touch AmmState/Position.
 */

export function assertAmmEvent(event: { tradingMode: string | null }): void {
  if (event.tradingMode !== "AMM") {
    throw new Error(
      "TradingMode mismatch: this path is for AMM markets only. Event has tradingMode=" +
        String(event.tradingMode)
    );
  }
}

export function assertLegacyEvent(event: { tradingMode: string | null }): void {
  if (event.tradingMode !== "LEGACY") {
    throw new Error(
      "TradingMode mismatch: this path is for LEGACY markets only. Event has tradingMode=" +
        String(event.tradingMode)
    );
  }
}
