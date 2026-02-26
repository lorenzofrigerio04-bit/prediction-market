/**
 * Runtime guard: only AMM markets are supported (Polymarket-style).
 */

export function assertAmmEvent(event: { tradingMode: string | null }): void {
  if (event.tradingMode !== "AMM") {
    throw new Error(
      "TradingMode mismatch: only AMM markets are supported. Event has tradingMode=" +
        String(event.tradingMode)
    );
  }
}
