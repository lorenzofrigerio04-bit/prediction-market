/**
 * LMSR Parameter Initialization
 * 
 * Defines b parameter strategy by category and hype multiplier.
 * 
 * b parameter values by category:
 * - Sport: 100
 * - Politica: 150
 * - Economia: 200
 * - Tecnologia: 120
 * - Cultura: 80
 * - Scienza: 130
 * 
 * Hype multipliers:
 * - High: 1.5
 * - Medium: 1.0
 * - Low: 0.7
 */

export type Category =
  | "Sport"
  | "Politica"
  | "Economia"
  | "Tecnologia"
  | "Cultura"
  | "Scienza"
  | "Intrattenimento";

export type HypeLevel = "High" | "Medium" | "Low";

/**
 * Base b parameter values by category
 */
const BASE_B_PARAMETERS: Record<Category, number> = {
  Sport: 100,
  Politica: 150,
  Economia: 200,
  Tecnologia: 120,
  Cultura: 80,
  Scienza: 130,
  Intrattenimento: 80,
};

/**
 * Hype multipliers
 */
const HYPE_MULTIPLIERS: Record<HypeLevel, number> = {
  High: 1.5,
  Medium: 1.0,
  Low: 0.7,
};

/**
 * Get the b parameter for a given category and hype score
 * 
 * @param category - Event category
 * @param hypeScore - Hype level (High, Medium, Low)
 * @returns The b parameter value
 */
export function getBParameter(
  category: Category,
  hypeScore: HypeLevel
): number {
  const baseB = BASE_B_PARAMETERS[category];
  if (!baseB) {
    throw new Error(`Unknown category: ${category}`);
  }

  const multiplier = HYPE_MULTIPLIERS[hypeScore];
  if (!multiplier) {
    throw new Error(`Unknown hype level: ${hypeScore}`);
  }

  const b = baseB * multiplier;
  
  // Ensure b is positive and reasonable
  if (b <= 0) {
    throw new Error(`Invalid b parameter: ${b}. Must be positive.`);
  }

  return b;
}

/**
 * Get initial quantities for YES and NO shares
 * 
 * Since p_init is always 0.5 (shrink to 0.5), we start with q_yes = q_no = 0
 * This ensures the initial price is 0.5 for both outcomes.
 * 
 * @returns Object with qYes and qNo both set to 0
 */
export function getInitialQuantities(): { qYes: number; qNo: number } {
  return {
    qYes: 0,
    qNo: 0,
  };
}
