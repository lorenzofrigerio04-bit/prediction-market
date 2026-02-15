/**
 * Analytics: invio eventi verso provider configurato (PostHog, Vercel Analytics, o endpoint custom).
 * Passa userId, sessionId, category, eventId, amount, period dove applicabile.
 *
 * Env:
 * - ANALYTICS_PROVIDER: "posthog" | "vercel" | "custom" | "" (disabilitato)
 * - POSTHOG_API_KEY: (per posthog)
 * - POSTHOG_HOST: (default https://app.posthog.com)
 * - ANALYTICS_ENDPOINT: (per custom, POST JSON)
 */

export type AnalyticsEvent =
  | "USER_SIGNUP"
  | "ONBOARDING_COMPLETE"
  | "EVENT_VIEWED"
  | "EVENT_FOLLOWED"
  | "PREDICTION_PLACED"
  | "COMMENT_POSTED"
  | "REACTION_ADDED"
  | "EVENT_RESOLVED_VIEWED"
  | "MISSION_VIEWED"
  | "MISSION_COMPLETED"
  | "DAILY_BONUS_CLAIMED"
  | "LEADERBOARD_VIEWED"
  | "PROFILE_VIEWED";

export type AnalyticsProperties = {
  userId?: string;
  sessionId?: string;
  category?: string;
  eventId?: string;
  amount?: number;
  period?: string;
  outcome?: string;
  item?: string;
  itemId?: string;
  priceCredits?: number;
  missionId?: string;
  [key: string]: string | number | boolean | undefined;
};

/**
 * Invia un evento analytics (server-side).
 * Non blocca: esegue in fire-and-forget; errori loggati ma non propagati.
 */
export function track(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
  context?: { request?: Request }
): void {
  const provider = process.env.ANALYTICS_PROVIDER || "";
  if (!provider) return;

  const sessionId =
    context?.request?.headers?.get("x-session-id") ||
    context?.request?.headers?.get("x-vercel-id") ||
    undefined;

  const payload = {
    event,
    properties: {
      ...properties,
      ...(sessionId && { sessionId }),
      timestamp: new Date().toISOString(),
    },
  };

  if (provider === "posthog") {
    sendPostHog(event, { ...properties, sessionId }).catch((e) =>
      console.error("[analytics] PostHog error:", e)
    );
    return;
  }

  if (provider === "custom") {
    const endpoint = process.env.ANALYTICS_ENDPOINT;
    if (endpoint) {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((e) => console.error("[analytics] Custom endpoint error:", e));
    }
    return;
  }

  if (provider === "vercel") {
    // Vercel Analytics è tipicamente client-side; qui possiamo solo loggare o inoltrare a custom
    if (process.env.ANALYTICS_ENDPOINT) {
      fetch(process.env.ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: "vercel" }),
      }).catch((e) => console.error("[analytics] Vercel/endpoint error:", e));
    }
  }
}

async function sendPostHog(
  event: string,
  properties: Record<string, unknown>
): Promise<void> {
  const key = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.POSTHOG_HOST || "https://app.posthog.com";
  if (!key) return;

  const distinctId = (properties.userId as string) || "anonymous";
  await fetch(`${host.replace(/\/$/, "")}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      event,
      distinct_id: distinctId,
      properties: {
        ...properties,
        $lib: "prediction-market-server",
      },
    }),
  });
}
