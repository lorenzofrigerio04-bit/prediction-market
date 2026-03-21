/**
 * Economy category templates - GDP, CPI, interest rates
 * Resolution: BLS, Fed, Eurostat
 */

import { EdgeCasePolicyRef } from '../event-gen-v2/edge-case-policy';
import type { CandidateEventTemplate, TemplateContext } from './types';
import type { TrendObject } from '../trend-detection/types';

const EUROSTAT = 'https://ec.europa.eu/eurostat';
const BCE = 'https://www.ecb.europa.eu/';

function computeDeadline(trend: TrendObject, now: Date): Date {
  const d = new Date(now);
  if (trend.time_sensitivity === 'high') d.setDate(d.getDate() + 7);
  else if (trend.time_sensitivity === 'medium') d.setDate(d.getDate() + 30);
  else d.setDate(d.getDate() + 90);
  return d;
}

/** Extract percentage from topic (e.g. "CPI 2.5%" -> 2.5) */
function extractPercentFromTopic(topic: string): number | null {
  const m = topic.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? parseFloat(m[1]) : null;
}

function extractEntity(trend: TrendObject): string | null {
  if (trend.entities.length >= 1) return trend.entities[0];
  const words = trend.topic.split(/\s+/).filter((w) => w.length > 2);
  return words[0] ?? null;
}

export const economyCPI: CandidateEventTemplate = {
  id: 'economy-cpi',
  category: 'Economia',
  metric_condition: 'cpi <= threshold',
  threshold_type: 'number',
  resolution_source_authority: EUROSTAT,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: (trend) =>
    extractPercentFromTopic(trend.topic) ?? extractPercentFromTopic(trend.entities.join(' ')),
  computeDeadline,
  question: (ctx) =>
    `L'indice CPI sarà <= ${ctx.threshold}% entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `CPI <= ${ctx.threshold}% secondo Eurostat/BLS entro la deadline.`,
    no: `CPI > ${ctx.threshold}% alla deadline.`,
  }),
};

export const economyInterestRate: CandidateEventTemplate = {
  id: 'economy-interest-rate',
  category: 'Economia',
  metric_condition: 'interest_rate >= threshold',
  threshold_type: 'number',
  resolution_source_authority: BCE,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: (trend) =>
    extractPercentFromTopic(trend.topic) ?? extractPercentFromTopic(trend.entities.join(' ')),
  computeDeadline,
  question: (ctx) =>
    `Il tasso di interesse BCE/Fed sarà >= ${ctx.threshold}% entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `Tasso >= ${ctx.threshold}% secondo BCE/Fed entro la deadline.`,
    no: `Tasso < ${ctx.threshold}% alla deadline.`,
  }),
};

export const economyGDP: CandidateEventTemplate = {
  id: 'economy-gdp',
  category: 'Economia',
  metric_condition: 'gdp_growth >= threshold',
  threshold_type: 'number',
  resolution_source_authority: EUROSTAT,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: (trend) =>
    extractPercentFromTopic(trend.topic) ?? extractPercentFromTopic(trend.entities.join(' ')),
  computeDeadline,
  question: (ctx) =>
    `La crescita del PIL sarà >= ${ctx.threshold}% entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `Crescita PIL >= ${ctx.threshold}% secondo Eurostat entro la deadline.`,
    no: `Crescita PIL < ${ctx.threshold}% alla deadline.`,
  }),
};

export const economyTemplates: CandidateEventTemplate[] = [
  economyCPI,
  economyInterestRate,
  economyGDP,
];
