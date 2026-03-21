/**
 * Feed connector: RSS/Atom-like sources.
 * Fetch → parse (rss-parser, adapted from lib/ingestion/fetchers/rss.ts) → DiscoveryFetchedPayload.
 * Normalization is done by FeedNormalizationAdapter via run helper.
 */

import Parser from "rss-parser";
import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import type { DiscoveryFetchResponse } from "../entities/discovery-fetch-response.entity.js";
import type { DiscoverySourceDefinition } from "../entities/discovery-source-definition.entity.js";
import { createDiscoveryFetchedPayload } from "../entities/discovery-fetched-payload.entity.js";
import { createDiscoveryTransportMetadata } from "../entities/discovery-transport-metadata.entity.js";
import { createDiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";
import { executeFetch } from "./fetch-helpers.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ["content:encoded", "media:content"],
  },
});

/** Remove control characters and null bytes that can break XML parsing (e.g. some feeds). */
function sanitizeFeedBody(body: string): string {
  return body
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
}

async function parseFeedBody(body: string): Promise<Record<string, unknown>> {
  const sanitized = sanitizeFeedBody(body);
  const feed = (await parser.parseString(sanitized)) as {
    items?: Array<{
      link?: string;
      title?: string;
      pubDate?: string;
      description?: string;
      content?: string;
      contentSnippet?: string;
      guid?: string;
    }>;
    title?: string;
    description?: string;
  };
  const items = (feed.items ?? []).map((item) => ({
    link: item.link,
    title: item.title,
    pubDate: item.pubDate,
    description: item.description,
    content: item.content,
    contentSnippet: item.contentSnippet,
    guid: item.guid,
  }));
  return {
    items,
    feedTitle: feed.title ?? undefined,
    feedDescription: feed.description ?? undefined,
  };
}

export const feedConnector: DiscoverySourceConnector = {
  canHandle(definition: DiscoverySourceDefinition): boolean {
    return (
      definition.kind === DiscoverySourceKind.RSS || definition.kind === DiscoverySourceKind.FEED
    );
  },

  async fetch(request: DiscoveryFetchRequest): Promise<DiscoveryFetchResponse> {
    const result = await executeFetch(request);
    if (!result.ok) {
      return { ok: false, failure: result.failure };
    }

    if (typeof result.body !== "string") {
      return {
        ok: false,
        failure: createDiscoveryFetchFailure({
          code: "PARSE_FAILURE",
          message: "Feed connector expects text/XML body, got JSON",
          retryable: false,
          detailsNullable: null,
        }),
      };
    }

    try {
      const raw = await parseFeedBody(result.body);
      const payload = createDiscoveryFetchedPayload({
        raw,
        transportMetadata: createDiscoveryTransportMetadata({
          contentType: DiscoveryContentType.RSS,
          fetchedAt: createTimestamp(result.fetchedAt),
          statusCodeNullable: result.statusCode,
          etagNullable: result.etag,
        }),
      });
      return { ok: true, payload };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        failure: createDiscoveryFetchFailure({
          code: "PARSE_FAILURE",
          message: `Feed parse failed: ${message}`,
          retryable: false,
          detailsNullable: err instanceof Error ? { name: err.name } : null,
        }),
      };
    }
  },
};
