import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { DeadlineBasisType } from "../../enums/deadline-basis-type.enum.js";
import type { DeadlineResolutionId } from "../../value-objects/market-design-ids.vo.js";
import { createScore01 } from "../../value-objects/score.vo.js";

export type DeadlineResolution = Readonly<{
  id: DeadlineResolutionId;
  canonical_event_id: CanonicalEventIntelligenceId;
  event_deadline: Timestamp;
  market_close_time: Timestamp;
  resolution_cutoff_nullable: Timestamp | null;
  timezone: string;
  deadline_basis_type: DeadlineBasisType;
  deadline_basis_reference: string;
  confidence: number;
  warnings: readonly string[];
}>;

const isValidIsoTimestamp = (value: string): boolean => !Number.isNaN(Date.parse(value));

export const createDeadlineResolution = (input: DeadlineResolution): DeadlineResolution => {
  createScore01(input.confidence, "confidence");
  if (!Object.values(DeadlineBasisType).includes(input.deadline_basis_type)) {
    throw new ValidationError("INVALID_DEADLINE_RESOLUTION", "deadline_basis_type is invalid");
  }
  if (input.timezone.trim().length === 0) {
    throw new ValidationError("INVALID_DEADLINE_RESOLUTION", "timezone is required");
  }
  if (input.deadline_basis_reference.trim().length === 0) {
    throw new ValidationError("INVALID_DEADLINE_RESOLUTION", "deadline_basis_reference is required");
  }
  if (!isValidIsoTimestamp(input.event_deadline) || !isValidIsoTimestamp(input.market_close_time)) {
    throw new ValidationError(
      "INVALID_DEADLINE_RESOLUTION",
      "event_deadline and market_close_time must be valid ISO timestamps",
    );
  }

  const eventDeadlineTs = Date.parse(input.event_deadline);
  const marketCloseTs = Date.parse(input.market_close_time);
  if (marketCloseTs > eventDeadlineTs) {
    throw new ValidationError(
      "INVALID_DEADLINE_RESOLUTION",
      "market_close_time must be <= event_deadline",
    );
  }
  if (input.resolution_cutoff_nullable !== null) {
    if (!isValidIsoTimestamp(input.resolution_cutoff_nullable)) {
      throw new ValidationError(
        "INVALID_DEADLINE_RESOLUTION",
        "resolution_cutoff_nullable must be a valid ISO timestamp when provided",
      );
    }
    const cutoffTs = Date.parse(input.resolution_cutoff_nullable);
    if (marketCloseTs > cutoffTs) {
      throw new ValidationError(
        "INVALID_DEADLINE_RESOLUTION",
        "market_close_time must be <= resolution_cutoff_nullable",
      );
    }
  }

  return deepFreeze({
    ...input,
    timezone: input.timezone.trim(),
    deadline_basis_reference: input.deadline_basis_reference.trim(),
    warnings: [...input.warnings],
  });
};
