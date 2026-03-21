/**
 * Default time windows per horizon (lookback from "now").
 * Explicit and configurable; no DB. All values in hours.
 */
import { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";
export type DiscoveryTrendHorizonWindow = Readonly<{
    lookbackHours: number;
}>;
/**
 * Returns the default lookback window (in hours) for a horizon.
 * Overridable via evaluation context when building the evaluator.
 */
export declare function getDefaultHorizonWindow(horizon: DiscoveryTrendHorizon): DiscoveryTrendHorizonWindow;
/**
 * Compute window start (epoch ms) given now and lookback hours.
 */
export declare function getHorizonWindowStartMs(nowMs: number, lookbackHours: number): number;
//# sourceMappingURL=discovery-trend-horizon-config.d.ts.map