/**
 * Template catalog - registry of templates per category
 * Maps trend categories to applicable templates
 */

import type { CandidateEventTemplate, TemplateCategory } from './types';
import { cryptoTemplates } from './crypto';
import { sportsTemplates } from './sports';
import { politicsTemplates } from './politics';
import { techTemplates } from './tech';
import { economyTemplates } from './economy';
import { cultureTemplates } from './culture';

const ALL_TEMPLATES: CandidateEventTemplate[] = [
  ...cryptoTemplates,
  ...sportsTemplates,
  ...politicsTemplates,
  ...techTemplates,
  ...economyTemplates,
  ...cultureTemplates,
];

/** Map trend category (from signals) to template category */
const CATEGORY_MAP: Record<string, TemplateCategory> = {
  Crypto: 'Crypto',
  Sport: 'Sport',
  Sports: 'Sport',
  Politica: 'Politica',
  Politics: 'Politica',
  Tecnologia: 'Tecnologia',
  Tech: 'Tecnologia',
  Economia: 'Economia',
  Economy: 'Economia',
  Cultura: 'Cultura',
  Culture: 'Cultura',
  Intrattenimento: 'Intrattenimento',
  Scienza: 'Scienza',
  Altro: 'Intrattenimento',
};

/** Get template category from trend category */
export function getTemplateCategory(trendCategory: string): TemplateCategory {
  const normalized = trendCategory.trim();
  return CATEGORY_MAP[normalized] ?? 'Intrattenimento';
}

/** Get templates for a category (max 3 per trend) */
export function getTemplatesForCategory(category: TemplateCategory): CandidateEventTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.category === category).slice(0, 3);
}

/** Get template by id */
export function getTemplateById(id: string): CandidateEventTemplate | null {
  return ALL_TEMPLATES.find((t) => t.id === id) ?? null;
}

/** Get all templates */
export function getAllTemplates(): CandidateEventTemplate[] {
  return [...ALL_TEMPLATES];
}
