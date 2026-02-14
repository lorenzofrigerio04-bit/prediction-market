/**
 * Client-side: invia eventi analytics tramite API (per view events).
 * Usare in useEffect sulle pagine: EVENT_VIEWED, LEADERBOARD_VIEWED, PROFILE_VIEWED, SHOP_VIEWED, MISSION_VIEWED, EVENT_RESOLVED_VIEWED.
 */

export type ClientAnalyticsEvent =
  | "EVENT_VIEWED"
  | "EVENT_RESOLVED_VIEWED"
  | "LEADERBOARD_VIEWED"
  | "PROFILE_VIEWED"
  | "SHOP_VIEWED"
  | "MISSION_VIEWED";

const VALID_VIEW_EVENTS: ClientAnalyticsEvent[] = [
  "EVENT_VIEWED",
  "EVENT_RESOLVED_VIEWED",
  "LEADERBOARD_VIEWED",
  "PROFILE_VIEWED",
  "SHOP_VIEWED",
  "MISSION_VIEWED",
];

export function trackView(
  event: ClientAnalyticsEvent,
  properties: Record<string, string | number | undefined> = {}
): void {
  if (!VALID_VIEW_EVENTS.includes(event)) return;
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
}
