import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import { createDiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import type { DiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";

const DEFAULT_FETCH_TIMEOUT_MS = 15_000;

export type ExecuteFetchSuccess = Readonly<{
  ok: true;
  body: string | Record<string, unknown>;
  contentType: string;
  statusCode: number;
  etag: string | null;
  fetchedAt: string;
}>;

export type ExecuteFetchError = Readonly<{
  ok: false;
  failure: DiscoveryFetchFailure;
}>;

export type ExecuteFetchResult = ExecuteFetchSuccess | ExecuteFetchError;

/**
 * Execute HTTP fetch for a discovery source. Uses endpoint from request.
 * Returns success with body (string for non-JSON, parsed object for application/json) and metadata,
 * or a structured failure that callers can map to DiscoveryFetchFailure / connector result.
 */
export async function executeFetch(
  request: DiscoveryFetchRequest,
  options?: { timeoutMs?: number },
): Promise<ExecuteFetchResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const { url, method, headersNullable } = request.sourceDefinition.endpoint;

  const headers = new Headers(headersNullable ?? undefined);
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "DiscoveryBot/1.0");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const retryable = err instanceof Error && err.name === "AbortError" ? false : true;
    return {
      ok: false,
      failure: createDiscoveryFetchFailure({
        code: "FETCH_ERROR",
        message: `Fetch failed: ${message}`,
        retryable,
        detailsNullable: err instanceof Error ? { name: err.name } : null,
      }),
    };
  }

  const statusCode = response.status;
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const etag = response.headers.get("etag");

  if (!response.ok) {
    return {
      ok: false,
      failure: createDiscoveryFetchFailure({
        code: "HTTP_ERROR",
        message: `HTTP ${statusCode} ${response.statusText}`,
        retryable: statusCode >= 500 || statusCode === 429,
        detailsNullable: { statusCode, statusText: response.statusText },
      }),
    };
  }

  const isJson =
    contentType === "application/json" ||
    contentType.startsWith("application/json;");

  const fetchedAt = new Date().toISOString();
  try {
    if (isJson) {
      const body = (await response.json()) as Record<string, unknown>;
      return {
        ok: true,
        body,
        contentType,
        statusCode,
        etag,
        fetchedAt,
      };
    }
    const body = await response.text();
    return {
      ok: true,
      body,
      contentType,
      statusCode,
      etag,
      fetchedAt,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      failure: createDiscoveryFetchFailure({
        code: "READ_BODY_ERROR",
        message: `Failed to read response body: ${message}`,
        retryable: false,
        detailsNullable: null,
      }),
    };
  }
}

/**
 * Infer discovery content type from response content-type header.
 * Used to choose parser (feed vs JSON).
 */
export function inferContentType(contentType: string): DiscoveryContentType | null {
  const lower = contentType.toLowerCase();
  if (lower.includes("application/json")) return DiscoveryContentType.APPLICATION_JSON;
  if (lower.includes("application/xml") || lower.includes("text/xml")) return DiscoveryContentType.APPLICATION_XML;
  if (lower.includes("application/rss") || lower.includes("application/atom") || lower.includes("application/rss+xml") || lower.includes("application/atom+xml"))
    return DiscoveryContentType.RSS;
  if (lower.includes("text/html")) return DiscoveryContentType.TEXT_HTML;
  if (lower.includes("text/plain")) return DiscoveryContentType.TEXT_PLAIN;
  return null;
}
