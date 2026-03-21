/**
 * Default time windows per horizon (lookback from "now").
 * Explicit and configurable; no DB. All values in hours.
 */

import { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";

export type DiscoveryTrendHorizonWindow = Readonly<{
  lookbackHours: number;
}>;

const DEFAULT_FAST_PULSE_HOURS = 24;
const DEFAULT_SHORT_CYCLE_HOURS = 7 * 24; // 7 days
const DEFAULT_MEDIUM_CYCLE_HOURS = 30 * 24; // 30 days
const DEFAULT_SCHEDULED_MONITOR_HOURS = 7 * 24; // same as short cycle; relevance from source role

const DEFAULT_HORIZON_WINDOWS: Readonly<Record<DiscoveryTrendHorizon, DiscoveryTrendHorizonWindow>> = {
  [DiscoveryTrendHorizon.FAST_PULSE]: { lookbackHours: DEFAULT_FAST_PULSE_HOURS },
  [DiscoveryTrendHorizon.SHORT_CYCLE]: { lookbackHours: DEFAULT_SHORT_CYCLE_HOURS },
  [DiscoveryTrendHorizon.MEDIUM_CYCLE]: { lookbackHours: DEFAULT_MEDIUM_CYCLE_HOURS },
  [DiscoveryTrendHorizon.SCHEDULED_MONITOR]: { lookbackHours: DEFAULT_SCHEDULED_MONITOR_HOURS },
};

/**
 * Returns the default lookback window (in hours) for a horizon.
 * Overridable via evaluation context when building the evaluator.
 */
export function getDefaultHorizonWindow(
  horizon: DiscoveryTrendHorizon,
): DiscoveryTrendHorizonWindow {
  return DEFAULT_HORIZON_WINDOWS[horizon];
}

/**
 * Compute window start (epoch ms) given now and lookback hours.
 */
export function getHorizonWindowStartMs(nowMs: number, lookbackHours: number): number {
  return nowMs - lookbackHours * 60 * 60 * 1000;
}
