import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { ReleaseImpact } from "../../enums/release-impact.enum.js";
import {
  createLearningCompatibilityResult,
  type LearningCompatibilityResult,
} from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { LearningInsight } from "../../insights/entities/learning-insight.entity.js";
import type { ReliabilityLearningSignal } from "../../signals/reliability/entities/reliability-learning-signal.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";

export type ReliabilityReportLearningInput = Readonly<{
  reliability_signal: ReliabilityLearningSignal;
  insight: LearningInsight;
}>;

const toStatus = (input: ReliabilityReportLearningInput): LearningCompatibilityStatus => {
  if (
    input.reliability_signal.release_impact === ReleaseImpact.CRITICAL &&
    input.reliability_signal.active_pattern
  ) {
    return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
  }
  return LearningCompatibilityStatus.COMPATIBLE;
};

export class ReliabilityReportLearningAdapter
  implements LearningCompatibilityAdapter<ReliabilityReportLearningInput>
{
  adapt(input: ReliabilityReportLearningInput): LearningCompatibilityResult {
    const status = toStatus(input);
    return createLearningCompatibilityResult({
      id: createLearningCompatibilityResultId(`lcp_${input.reliability_signal.id.slice(4)}rr`),
      correlation_id: input.reliability_signal.correlation_id,
      target: LearningCompatibilityTarget.RELIABILITY_REPORT_LEARNING,
      status,
      mapped_artifact: {
        source_id: input.reliability_signal.id,
        target_id: input.insight.id,
        readiness: status,
        lossy_fields: ["raw_regression_series"],
      },
      notes: ["deterministic reliability report mapping"],
    });
  }
}
