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
export declare const createSourceRecord: (input: SourceRecordInput) => SourceRecord;
export {};
//# sourceMappingURL=source-record.entity.d.ts.map