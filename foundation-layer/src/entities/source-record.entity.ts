import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { normalizeKey } from "../common/utils/normalization.js";
import { SourceType } from "../enums/source-type.enum.js";
import type { ConfidenceScore } from "../value-objects/confidence-score.vo.js";
import type { Description } from "../value-objects/description.vo.js";
import type { EntityVersion } from "../value-objects/entity-version.vo.js";
import type { Locale } from "../value-objects/locale.vo.js";
import type { SourceId } from "../value-objects/source-id.vo.js";
import type { Tag } from "../value-objects/tag.vo.js";
import type { Timestamp } from "../value-objects/timestamp.vo.js";
import type { Title } from "../value-objects/title.vo.js";
import type { Url } from "../value-objects/url.vo.js";

export type SourceRecord = Readonly<{
  id: SourceId;
  sourceType: SourceType;
  sourceName: string;
  sourceAuthorityScore: ConfidenceScore | null;
  title: Title;
  description: Description | null;
  url: Url | null;
  publishedAt: Timestamp | null;
  capturedAt: Timestamp;
  locale: Locale | null;
  tags: readonly Tag[];
  externalRef: string | null;
  entityVersion: EntityVersion;
}>;

type SourceRecordInput = Omit<SourceRecord, "sourceName" | "tags"> & {
  sourceName: string;
  tags: readonly Tag[];
};

export const createSourceRecord = (input: SourceRecordInput): SourceRecord => {
  if (Number.isNaN(Date.parse(input.capturedAt))) {
    throw new ValidationError("INVALID_TIMESTAMP", "capturedAt must be a valid timestamp");
  }

  const sourceName = input.sourceName.trim();
  if (sourceName.length === 0) {
    throw new ValidationError("INVALID_SOURCE_NAME", "sourceName must be non-empty");
  }

  if (input.publishedAt !== null) {
    if (Number.isNaN(Date.parse(input.publishedAt))) {
      throw new ValidationError("INVALID_TIMESTAMP", "publishedAt must be a valid timestamp");
    }
    const publishedAtTime = Date.parse(input.publishedAt);
    const capturedAtTime = Date.parse(input.capturedAt);
    const maxFutureMs = 24 * 60 * 60 * 1000;
    if (publishedAtTime - capturedAtTime > maxFutureMs) {
      throw new ValidationError(
        "PUBLISHED_AFTER_CAPTURED_EXCESSIVE",
        "publishedAt cannot exceed capturedAt by more than 24h",
      );
    }
  }

  if (input.url !== null && !/^https?:\/\//.test(input.url)) {
    throw new ValidationError("INVALID_URL", "url must use http/https protocol");
  }

  const seenTags = new Set<string>();
  for (const tag of input.tags) {
    const key = normalizeKey(tag);
    if (seenTags.has(key)) {
      throw new ValidationError("DUPLICATE_TAG", "tags must be unique after normalization", {
        tag,
      });
    }
    seenTags.add(key);
  }

  return deepFreeze({
    ...input,
    sourceName,
  });
};
