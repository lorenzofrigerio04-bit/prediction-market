/**
 * Time coherence: category-specific buffers and validation.
 * Rule: marketCloseTime <= realWorldEventTime - resolutionBufferHours
 */

export type Category =
  | "Sport"
  | "Politica"
  | "Economia"
  | "Tecnologia"
  | "Cultura"
  | "Scienza"
  | "Intrattenimento";

/** Buffer hours by category (hours before realWorldEventTime when market closes). */
export const RESOLUTION_BUFFER_HOURS: Record<Category, number> = {
  Sport: 1,
  Politica: 2,
  Economia: 24,
  Tecnologia: 12,
  Cultura: 6,
  Scienza: 12,
  Intrattenimento: 6,
};

export type TimeCoherenceResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Validates time coherence: closesAt <= realWorldEventTime - bufferHours.
 * If realWorldEventTime is missing, returns ok (no check).
 */
export function validateTimeCoherence(
  closesAt: Date,
  realWorldEventTime: Date | null | undefined,
  category: Category
): TimeCoherenceResult {
  if (!realWorldEventTime || Number.isNaN(realWorldEventTime.getTime())) {
    return { ok: true };
  }
  const bufferHours = RESOLUTION_BUFFER_HOURS[category] ?? 2;
  const latestClose = new Date(
    realWorldEventTime.getTime() - bufferHours * 60 * 60 * 1000
  );
  if (closesAt.getTime() > latestClose.getTime()) {
    return {
      ok: false,
      reason: `closesAt must be at least ${bufferHours}h before realWorldEventTime (category: ${category})`,
    };
  }
  return { ok: true };
}

/** Get buffer hours for a category. */
export function getBufferHoursForCategory(category: string): number {
  return RESOLUTION_BUFFER_HOURS[category as Category] ?? 2;
}
