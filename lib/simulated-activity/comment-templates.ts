/**
 * Legacy comment-template surface for the simulated-activity runner.
 *
 * The real, premium social-style English pool now lives in `social-comments.ts`.
 * This file re-exports a generic (category-agnostic) slice so the existing
 * runner keeps working and also produces English social comments. The reseed
 * script (`scripts/reseed-social-comments.ts`) uses the richer pickers directly.
 */

import { GENERIC_LINES, REPLY_PROBABILITY } from "./social-comments";

export interface CommentTemplate {
  text: string;
  /** Event category. Omitted here: every line is usable for any market. */
  category?: string;
  /** Kept for backwards-compat with older callers. */
  kind?: "yes" | "no" | "question" | "reply";
}

/** Generic English social lines, usable for any event category. */
export const COMMENT_TEMPLATES: CommentTemplate[] = GENERIC_LINES.map((text) => ({ text }));

export { REPLY_PROBABILITY };
