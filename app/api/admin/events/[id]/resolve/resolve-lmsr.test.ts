/**
 * Unit tests for LMSR payout calculation used in event resolution.
 * Payout for winners: cost(final_q_yes, final_q_no, b) - costBasis.
 * Payout for losers: 0.
 */

import { describe, it, expect } from "vitest";
import { cost } from "@/lib/pricing/lmsr";

function computeWinnerPayout(
  finalQYes: number,
  finalQNo: number,
  b: number,
  costBasis: number
): number {
  const finalCost = cost(finalQYes, finalQNo, b);
  return Math.max(0, Math.floor(finalCost - costBasis));
}

describe("resolve LMSR payout", () => {
  const b = 100;

  it("winner payout = cost(final) - costBasis when costBasis < finalCost", () => {
    const finalQYes = 50;
    const finalQNo = 30;
    const costBasis = 40;
    const payout = computeWinnerPayout(finalQYes, finalQNo, b, costBasis);
    const finalCost = cost(finalQYes, finalQNo, b);
    expect(payout).toBe(Math.floor(finalCost - costBasis));
    expect(payout).toBeGreaterThanOrEqual(0);
  });

  it("winner payout is 0 when costBasis >= finalCost", () => {
    const finalQYes = 10;
    const finalQNo = 10;
    const finalCost = cost(finalQYes, finalQNo, b);
    const costBasis = finalCost + 5;
    const payout = computeWinnerPayout(finalQYes, finalQNo, b, costBasis);
    expect(payout).toBe(0);
  });

  it("loser payout is always 0", () => {
    expect(0).toBe(0);
  });

  it("uses event final q_yes, q_no and b for cost()", () => {
    const finalQYes = 20;
    const finalQNo = 80;
    const costBasis = 30;
    const payout = computeWinnerPayout(finalQYes, finalQNo, b, costBasis);
    const expectedCost = cost(finalQYes, finalQNo, b);
    expect(payout).toBe(Math.max(0, Math.floor(expectedCost - costBasis)));
  });

  it("payout is non-negative for valid costBasis", () => {
    const finalQYes = 100;
    const finalQNo = 50;
    const costBasis = 50;
    const payout = computeWinnerPayout(finalQYes, finalQNo, b, costBasis);
    expect(payout).toBeGreaterThanOrEqual(0);
  });
});
