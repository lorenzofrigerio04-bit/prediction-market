/**
 * Candidate Event Generator - Core algorithm
 * Deterministic: same TrendObject + template → same CandidateEvent
 */

import type { TrendObject } from '../trend-detection/types';
import type { StructuredCandidateEvent } from '../candidate-event-templates/types';
import type { CandidateEventTemplate } from '../candidate-event-templates/types';
import {
  getTemplateCategory,
  getTemplatesForCategory,
} from '../candidate-event-templates/catalog';
import { generatePsychologicalTitle } from '../psychological-title-engine';

const MAX_CANDIDATES_PER_TREND = 3;

/** Check if string is a valid URL */
function isValidUrl(s: string | undefined): boolean {
  if (!s || typeof s !== 'string') return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Extract resolution source URLs from source_signals */
export function extractResolutionSources(
  trend: TrendObject,
  fallbackAuthority: string
): string[] {
  const urls: string[] = [];
  for (const sig of trend.source_signals) {
    if (isValidUrl(sig.signalId)) {
      urls.push(sig.signalId!);
    }
    const raw = sig.rawData as Record<string, unknown> | undefined;
    if (raw?.url && isValidUrl(String(raw.url))) {
      urls.push(String(raw.url));
    }
  }
  if (urls.length > 0) return urls;
  if (isValidUrl(fallbackAuthority)) return [fallbackAuthority];
  return [];
}

/** Extract subject entity from trend */
function extractSubjectEntity(trend: TrendObject): string {
  if (trend.entities.length >= 1) return trend.entities[0];
  const words = trend.topic.split(/\s+/).filter((w) => w.length > 2);
  return words[0] ?? 'entity';
}

/** Rejection reasons */
export type RejectionReason =
  | 'MISSING_MEASURABLE_CONDITION'
  | 'MISSING_RESOLUTION_SOURCE'
  | 'MISSING_DEADLINE'
  | 'DEADLINE_IN_PAST'
  | 'INVALID_THRESHOLD';

export interface GenerateResult {
  candidates: StructuredCandidateEvent[];
  rejected: Array<{ trend: TrendObject; templateId: string; reason: RejectionReason }>;
  rejectionCounts: Record<RejectionReason, number>;
}

/**
 * Generate CandidateEvents from TrendObjects.
 * Deterministic and verifiable.
 */
export function generateCandidateEvents(
  trends: TrendObject[],
  now: Date = new Date()
): GenerateResult {
  const candidates: StructuredCandidateEvent[] = [];
  const rejected: GenerateResult['rejected'] = [];
  const rejectionCounts: Record<RejectionReason, number> = {
    MISSING_MEASURABLE_CONDITION: 0,
    MISSING_RESOLUTION_SOURCE: 0,
    MISSING_DEADLINE: 0,
    DEADLINE_IN_PAST: 0,
    INVALID_THRESHOLD: 0,
  };

  for (const trend of trends) {
    const templateCategory = getTemplateCategory(trend.category);
    const templates = getTemplatesForCategory(templateCategory);
    let added = 0;

    for (const template of templates) {
      if (added >= MAX_CANDIDATES_PER_TREND) break;

      const threshold = template.extractThreshold(trend);
      if (threshold === null || threshold === undefined) {
        rejected.push({ trend, templateId: template.id, reason: 'INVALID_THRESHOLD' });
        rejectionCounts.INVALID_THRESHOLD++;
        continue;
      }

      const metricCondition = template.metric_condition;
      if (!metricCondition || metricCondition.trim().length === 0) {
        rejected.push({ trend, templateId: template.id, reason: 'MISSING_MEASURABLE_CONDITION' });
        rejectionCounts.MISSING_MEASURABLE_CONDITION++;
        continue;
      }

      const resolutionSources = extractResolutionSources(
        trend,
        template.resolution_source_authority
      );
      if (resolutionSources.length === 0) {
        rejected.push({ trend, templateId: template.id, reason: 'MISSING_RESOLUTION_SOURCE' });
        rejectionCounts.MISSING_RESOLUTION_SOURCE++;
        continue;
      }

      const deadline = template.computeDeadline(trend, now);
      if (!deadline || !(deadline instanceof Date) || isNaN(deadline.getTime())) {
        rejected.push({ trend, templateId: template.id, reason: 'MISSING_DEADLINE' });
        rejectionCounts.MISSING_DEADLINE++;
        continue;
      }
      if (deadline <= now) {
        rejected.push({ trend, templateId: template.id, reason: 'DEADLINE_IN_PAST' });
        rejectionCounts.DEADLINE_IN_PAST++;
        continue;
      }

      const subjectEntity = extractSubjectEntity(trend);
      const ctx = {
        subject_entity: subjectEntity,
        threshold,
        deadline,
        topic: trend.topic,
        entities: trend.entities,
        trend,
      };

      const criteria = template.resolutionCriteria(ctx);
      const baseTitle = template.question(ctx);
      const candidate: StructuredCandidateEvent = {
        category: template.category,
        subject_entity: subjectEntity,
        metric_condition: metricCondition,
        threshold,
        deadline,
        resolution_sources: resolutionSources,
        edge_case_policy: template.edge_case_policy,
        title: baseTitle,
        resolutionCriteriaYes: criteria.yes,
        resolutionCriteriaNo: criteria.no,
        templateId: template.id,
        sourceTrendTopic: trend.topic,
      };

      if (process.env.PSYCHOLOGICAL_TITLE_ENGINE === 'true') {
        const optimized = generatePsychologicalTitle(candidate);
        if (optimized) candidate.title = optimized;
      }

      candidates.push(candidate);
      added++;
    }
  }

  return { candidates, rejected, rejectionCounts };
}
