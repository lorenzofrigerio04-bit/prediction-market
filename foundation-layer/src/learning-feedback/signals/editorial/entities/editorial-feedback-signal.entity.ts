import { ValidationError } from "../../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../../value-objects/timestamp.vo.js";
import { FeedbackReasonCode } from "../../../enums/feedback-reason-code.enum.js";
import { FeedbackType } from "../../../enums/feedback-type.enum.js";
import type { CorrelationId } from "../../../value-objects/correlation-id.vo.js";
import type { EditorialFeedbackSignalId } from "../../../value-objects/learning-feedback-ids.vo.js";
import {
  createLearningRefList,
  createLearningTextList,
  type LearningRef,
  type LearningText,
} from "../../../value-objects/learning-feedback-shared.vo.js";

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

const validateEditorialCoherence = (
  feedbackType: FeedbackType,
  decisionRefs: readonly LearningRef[],
  reasonCodes: readonly FeedbackReasonCode[],
): void => {
  if (
    feedbackType === FeedbackType.APPROVAL &&
    reasonCodes.some(
      (reason) =>
        reason === FeedbackReasonCode.BLOCKING_DEPENDENCY || reason === FeedbackReasonCode.SAFETY_RISK,
    )
  ) {
    throw new ValidationError(
      "INVALID_EDITORIAL_FEEDBACK_SIGNAL",
      "approval feedback_type cannot contain blocking reason codes",
    );
  }
  if (feedbackType === FeedbackType.REJECTION && reasonCodes.length === 0) {
    throw new ValidationError(
      "INVALID_EDITORIAL_FEEDBACK_SIGNAL",
      "rejection feedback_type requires non-empty reason_codes",
    );
  }
  if (feedbackType === FeedbackType.REVISION_REQUEST) {
    if (decisionRefs.length === 0) {
      throw new ValidationError(
        "INVALID_EDITORIAL_FEEDBACK_SIGNAL",
        "revision_request feedback_type requires non-empty decision_refs",
      );
    }
    if (reasonCodes.length === 0) {
      throw new ValidationError(
        "INVALID_EDITORIAL_FEEDBACK_SIGNAL",
        "revision_request feedback_type requires non-empty reason_codes",
      );
    }
  }
  if (feedbackType === FeedbackType.MANUAL_OVERRIDE && decisionRefs.length === 0) {
    throw new ValidationError(
      "INVALID_EDITORIAL_FEEDBACK_SIGNAL",
      "manual_override feedback_type requires at least one decision_ref",
    );
  }
};

export const createEditorialFeedbackSignal = (
  input: EditorialFeedbackSignal,
): EditorialFeedbackSignal => {
  if (!Object.values(FeedbackType).includes(input.feedback_type)) {
    throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "feedback_type is invalid");
  }
  if (input.correlation_id.trim().length === 0) {
    throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "correlation_id is required");
  }
  const decision_refs = createLearningRefList(input.decision_refs, "decision_refs");
  const reason_codes = deepFreeze(
    input.reason_codes.map((code) => {
      if (!Object.values(FeedbackReasonCode).includes(code)) {
        throw new ValidationError("INVALID_EDITORIAL_FEEDBACK_SIGNAL", "reason_codes contains invalid value");
      }
      return code;
    }),
  );
  validateEditorialCoherence(input.feedback_type, decision_refs, reason_codes);

  return deepFreeze({
    ...input,
    decision_refs,
    reason_codes,
    notes: createLearningTextList(input.notes, "notes"),
  });
};
