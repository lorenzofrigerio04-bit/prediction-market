/**
 * Production hardening tests: no float in AMM path, guards, ledger behavior.
 */

import { describe, it, expect } from "vitest";
import { assertAmmEvent } from "../guards";
import { readFileSync } from "fs";
import { join } from "path";

const AMM_ROOT = join(__dirname, "..");
const FILES_TO_CHECK_NO_FLOAT = ["fixedPointLmsr.ts", "engine.ts", "resolve.ts"];

describe("PATCH 6 & 7: Safety and no float in AMM", () => {
  it("assertAmmEvent throws when tradingMode is not AMM", () => {
    expect(() => assertAmmEvent({ tradingMode: "LEGACY" })).toThrow("TradingMode mismatch");
    expect(() => assertAmmEvent({ tradingMode: null })).toThrow("TradingMode mismatch");
    expect(() => assertAmmEvent({ tradingMode: "AMM" })).not.toThrow();
  });


  it("AMM engine and resolve do not use float (no Number, parseFloat, .toFixed, Math. in production path)", () => {
    const floatPattern = /(?:Number\s*\(|parseFloat\s*\(|\.toFixed\s*\(|Math\.\w+\s*\()/;
    for (const file of FILES_TO_CHECK_NO_FLOAT) {
      const path = join(AMM_ROOT, file);
      const content = readFileSync(path, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith("//")) continue;
        const m = line.match(floatPattern);
        expect(m, `${file}:${i + 1} should not use float (Number/parseFloat/.toFixed/Math.): ${line.trim()}`).toBeNull();
      }
    }
  });
});
