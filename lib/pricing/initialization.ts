/**
 * LMSR Parameter Initialization
 *
 * b = liquidità: più alto = meno slippage, prezzo medio acquisto/vendita vicino al prezzo mostrato.
 * Con LIQUIDITY_MULTIPLIER alto, il prezzo è determinato dall'interesse collettivo (chi compra SÌ/NO),
 * non dalla dimensione del singolo ordine.
 *
 * Base b per categoria × LIQUIDITY_MULTIPLIER (es. 25):
 * - Sport: 12500, Politica: 18750, Economia: 25000, Tecnologia: 15000, ...
 *
 * Hype multipliers: High 1.5, Medium 1.0, Low 0.7
 */

export type Category =
  | "Calcio"
  | "Tennis"
  | "Pallacanestro"
  | "Pallavolo"
  | "Formula 1"
  | "MotoGP";

export type HypeLevel = "High" | "Medium" | "Low";

/** Moltiplicatore di liquidità: prezzo medio ≈ prezzo mostrato, slippage ridotto */
const LIQUIDITY_MULTIPLIER = 25;

/**
 * Base b parameter values by category (prima del moltiplicatore liquidità)
 */
const BASE_B_PARAMETERS: Record<Category, number> = {
  Calcio: 500,
  Tennis: 500,
  Pallacanestro: 500,
  Pallavolo: 500,
  "Formula 1": 500,
  MotoGP: 500,
};

/**
 * Hype multipliers
 */
const HYPE_MULTIPLIERS: Record<HypeLevel, number> = {
  High: 1.5,
  Medium: 1.0,
  Low: 0.7,
};

/** Valore b di fallback quando categoria sconosciuta (alta liquidità) */
export const DEFAULT_B = 500 * LIQUIDITY_MULTIPLIER; // 12500

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

  const b = baseB * multiplier * LIQUIDITY_MULTIPLIER;

  // Ensure b is positive and reasonable
  if (b <= 0) {
    throw new Error(`Invalid b parameter: ${b}. Must be positive.`);
  }

  return b;
}

/**
 * Restituisce b per una categoria (string); se categoria non valida, restituisce DEFAULT_B.
 */
export function getBParameterOrDefault(category: string): number {
  const cat = category as Category;
  if (BASE_B_PARAMETERS[cat] != null) {
    return getBParameter(cat, "Medium");
  }
  return DEFAULT_B;
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
