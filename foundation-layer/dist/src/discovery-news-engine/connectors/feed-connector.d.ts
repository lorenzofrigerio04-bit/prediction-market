/**
 * Feed connector: RSS/Atom-like sources.
 * Fetch → parse (rss-parser, adapted from lib/ingestion/fetchers/rss.ts) → DiscoveryFetchedPayload.
 * Normalization is done by FeedNormalizationAdapter via run helper.
 */
import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
export declare const feedConnector: DiscoverySourceConnector;
//# sourceMappingURL=feed-connector.d.ts.map