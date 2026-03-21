import { errorIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  resolveGeneratedAt,
  type ValidationOptions,
} from "../../validators/common/validation-result.js";
import { SignalType } from "../enums/signal-type.enum.js";
import type { FeedbackSignal } from "../signals/entities/feedback-signal.entity.js";
import { validateEditorialFeedbackSignal } from "./validate-editorial-feedback-signal.js";
import { validateReliabilityLearningSignal } from "./validate-reliability-learning-signal.js";

export const validateFeedbackSignal = (input: FeedbackSignal, options?: ValidationOptions): ValidationReport => {
  if (input.signal_type === SignalType.EDITORIAL) {
    return validateEditorialFeedbackSignal(input.payload, options);
  }
  if (input.signal_type === SignalType.RELIABILITY) {
    return validateReliabilityLearningSignal(input.payload, options);
  }
  return buildValidationReport(
    "FeedbackSignal",
    "unknown",
    [errorIssue("INVALID_SIGNAL_TYPE", "/signal_type", "signal_type is invalid")],
    resolveGeneratedAt(options),
  );
};
