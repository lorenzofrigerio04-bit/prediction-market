import type { EntityVersion } from "../../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../../value-objects/timestamp.vo.js";
import { FeedbackReasonCode } from "../../../enums/feedback-reason-code.enum.js";
import { FeedbackType } from "../../../enums/feedback-type.enum.js";
import type { CorrelationId } from "../../../value-objects/correlation-id.vo.js";
import type { EditorialFeedbackSignalId } from "../../../value-objects/learning-feedback-ids.vo.js";
import { type LearningRef, type LearningText } from "../../../value-objects/learning-feedback-shared.vo.js";
export type EditorialFeedbackSignal = Readonly<{
    id: EditorialFeedbackSignalId;
    version: EntityVersion;
    correlation_id: CorrelationId;
    feedback_type: FeedbackType;
    decision_refs: readonly LearningRef[];
    reason_codes: readonly FeedbackReasonCode[];
    notes: readonly LearningText[];
    created_at: Timestamp;
}>;
export declare const createEditorialFeedbackSignal: (input: EditorialFeedbackSignal) => EditorialFeedbackSignal;
//# sourceMappingURL=editorial-feedback-signal.entity.d.ts.map