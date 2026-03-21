/**
 * Tech category templates - product release, earnings report
 * Resolution: Company IR, SEC
 */

import { EdgeCasePolicyRef } from '../event-gen-v2/edge-case-policy';
import type { CandidateEventTemplate, TemplateContext } from './types';
import type { TrendObject } from '../trend-detection/types';

const SEC_EDGAR = 'https://www.sec.gov/edgar/';

function computeDeadline(trend: TrendObject, now: Date): Date {
  const d = new Date(now);
  if (trend.time_sensitivity === 'high') d.setDate(d.getDate() + 1);
  else if (trend.time_sensitivity === 'medium') d.setDate(d.getDate() + 14);
  else d.setDate(d.getDate() + 90);
  return d;
}

function extractEntity(trend: TrendObject): string | null {
  const known = ['Apple', 'Google', 'Meta', 'Microsoft', 'Amazon', 'Tesla', 'Nvidia', 'AMD'];
  for (const e of trend.entities) {
    if (known.some((k) => k.toLowerCase().includes(e.toLowerCase()))) return e;
  }
  const words = trend.topic.split(/\s+/).filter((w) => w.length > 2);
  return words[0] ?? null;
}

export const techProductRelease: CandidateEventTemplate = {
  id: 'tech-product-release',
  category: 'Tecnologia',
  metric_condition: 'product_released_by_deadline = true',
  threshold_type: 'date',
  resolution_source_authority: SEC_EDGAR,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: extractEntity,
  computeDeadline,
  question: (ctx) =>
    `${ctx.subject_entity} rilascerà il prodotto annunciato entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `Prodotto di ${ctx.subject_entity} rilasciato ufficialmente entro la deadline.`,
    no: `Prodotto di ${ctx.subject_entity} non rilasciato alla deadline.`,
  }),
};

export const techEarningsReport: CandidateEventTemplate = {
  id: 'tech-earnings-report',
  category: 'Tecnologia',
  metric_condition: 'earnings_above_threshold = true',
  threshold_type: 'string',
  resolution_source_authority: SEC_EDGAR,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: extractEntity,
  computeDeadline,
  question: (ctx) =>
    `${ctx.subject_entity} pubblicherà report earnings con risultati positivi entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `Report earnings di ${ctx.subject_entity} pubblicato con risultati positivi (SEC/IR) entro la deadline.`,
    no: `Report non pubblicato o risultati non positivi alla deadline.`,
  }),
};

export const techTemplates: CandidateEventTemplate[] = [
  techProductRelease,
  techEarningsReport,
];
