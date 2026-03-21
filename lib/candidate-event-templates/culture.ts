/**
 * Culture category templates - award winners, box office revenue
 * Resolution: Academy, BoxOfficeMojo
 */

import { EdgeCasePolicyRef } from '../event-gen-v2/edge-case-policy';
import type { CandidateEventTemplate, TemplateContext } from './types';
import type { TrendObject } from '../trend-detection/types';

const ACADEMY = 'https://www.oscars.org/';
const BOXOFFICEMOJO = 'https://www.boxofficemojo.com/';

function computeDeadline(trend: TrendObject, now: Date): Date {
  const d = new Date(now);
  if (trend.time_sensitivity === 'high') d.setDate(d.getDate() + 7);
  else if (trend.time_sensitivity === 'medium') d.setDate(d.getDate() + 30);
  else d.setDate(d.getDate() + 90);
  return d;
}

function extractEntity(trend: TrendObject): string | null {
  if (trend.entities.length >= 1) return trend.entities[0];
  const words = trend.topic.split(/\s+/).filter((w) => w.length > 2);
  return words[0] ?? null;
}

/** Extract revenue number from topic (e.g. "100 million" -> 100000000) */
function extractRevenueFromTopic(topic: string): number | null {
  const text = topic.toLowerCase().replace(/,/g, '');
  const mMatch = text.match(/(\d+(?:\.\d+)?)\s*m(?:illion)?/i);
  if (mMatch) return parseFloat(mMatch[1]) * 1_000_000;
  const bMatch = text.match(/(\d+(?:\.\d+)?)\s*b(?:illion)?/i);
  if (bMatch) return parseFloat(bMatch[1]) * 1_000_000_000;
  const numMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1]);
  return null;
}

export const cultureAwardWinner: CandidateEventTemplate = {
  id: 'culture-award-winner',
  category: 'Cultura',
  metric_condition: 'award_winner = entity',
  threshold_type: 'string',
  resolution_source_authority: ACADEMY,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: extractEntity,
  computeDeadline,
  question: (ctx) =>
    `${ctx.subject_entity} vincerà il premio Oscar nella categoria indicata entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `${ctx.subject_entity} risulta vincitore secondo Academy of Motion Picture Arts and Sciences entro la deadline.`,
    no: `${ctx.subject_entity} non risulta vincitore alla deadline.`,
  }),
};

export const cultureBoxOfficeRevenue: CandidateEventTemplate = {
  id: 'culture-box-office-revenue',
  category: 'Cultura',
  metric_condition: 'box_office >= threshold',
  threshold_type: 'number',
  resolution_source_authority: BOXOFFICEMOJO,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: (trend) =>
    extractRevenueFromTopic(trend.topic) ?? extractRevenueFromTopic(trend.entities.join(' ')),
  computeDeadline,
  question: (ctx) =>
    `Il film ${ctx.subject_entity} raggiungerà incassi >= ${ctx.threshold} USD entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `Incassi di ${ctx.subject_entity} >= ${ctx.threshold} USD su BoxOfficeMojo entro la deadline.`,
    no: `Incassi < ${ctx.threshold} USD alla deadline.`,
  }),
};

export const cultureTemplates: CandidateEventTemplate[] = [
  cultureAwardWinner,
  cultureBoxOfficeRevenue,
];
