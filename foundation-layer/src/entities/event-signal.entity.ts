import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { normalizeKey } from "../common/utils/normalization.js";
import { EventCategory } from "../enums/event-category.enum.js";
import { EventPriority } from "../enums/event-priority.enum.js";
import { EventStatus } from "../enums/event-status.enum.js";
import type { ConfidenceScore } from "../value-objects/confidence-score.vo.js";
import type { Description } from "../value-objects/description.vo.js";
import type { EntityVersion } from "../value-objects/entity-version.vo.js";
import type { EventId } from "../value-objects/event-id.vo.js";
import type { SourceId } from "../value-objects/source-id.vo.js";
import type { Tag } from "../value-objects/tag.vo.js";
import type { Timestamp } from "../value-objects/timestamp.vo.js";
import type { Title } from "../value-objects/title.vo.js";

export type EventSignal = Readonly<{
  id: EventId;
  sourceRecordIds: readonly SourceId[];
  rawHeadline: Title;
  rawSummary: Description | null;
  eventCategory: EventCategory;
  eventPriority: EventPriority;
  occurredAt: Timestamp | null;
  detectedAt: Timestamp;
  jurisdictions: readonly string[];
  involvedEntities: readonly string[];
  tags: readonly Tag[];
  confidenceScore: ConfidenceScore;
  status: EventStatus;
  entityVersion: EntityVersion;
}>;

export type EventSignalInput = Omit<EventSignal, "status"> & {
  status?: EventStatus;
};

const hasDuplicateNormalized = (values: readonly string[]): boolean => {
  const seen = new Set<string>();
  for (const value of values) {
    const key = normalizeKey(value);
    if (seen.has(key)) {
      return true;
    }
    seen.add(key);
  }
  return false;
};

export const createEventSignal = (input: EventSignalInput): EventSignal => {
  if (Number.isNaN(Date.parse(input.detectedAt))) {
    throw new ValidationError("INVALID_TIMESTAMP", "detectedAt must be a valid timestamp");
  }

  if (input.sourceRecordIds.length === 0) {
    throw new ValidationError(
      "MISSING_SOURCE_RECORD_IDS",
      "EventSignal requires at least one sourceRecordId",
    );
  }

  if (hasDuplicateNormalized(input.sourceRecordIds)) {
    throw new ValidationError("DUPLICATE_SOURCE_ID", "sourceRecordIds must be unique");
  }

  if (hasDuplicateNormalized(input.jurisdictions)) {
    throw new ValidationError("DUPLICATE_JURISDICTION", "jurisdictions must be unique");
  }

  if (hasDuplicateNormalized(input.involvedEntities)) {
    throw new ValidationError(
      "DUPLICATE_INVOLVED_ENTITY",
      "involvedEntities must be unique after normalization",
    );
  }

  if (
    !Number.isFinite(input.confidenceScore) ||
    input.confidenceScore < 0 ||
    input.confidenceScore > 1
  ) {
    throw new ValidationError("INVALID_CONFIDENCE_SCORE", "confidenceScore must be in [0,1]");
  }

  return deepFreeze({
    ...input,
    status: input.status ?? EventStatus.DETECTED,
  });
};
