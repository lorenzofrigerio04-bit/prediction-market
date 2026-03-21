/**
 * Politics category templates - election winner, nomination confirmation
 * Resolution: Official gov/electoral body
 */

import { EdgeCasePolicyRef } from '../event-gen-v2/edge-case-policy';
import type { CandidateEventTemplate, TemplateContext } from './types';
import type { TrendObject } from '../trend-detection/types';

const DEFAULT_AUTHORITY = 'https://www.governo.it/';

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

export const politicsElectionWinner: CandidateEventTemplate = {
  id: 'politics-election-winner',
  category: 'Politica',
  metric_condition: 'election_winner = entity',
  threshold_type: 'string',
  resolution_source_authority: DEFAULT_AUTHORITY,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: extractEntity,
  computeDeadline,
  question: (ctx) =>
    `Il candidato/partito ${ctx.subject_entity} vincerà le elezioni entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `${ctx.subject_entity} risulta vincitore secondo l'ente elettorale ufficiale entro la deadline.`,
    no: `${ctx.subject_entity} non risulta vincitore alla deadline.`,
  }),
};

export const politicsNominationConfirmation: CandidateEventTemplate = {
  id: 'politics-nomination-confirmation',
  category: 'Politica',
  metric_condition: 'nomination_confirmed = true',
  threshold_type: 'string',
  resolution_source_authority: DEFAULT_AUTHORITY,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: extractEntity,
  computeDeadline,
  question: (ctx) =>
    `La nomina di ${ctx.subject_entity} sarà confermata entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `Nomina di ${ctx.subject_entity} confermata da fonte ufficiale entro la deadline.`,
    no: `Nomina di ${ctx.subject_entity} non confermata alla deadline.`,
  }),
};

export const politicsTemplates: CandidateEventTemplate[] = [
  politicsElectionWinner,
  politicsNominationConfirmation,
];
