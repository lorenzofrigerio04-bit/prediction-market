import type { UserStats } from "./user-stats";

export interface ConstraintPayload {
  category?: string;
  categories?: string[];
  probability?: number;
  sameCategory?: boolean;
  underusedCategory?: boolean;
  minProbability?: number;
  minResolved?: number;
  withLogin?: boolean;
  requiresPnl?: boolean;
  minPredictionsPerCategory?: number;
}

/**
 * Validate mission template constraints against event payload and user stats.
 * Returns true if the action counts toward this mission.
 */
export function validateConstraints(
  constraintsJson: string | null,
  payload: Record<string, unknown>,
  userStats: UserStats
): boolean {
  if (!constraintsJson) return true;
  let constraints: ConstraintPayload;
  try {
    constraints = JSON.parse(constraintsJson) as ConstraintPayload;
  } catch {
    return true;
  }

  if (constraints.minProbability != null) {
    const prob = payload.probability as number | undefined;
    if (prob == null || prob < constraints.minProbability) return false;
  }

  if (constraints.category != null && payload.category !== constraints.category)
    return false;

  if (constraints.categories?.length && payload.category) {
    if (!constraints.categories.includes(payload.category as string))
      return false;
  }

  if (constraints.underusedCategory === true) {
    const category = payload.category as string | undefined;
    if (!category || !userStats.underusedCategories.includes(category))
      return false;
  }

  if (constraints.sameCategory === true) {
    // Same category: we'd need to know "assigned category" from mission metadata at assignment time
    // For now we allow - assignment service can set metadata.assignedCategory and we check here
    const assigned = payload.assignedCategory as string | undefined;
    if (assigned && payload.category !== assigned) return false;
  }

  if (constraints.minResolved != null) {
    if (userStats.resolvedPredictions < constraints.minResolved) return false;
  }

  if (constraints.requiresPnl === true) {
    // ROI mission: we validate in the progress update (we have weekly P&L)
    // No filter here
  }

  return true;
}
