import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { NormalizedSourceReference } from "../value-objects/normalized-source-reference.vo.js";
import type { NormalizedExternalItemId } from "../value-objects/discovery-signal-evidence-ref.vo.js";
import type { DiscoveryObservedMetrics } from "../value-objects/discovery-observed-metrics.vo.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
export type NormalizedHeadline = string;
export type NormalizedBodySnippet = string;
export type NormalizedCanonicalUrl = string;
export type NormalizedPublishedAt = Timestamp;
export type NormalizedLanguageCode = string;
export type NormalizedGeoSignal = DiscoveryGeoScope;
export type NormalizedTopicSignal = DiscoveryTopicScope;
export type NormalizedDiscoveryItem = Readonly<{
    headline: NormalizedHeadline;
    bodySnippetNullable: NormalizedBodySnippet | null;
    canonicalUrl: NormalizedCanonicalUrl;
    externalItemId: NormalizedExternalItemId;
    publishedAt: NormalizedPublishedAt;
    publishedAtPresent: boolean;
    sourceReference: NormalizedSourceReference;
    geoSignalNullable: NormalizedGeoSignal | null;
    geoPlaceTextNullable: string | null;
    topicSignalNullable: NormalizedTopicSignal | null;
    languageCode: NormalizedLanguageCode;
    observedMetricsNullable: DiscoveryObservedMetrics | null;
}>;
export declare const createNormalizedDiscoveryItem: (input: NormalizedDiscoveryItem) => NormalizedDiscoveryItem;
//# sourceMappingURL=normalized-discovery-item.entity.d.ts.map