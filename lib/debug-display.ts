/**
 * Debug labels and titles: when to show them and how to display market titles.
 *
 * Debug UI (e.g. debug panel on home) and the "[DEBUG]" prefix in market titles
 * are shown only when:
 *   - URL contains ?debug=1, OR
 *   - Env DEBUG_MODE=true (server) / NEXT_PUBLIC_DEBUG_MODE=true (client).
 *
 * For normal users we hide debug-only markets from feeds and strip the prefix
 * at render time so behaviour is predictable: no debug labels unless explicitly
 * in debug mode.
 */

export const DEBUG_TITLE_PREFIX = "[DEBUG]";

/** Returns true if the market title is a debug-only one (starts with [DEBUG]). */
export function isDebugTitle(title: string): boolean {
  return typeof title === "string" && title.startsWith(DEBUG_TITLE_PREFIX);
}

/**
 * Title to show in the UI. When showDebugLabels is false, strips the [DEBUG]
 * prefix so normal users never see it. When true, returns the title as-is.
 */
export function getDisplayTitle(
  title: string,
  showDebugLabels: boolean
): string {
  if (typeof title !== "string") return "";
  if (showDebugLabels) return title;
  if (isDebugTitle(title)) {
    return title.slice(DEBUG_TITLE_PREFIX.length).replace(/^\s+/, "") || title;
  }
  return title;
}
