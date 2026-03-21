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
import type { ResolutionWindow } from "../value-objects/resolution-window.vo.js";
import type { SourceId } from "../value-objects/source-id.vo.js";
import type { Slug } from "../value-objects/slug.vo.js";
import type { Tag } from "../value-objects/tag.vo.js";
import type { Timestamp } from "../value-objects/timestamp.vo.js";
import type { Title } from "../value-objects/title.vo.js";

export type CanonicalEvent = Readonly<{
  id: EventId;
  title: Title;
  slug: Slug;
  description: Description;
  category: EventCategory;
  priority: EventPriority;
  status: EventStatus;
  occurredAt: Timestamp | null;
  firstObservedAt: Timestamp;
  lastUpdatedAt: Timestamp;
  jurisdictions: readonly string[];
  involvedEntities: readonly string[];
  supportingSourceRecordIds: readonly SourceId[];
  supportingSignalIds: readonly EventId[];
  tags: readonly Tag[];
  confidenceScore: ConfidenceScore;
  resolutionWindow: ResolutionWindow | null;
  entityVersion: EntityVersion;
}>;

const assertUniqueNormalized = (values: readonly string[], code: string, message: string): void => {
  const seen = new Set<string>();
  for (const value of values) {
    const key = normalizeKey(value);
    if (seen.has(key)) {
      throw new ValidationError(code, message, { value });
    }
    seen.add(key);
  }
};

export const createCanonicalEvent = (input: CanonicalEvent): CanonicalEvent => {
  if (input.title.trim().length === 0) {
    throw new ValidationError("EMPTY_TITLE", "title must be non-empty");
  }
  if (input.slug.trim().length === 0) {
    throw new ValidationError("INVALID_SLUG", "slug must be non-empty");
  }
  if (input.description.trim().length === 0) {
    throw new ValidationError("EMPTY_DESCRIPTION", "description must be non-empty");
  }
  if (
    !Number.isFinite(input.confidenceScore) ||
    input.confidenceScore < 0 ||
    input.confidenceScore > 1
  ) {
    throw new ValidationError("INVALID_CONFIDENCE_SCORE", "confidenceScore must be in [0,1]");
  }
  if (
    Number.isNaN(Date.parse(input.firstObservedAt)) ||
    Number.isNaN(Date.parse(input.lastUpdatedAt))
  ) {
    throw new ValidationError(
      "INVALID_TIMESTAMP",
      "firstObservedAt and lastUpdatedAt must be valid timestamps",
    );
  }

  if (Date.parse(input.firstObservedAt) > Date.parse(input.lastUpdatedAt)) {
    throw new ValidationError(
      "LAST_UPDATED_BEFORE_FIRST_OBSERVED",
      "firstObservedAt must be <= lastUpdatedAt",
    );
  }

  assertUniqueNormalized(
    input.supportingSourceRecordIds,
    "DUPLICATE_SOURCE_ID",
    "supportingSourceRecordIds must be unique",
  );
  assertUniqueNormalized(
    input.supportingSignalIds,
    "DUPLICATE_SIGNAL_ID",
    "supportingSignalIds must be unique",
  );
  assertUniqueNormalized(input.tags, "DUPLICATE_TAG", "tags must be unique");

  if (
    [EventStatus.RESOLVED, EventStatus.ARCHIVED].includes(input.status) &&
    input.resolutionWindow === null
  ) {
    throw new ValidationError(
      "MISSING_RESOLUTION_WINDOW",
      "resolutionWindow required when status is resolved/archived",
    );
  }

  return deepFreeze(input);
};
