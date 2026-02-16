/**
 * Auto-resolution engine: check resolutionSourceUrl for outcome (YES/NO).
 * If outcome is clear, return it; if uncertain, flag for review (needs_review).
 * Only considers events that are closed (closesAt <= now) and not yet resolved.
 */

export type AutoResolveResult =
  | { outcome: "YES" }
  | { outcome: "NO" }
  | { needsReview: true }
  | { error: string };

export type ClosedEventForResolve = {
  id: string;
  title: string;
  closesAt: Date;
  resolutionSourceUrl: string | null;
  resolutionStatus: string;
};

const OUTCOME_YES_PATTERNS = [
  /\b(?:outcome|result|resolved|winner|won|answer)\s*[=:]\s*["']?(?:yes|true|1|sì|si)["']?/i,
  /"outcome"\s*:\s*"YES"/i,
  /"result"\s*:\s*"yes"/i,
  /\b(?:resolved|outcome)\s*:\s*true/i,
  /(?:event|market)\s+(?:was\s+)?(?:resolved\s+)?(?:as\s+)?(?:yes|true)/i,
];

const OUTCOME_NO_PATTERNS = [
  /\b(?:outcome|result|resolved|winner|won|answer)\s*[=:]\s*["']?(?:no|false|0)["']?/i,
  /"outcome"\s*:\s*"NO"/i,
  /"result"\s*:\s*"no"/i,
  /\b(?:resolved|outcome)\s*:\s*false/i,
  /(?:event|market)\s+(?:was\s+)?(?:resolved\s+)?(?:as\s+)?(?:no|false)/i,
];

/** Fetch content from resolutionSourceUrl (GET). Returns text or JSON string. */
export async function fetchResolutionSource(url: string): Promise<{
  content: string;
  contentType: string;
}> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "PredictionMarketBot/1.0 (resolution check)",
      Accept: "text/html,application/json,application/xml,text/plain,*/*",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const contentType =
    res.headers.get("content-type")?.toLowerCase() ?? "text/plain";
  const text = await res.text();
  return { content: text, contentType };
}

/**
 * Parse outcome from fetched content.
 * - JSON: look for outcome, result, resolved, winner fields (YES/NO, true->YES, false->NO).
 * - Text: use conservative regex patterns for explicit outcome mentions.
 * Returns outcome only when confident; otherwise needsReview.
 */
export function parseOutcomeFromContent(
  content: string,
  contentType: string
): "YES" | "NO" | null {
  const isJson =
    contentType.includes("application/json") ||
    (content.trim().startsWith("{") && content.trim().endsWith("}"));

  if (isJson) {
    const jsonOutcome = parseOutcomeFromJson(content);
    if (jsonOutcome) return jsonOutcome;
  }

  return parseOutcomeFromText(content);
}

function parseOutcomeFromJson(content: string): "YES" | "NO" | null {
  try {
    const data = JSON.parse(content) as Record<string, unknown>;
    const value = getOutcomeFromObject(data);
    if (value === true || value === "yes" || value === "YES" || value === "Yes")
      return "YES";
    if (value === false || value === "no" || value === "NO" || value === "No")
      return "NO";
  } catch {
    // invalid JSON
  }
  return null;
}

function getOutcomeFromObject(obj: Record<string, unknown>): unknown {
  const keys = [
    "outcome",
    "result",
    "resolved",
    "winner",
    "answer",
    "resolvedOutcome",
  ];
  for (const key of keys) {
    const v = obj[key];
    if (v === undefined) continue;
    if (typeof v === "string" || typeof v === "boolean") return v;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const nested = getOutcomeFromObject(v as Record<string, unknown>);
      if (nested !== undefined) return nested;
    }
  }
  return undefined;
}

function parseOutcomeFromText(content: string): "YES" | "NO" | null {
  const normalized = content.replace(/\s+/g, " ").slice(0, 50_000);
  const hasYes = OUTCOME_YES_PATTERNS.some((re) => re.test(normalized));
  const hasNo = OUTCOME_NO_PATTERNS.some((re) => re.test(normalized));
  if (hasYes && !hasNo) return "YES";
  if (hasNo && !hasYes) return "NO";
  return null;
}

/**
 * Check resolution source for an event. Fetches URL and parses outcome.
 * Only returns YES/NO when confident; otherwise needsReview or error.
 */
export async function checkResolutionSource(
  resolutionSourceUrl: string
): Promise<AutoResolveResult> {
  try {
    const { content, contentType } = await fetchResolutionSource(
      resolutionSourceUrl
    );
    const outcome = parseOutcomeFromContent(content, contentType);
    if (outcome === "YES") return { outcome: "YES" };
    if (outcome === "NO") return { outcome: "NO" };
    return { needsReview: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}

/** Prisma client type for dependency injection (tests). */
type PrismaLike = {
  event: {
    findMany: (args: {
      where: {
        closesAt: { lte: Date };
        resolved: boolean;
      };
      select: Record<string, boolean>;
      orderBy: { closesAt: "asc" };
    }) => Promise<ClosedEventForResolve[]>;
    update: (args: {
      where: { id: string };
      data: { resolutionStatus: string };
    }) => Promise<unknown>;
  };
};

/**
 * Fetch all closed, unresolved events (closesAt <= now, resolved = false).
 * Used by the cron to decide which markets to check for auto-resolution.
 */
export async function getClosedUnresolvedEvents(
  prisma: PrismaLike
): Promise<ClosedEventForResolve[]> {
  const now = new Date();
  return prisma.event.findMany({
    where: {
      closesAt: { lte: now },
      resolved: false,
    },
    select: {
      id: true,
      title: true,
      closesAt: true,
      resolutionSourceUrl: true,
      resolutionStatus: true,
    },
    orderBy: { closesAt: "asc" },
  });
}
