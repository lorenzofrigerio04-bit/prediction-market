/**
 * Candidate Event Templates - Type definitions
 * Structured, metric-based templates for deterministic event generation.
 */

import type { EdgeCasePolicyRef } from '../event-gen-v2/edge-case-policy';
import type { TimeSensitivity } from '../trend-detection/types';
import type { TrendObject } from '../trend-detection/types';

/** Template category - maps to existing + Crypto */
export type TemplateCategory =
  | 'Crypto'
  | 'Sport'
  | 'Politica'
  | 'Tecnologia'
  | 'Economia'
  | 'Cultura'
  | 'Intrattenimento'
  | 'Scienza';

/** Structured CandidateEvent - metric-based, verifiable */
export interface StructuredCandidateEvent {
  category: string;
  subject_entity: string;
  metric_condition: string;
  threshold: string | number;
  deadline: Date;
  resolution_sources: string[];
  edge_case_policy: EdgeCasePolicyRef;
  /** Derived for Event model */
  title: string;
  resolutionCriteriaYes: string;
  resolutionCriteriaNo: string;
  templateId: string;
  /** Source trend topic for pipeline (scoring, dedup) */
  sourceTrendTopic?: string;
}

/** Context for template question/criteria generation */
export interface TemplateContext {
  subject_entity: string;
  threshold: string | number;
  deadline: Date;
  topic: string;
  entities: string[];
  trend: TrendObject;
}

/** Template definition for a category */
export interface CandidateEventTemplate {
  id: string;
  category: TemplateCategory;
  metric_condition: string;
  threshold_type: 'number' | 'string' | 'date';
  resolution_source_authority: string;
  edge_case_policy: EdgeCasePolicyRef;
  question: (ctx: TemplateContext) => string;
  resolutionCriteria: (ctx: TemplateContext) => { yes: string; no: string };
  /** Extract threshold from trend (topic, entities). Returns null if not applicable */
  extractThreshold: (trend: TrendObject) => string | number | null;
  /** Compute deadline from trend (deterministic) */
  computeDeadline: (trend: TrendObject, now: Date) => Date;
}
