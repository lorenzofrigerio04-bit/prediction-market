/**
 * Sports category templates - match winner, tournament winner
 * Resolution: Official league/federation
 */

import { EdgeCasePolicyRef } from '../event-gen-v2/edge-case-policy';
import type { CandidateEventTemplate, TemplateContext } from './types';
import type { TrendObject } from '../trend-detection/types';

const DEFAULT_AUTHORITY = 'https://www.uefa.com/';

function computeDeadline(trend: TrendObject, now: Date): Date {
  const d = new Date(now);
  if (trend.time_sensitivity === 'high') d.setDate(d.getDate() + 1);
  else if (trend.time_sensitivity === 'medium') d.setDate(d.getDate() + 7);
  else d.setDate(d.getDate() + 30);
  return d;
}

function extractEntities(trend: TrendObject): string[] {
  if (trend.entities.length >= 2) return trend.entities.slice(0, 2);
  const words = trend.topic.split(/\s+/).filter((w) => w.length > 2);
  return words.slice(0, 2);
}

export const sportsMatchWinner: CandidateEventTemplate = {
  id: 'sports-match-winner',
  category: 'Sport',
  metric_condition: 'winner = entity',
  threshold_type: 'string',
  resolution_source_authority: DEFAULT_AUTHORITY,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: (trend) => {
    const e = extractEntities(trend);
    return e.length >= 1 ? e[0] : null;
  },
  computeDeadline,
  question: (ctx) =>
    `La squadra ${ctx.subject_entity} vincerà la partita entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `${ctx.subject_entity} risulta vincitrice secondo la fonte ufficiale (league/federation) entro la deadline.`,
    no: `${ctx.subject_entity} non risulta vincitrice alla deadline.`,
  }),
};

export const sportsTournamentWinner: CandidateEventTemplate = {
  id: 'sports-tournament-winner',
  category: 'Sport',
  metric_condition: 'tournament_winner = entity',
  threshold_type: 'string',
  resolution_source_authority: DEFAULT_AUTHORITY,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: (trend) => {
    const e = extractEntities(trend);
    return e.length >= 1 ? e[0] : null;
  },
  computeDeadline,
  question: (ctx) =>
    `La squadra/atleta ${ctx.subject_entity} vincerà il torneo entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `${ctx.subject_entity} risulta vincitore del torneo secondo fonte ufficiale entro la deadline.`,
    no: `${ctx.subject_entity} non risulta vincitore del torneo alla deadline.`,
  }),
};

export const sportsTemplates: CandidateEventTemplate[] = [
  sportsMatchWinner,
  sportsTournamentWinner,
];
