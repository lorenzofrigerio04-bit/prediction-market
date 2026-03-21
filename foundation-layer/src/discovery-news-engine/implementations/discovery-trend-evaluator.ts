/**
 * Trend evaluator v1: compute indicators per horizon, apply rules, produce snapshots.
 * Deterministic, explainable, no ranking, no persistence.
 */

import type { DiscoveryTrendEvaluator } from "../interfaces/discovery-trend-evaluator.js";
import type {
  DiscoveryTrendEvaluationContext,
  DiscoveryTrendEvaluateResult,
} from "../interfaces/discovery-trend-evaluator.js";
import { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";
import { createDiscoveryTrendSnapshotId } from "../value-objects/discovery-trend-snapshot-id.vo.js";
import { createDiscoveryTrendSnapshot } from "../entities/discovery-trend-snapshot.entity.js";
import { getDefaultHorizonWindow, getHorizonWindowStartMs } from "../trend/discovery-trend-horizon-config.js";
import { computeDiscoveryTrendIndicators } from "../trend/discovery-trend-indicators.js";
import { evaluateHorizonRule } from "../trend/discovery-trend-horizon-rules.js";

const ALL_HORIZONS: readonly DiscoveryTrendHorizon[] = [
  DiscoveryTrendHorizon.FAST_PULSE,
  DiscoveryTrendHorizon.SHORT_CYCLE,
  DiscoveryTrendHorizon.MEDIUM_CYCLE,
  DiscoveryTrendHorizon.SCHEDULED_MONITOR,
];

function nextSnapshotId(clusterId: string, horizon: DiscoveryTrendHorizon, index: number): string {
  const safe = clusterId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32);
  return `dts_${horizon}_${safe}_${index}`;
}

export const discoveryTrendEvaluator: DiscoveryTrendEvaluator = {
  evaluateCluster(context: DiscoveryTrendEvaluationContext): DiscoveryTrendEvaluateResult {
    const {
      cluster,
      summary,
      itemsById,
      signalsById,
      now,
      horizonsNullable,
      getSourceRoleNullable,
      windowOverrideNullable,
    } = context;

    const horizons =
      horizonsNullable != null && horizonsNullable.length > 0 ? [...horizonsNullable] : [...ALL_HORIZONS];
    const nowMs = now.getTime();
    const snapshots: ReturnType<typeof createDiscoveryTrendSnapshot>[] = [];

    horizons.forEach((horizon, index) => {
      const window =
        windowOverrideNullable != null
          ? windowOverrideNullable(horizon)
          : getDefaultHorizonWindow(horizon);
      const windowStartMs = getHorizonWindowStartMs(nowMs, window.lookbackHours);
      const windowEndMs = nowMs;

      const indicatorInput = {
        cluster,
        summary,
        itemsById,
        signalsById,
        windowStartMs,
        windowEndMs,
        ...(getSourceRoleNullable != null ? { getSourceRoleNullable } : {}),
      };
      const indicators = computeDiscoveryTrendIndicators(indicatorInput);

      const ruleResult = evaluateHorizonRule(horizon, indicators);

      const snapshotId = createDiscoveryTrendSnapshotId(
        nextSnapshotId(String(cluster.clusterId), horizon, index),
      );
      snapshots.push(
        createDiscoveryTrendSnapshot({
          snapshotId,
          clusterId: cluster.clusterId,
          horizon,
          trendStatus: ruleResult.status,
          indicatorSet: indicators,
          explanation: ruleResult.explanation,
        }),
      );
    });

    return { snapshots };
  },
};
