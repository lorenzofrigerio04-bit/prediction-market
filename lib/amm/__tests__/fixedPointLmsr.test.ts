/**
 * Unit tests for fixed-point LMSR. Compare against float LMSR within tolerance.
 */

import { describe, it, expect } from "vitest";
import {
  priceYesMicros,
  buyGivenMaxCost,
  sellGivenShares,
  SCALE,
} from "../fixedPointLmsr";
import { getPrice, cost, buyShares, sellShares } from "@/lib/pricing/lmsr";

const SCALE_NUM = Number(SCALE);

function toNum(micros: bigint): number {
  return Number(micros) / SCALE_NUM;
}

function toBigInt(x: number): bigint {
  return BigInt(Math.floor(x * SCALE_NUM));
}

const TOLERANCE_PRICE = 5e-4; // 0.05% in [0,1]
const TOLERANCE_COST = 1e-2; // cost can be larger magnitude
const TOLERANCE_SHARES = 1e-2;

describe("fixedPointLmsr", () => {
  describe("priceYesMicros vs float getPrice", () => {
    it("initial state (0,0) returns 0.5", () => {
      const p = priceYesMicros(0n, 0n, 100n * SCALE);
      expect(toNum(p)).toBeCloseTo(0.5, 5);
    });

    it("matches float getPrice for various (qYes, qNo, b)", () => {
      const cases: [number, number, number][] = [
        [0, 0, 100],
        [10, 20, 100],
        [50, 50, 100],
        [100, 0, 100],
        [0, 100, 100],
        [200, 100, 150],
      ];
      for (const [qYes, qNo, b] of cases) {
        const floatPrice = getPrice(qYes, qNo, b, "YES");
        const micros = priceYesMicros(toBigInt(qYes), toBigInt(qNo), toBigInt(b));
        const fixedPrice = toNum(micros);
        expect(Math.abs(fixedPrice - floatPrice)).toBeLessThanOrEqual(TOLERANCE_PRICE);
      }
    });
  });

  describe("buyGivenMaxCost vs float buyShares", () => {
    it("matches float buyShares within tolerance for small cost", () => {
      const qYes = 0;
      const qNo = 0;
      const b = 100;
      const costToPay = 10;
      const { sharesBought, actualCostPaid } = buyShares(qYes, qNo, b, "YES", costToPay);
      const { shareMicros, actualCostMicros } = buyGivenMaxCost(
        0n,
        0n,
        toBigInt(b),
        "YES",
        toBigInt(costToPay)
      );
      expect(toNum(shareMicros)).toBeCloseTo(sharesBought, 2);
      expect(toNum(actualCostMicros)).toBeCloseTo(actualCostPaid, 2);
    });

    it("matches float for non-zero state", () => {
      const qYes = 30;
      const qNo = 20;
      const b = 100;
      const costToPay = 15;
      const { sharesBought, actualCostPaid } = buyShares(qYes, qNo, b, "NO", costToPay);
      const { shareMicros, actualCostMicros } = buyGivenMaxCost(
        toBigInt(qYes),
        toBigInt(qNo),
        toBigInt(b),
        "NO",
        toBigInt(costToPay)
      );
      expect(Math.abs(toNum(shareMicros) - sharesBought)).toBeLessThanOrEqual(TOLERANCE_SHARES);
      expect(Math.abs(toNum(actualCostMicros) - actualCostPaid)).toBeLessThanOrEqual(TOLERANCE_COST);
    });
  });

  describe("sellGivenShares vs float sellShares", () => {
    it("matches float sellShares within tolerance", () => {
      const qYes = 50;
      const qNo = 30;
      const b = 100;
      const sharesToSell = 10;
      const floatProceeds = sellShares(qYes, qNo, b, "YES", sharesToSell);
      const fixedProceeds = sellGivenShares(
        toBigInt(qYes),
        toBigInt(qNo),
        toBigInt(b),
        "YES",
        toBigInt(sharesToSell)
      );
      expect(toNum(fixedProceeds)).toBeCloseTo(floatProceeds, 2);
    });
  });

  describe("determinism and edge cases", () => {
    it("same inputs give same outputs", () => {
      const a = buyGivenMaxCost(100n * SCALE, 50n * SCALE, 100n * SCALE, "YES", 20n * SCALE);
      const b = buyGivenMaxCost(100n * SCALE, 50n * SCALE, 100n * SCALE, "YES", 20n * SCALE);
      expect(a.shareMicros).toBe(b.shareMicros);
      expect(a.actualCostMicros).toBe(b.actualCostMicros);
    });

    it("throws on invalid inputs", () => {
      expect(() => priceYesMicros(-1n, 0n, SCALE)).toThrow();
      expect(() => buyGivenMaxCost(0n, 0n, 0n, "YES", SCALE)).toThrow();
      expect(() => sellGivenShares(10n * SCALE, 0n, SCALE, "YES", 20n * SCALE)).toThrow();
    });
  });
});
