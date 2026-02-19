/**
 * Event Template Types
 * BLOCCO 4: Template Engine
 */

import type { TemplateContext } from './context';

export type Category =
  | "Sport"
  | "Politica"
  | "Economia"
  | "Tecnologia"
  | "Cultura"
  | "Scienza"
  | "Intrattenimento";

export type EventTemplate = {
  id: string;
  category: Category;
  horizonDaysMin: number;
  horizonDaysMax: number;
  requiredAuthority: "OFFICIAL" | "REPUTABLE";
  question: (ctx: TemplateContext) => string;
  resolutionCriteria: (ctx: TemplateContext) => { yes: string; no: string };
  bannedPhrases: string[];
};
