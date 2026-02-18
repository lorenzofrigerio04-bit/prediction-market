/**
 * Configuration for Storyline Engine filters
 * Reads from environment variables with defaults
 */

function parseEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Invalid value for ${key}: "${value}", using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

export const STORYLINE_CONFIG = {
  MIN_SIGNALS: parseEnvInt("STORYLINE_MIN_SIGNALS", 3),
  MAX_AGE_HOURS: parseEnvInt("STORYLINE_MAX_AGE_HOURS", 72),
  MIN_MOMENTUM: parseEnvInt("STORYLINE_MIN_MOMENTUM", 15),
  MIN_NOVELTY: parseEnvInt("STORYLINE_MIN_NOVELTY", 20),
  DEBUG: process.env.STORYLINE_DEBUG === "true",
} as const;
