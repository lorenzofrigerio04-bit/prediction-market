/**
 * XP and level (1-5) for mission progression.
 * Level thresholds: 0, 500, 2000, 5000, 10000 XP.
 */

export const LEVEL_THRESHOLDS = [0, 500, 2000, 5000, 10000] as const; // XP required for level 1, 2, 3, 4, 5
export const MAX_LEVEL = 5;

export const LEVEL_NAMES: Record<number, string> = {
  1: "Iniziato",
  2: "Apprendista",
  3: "Stratega",
  4: "Veggente",
  5: "Oracolo",
};

/**
 * Compute current level (1-5) from total XP.
 */
export function computeLevelFromXP(xpTotal: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xpTotal >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

/**
 * XP required to reach the next level. Returns 0 if already max level.
 */
export function getXpToNextLevel(level: number, xpTotal: number): number {
  if (level >= MAX_LEVEL) return 0;
  const nextThreshold = LEVEL_THRESHOLDS[level]; // level is 1-based, LEVEL_THRESHOLDS[1] = 500 for level 2
  return Math.max(0, nextThreshold - xpTotal);
}

/**
 * XP required for a given level (cumulative).
 */
export function getXpRequiredForLevel(level: number): number {
  if (level < 1 || level > MAX_LEVEL) return 0;
  return LEVEL_THRESHOLDS[level - 1];
}
