/**
 * AI Event Generator - Zod schemas for AI output validation
 */

import { z } from 'zod';

const resolutionCriteriaSchema = z.object({
  yes: z.string().min(1, 'resolution_criteria.yes required'),
  no: z.string().min(1, 'resolution_criteria.no required'),
});

export const aiCandidateEventSchema = z.object({
  category: z.string().min(1, 'category required'),
  subject_entity: z.string().min(1, 'subject_entity required'),
  condition: z.string().min(1, 'condition required'),
  threshold: z.union([z.string(), z.number()]),
  deadline: z.string().min(1, 'deadline required'),
  resolution_source_primary: z.string().min(1, 'resolution_source_primary required'),
  resolution_source_secondary: z.string().optional(),
  resolution_criteria: resolutionCriteriaSchema,
  title: z.string().optional(),
  selection_reason: z.string().optional(),
});

export const aiEventGeneratorResponseSchema = z.object({
  candidates: z.array(aiCandidateEventSchema).min(1).max(3),
  best_index: z.number().int().min(0).max(2).optional(),
});

export type AICandidateEventParsed = z.infer<typeof aiCandidateEventSchema>;
export type AIEventGeneratorResponseParsed = z.infer<typeof aiEventGeneratorResponseSchema>;
