/**
 * Closure rules for closesAt calculation.
 * Extracted from event-generation for shared use (admin, seed, scripts).
 */

import { SPORT_CATEGORIES } from "@/lib/sport-categories";

export type AllowedCategory = (typeof SPORT_CATEGORIES)[number];

export type ClosureRulesConfig = {
  minHoursFromNow: number;
  hoursBeforeEvent: number;
  defaultDaysByCategory: Record<AllowedCategory, number>;
  shortTermDays: number;
  mediumTermDays: number;
  maxHorizonDays: number;
};

export const DEFAULT_CLOSURE_RULES: ClosureRulesConfig = {
  minHoursFromNow: 24,
  hoursBeforeEvent: 1,
  shortTermDays: 7,
  mediumTermDays: 21,
  maxHorizonDays: 730,
  defaultDaysByCategory: {
    Calcio: 7,
    Tennis: 7,
    Pallacanestro: 7,
    Pallavolo: 7,
    "Formula 1": 7,
    MotoGP: 7,
  },
};

export function getClosureRules(overrides?: Partial<ClosureRulesConfig>): ClosureRulesConfig {
  const minHours = parseInt(process.env.CLOSURE_MIN_HOURS ?? "", 10) || DEFAULT_CLOSURE_RULES.minHoursFromNow;
  const hoursBefore =
    parseInt(process.env.CLOSURE_HOURS_BEFORE_EVENT ?? "", 10) ||
    DEFAULT_CLOSURE_RULES.hoursBeforeEvent;
  const maxHorizon = parseInt(process.env.CLOSURE_MAX_HORIZON_DAYS ?? "", 10) || DEFAULT_CLOSURE_RULES.maxHorizonDays;
  return {
    ...DEFAULT_CLOSURE_RULES,
    minHoursFromNow: minHours,
    hoursBeforeEvent: hoursBefore,
    maxHorizonDays: maxHorizon,
    ...overrides,
  };
}
