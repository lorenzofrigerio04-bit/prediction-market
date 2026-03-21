import type { EntityVersion } from "../../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../../value-objects/timestamp.vo.js";
import { PatternStatus } from "../../../enums/pattern-status.enum.js";
import { ReleaseImpact } from "../../../enums/release-impact.enum.js";
import type { CorrelationId } from "../../../value-objects/correlation-id.vo.js";
import type { ReliabilityLearningSignalId } from "../../../value-objects/learning-feedback-ids.vo.js";
import { type LearningRef } from "../../../value-objects/learning-feedback-shared.vo.js";
export type ReliabilityLearningSignal = Readonly<{
    id: ReliabilityLearningSignalId;
    version: EntityVersion;
    correlation_id: CorrelationId;
    release_impact: ReleaseImpact;
    safe_to_ignore: boolean;
    ignored_ready: boolean;
    active_pattern: boolean;
    pattern_status: PatternStatus;
    occurrence_count: number;
    evidence_refs: readonly LearningRef[];
    created_at: Timestamp;
}>;
export declare const createReliabilityLearningSignal: (input: ReliabilityLearningSignal) => ReliabilityLearningSignal;
//# sourceMappingURL=reliability-learning-signal.entity.d.ts.map