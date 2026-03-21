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
export declare const createEventSignal: (input: EventSignalInput) => EventSignal;
//# sourceMappingURL=event-signal.entity.d.ts.map