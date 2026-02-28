/**
 * Unit tests for level and XP (mission progression).
 */
import { describe, it, expect } from "vitest";
import {
  computeLevelFromXP,
  getXpToNextLevel,
  getXpRequiredForLevel,
  LEVEL_THRESHOLDS,
  MAX_LEVEL,
} from "../level-service";

describe("level-service", () => {
  describe("computeLevelFromXP", () => {
    it("returns 1 for 0 XP", () => {
      expect(computeLevelFromXP(0)).toBe(1);
    });
    it("returns 1 for 499 XP", () => {
      expect(computeLevelFromXP(499)).toBe(1);
    });
    it("returns 2 for 500 XP", () => {
      expect(computeLevelFromXP(500)).toBe(2);
    });
    it("returns 2 for 1999 XP", () => {
      expect(computeLevelFromXP(1999)).toBe(2);
    });
    it("returns 3 for 2000 XP", () => {
      expect(computeLevelFromXP(2000)).toBe(3);
    });
    it("returns 5 for 10000+ XP", () => {
      expect(computeLevelFromXP(10000)).toBe(5);
      expect(computeLevelFromXP(50000)).toBe(5);
    });
    it("never exceeds MAX_LEVEL", () => {
      expect(computeLevelFromXP(1e6)).toBe(MAX_LEVEL);
    });
  });

  describe("getXpToNextLevel", () => {
    it("returns 500 for level 1 with 0 XP", () => {
      expect(getXpToNextLevel(1, 0)).toBe(500);
    });
    it("returns 0 at max level", () => {
      expect(getXpToNextLevel(MAX_LEVEL, 10000)).toBe(0);
    });
    it("returns correct remainder for level 1", () => {
      expect(getXpToNextLevel(1, 100)).toBe(400);
    });
  });

  describe("getXpRequiredForLevel", () => {
    it("returns 0 for level 1", () => {
      expect(getXpRequiredForLevel(1)).toBe(LEVEL_THRESHOLDS[0]);
    });
    it("returns 500 for level 2", () => {
      expect(getXpRequiredForLevel(2)).toBe(500);
    });
    it("returns 0 for invalid level", () => {
      expect(getXpRequiredForLevel(0)).toBe(0);
      expect(getXpRequiredForLevel(6)).toBe(0);
    });
  });
});
