/**
 * Event Gen v2.0 - Pipeline observability: structured logging and hooks
 */

import type { EventGenV2Result } from './run-pipeline';

export type PipelineStage =
  | 'trend'
  | 'candidate'
  | 'title'
  | 'image_brief'
  | 'validator'
  | 'scoring'
  | 'publish'
  | 'image_generation';

export interface PipelineLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  runId: string;
  stage: PipelineStage;
  event?: string;
  payload?: Record<string, unknown>;
  durationMs?: number;
}

const PIPELINE_LOG_ENABLED = process.env.PIPELINE_STRUCTURED_LOG === 'true';

function formatLogEntry(entry: PipelineLogEntry): string {
  return JSON.stringify({
    ...entry,
    timestamp: entry.timestamp,
  });
}

function emitLog(entry: PipelineLogEntry): void {
  if (PIPELINE_LOG_ENABLED) {
    console.log(formatLogEntry(entry));
  }
}

/**
 * Creates a unique run ID for pipeline execution
 */
export function createRunId(): string {
  return crypto.randomUUID();
}

/**
 * Logs a pipeline stage event
 */
export function logPipelineStage(
  runId: string,
  stage: PipelineStage,
  options: {
    level?: PipelineLogEntry['level'];
    event?: string;
    payload?: Record<string, unknown>;
    durationMs?: number;
  } = {}
): void {
  const entry: PipelineLogEntry = {
    timestamp: new Date().toISOString(),
    level: options.level ?? 'info',
    runId,
    stage,
    event: options.event ?? 'stage_complete',
    payload: options.payload,
    durationMs: options.durationMs,
  };
  emitLog(entry);
}

/**
 * Hook: called when pipeline starts
 */
export function onPipelineStart(runId: string, dryRun: boolean): void {
  logPipelineStage(runId, 'trend', {
    event: 'stage_start',
    payload: { dryRun },
  });
}

/**
 * Hook: called when pipeline completes successfully
 */
export function onPipelineComplete(
  runId: string,
  result: EventGenV2Result,
  options: {
    source: 'storyline' | 'trend' | 'discovery';
    dryRun: boolean;
    eventIds?: string[];
    avgQualityScore?: number;
    durationMs?: number;
  }
): void {
  logPipelineStage(runId, 'publish', {
    event: 'stage_complete',
    payload: {
      ...result,
      source: options.source,
      dryRun: options.dryRun,
      eventIds: options.eventIds,
      avgQualityScore: options.avgQualityScore,
    },
    durationMs: options.durationMs,
  });
}

/**
 * Hook: called when pipeline errors
 */
export function onPipelineError(runId: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const entry: PipelineLogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    runId,
    stage: 'publish',
    event: 'error',
    payload: { error: message },
  };
  emitLog(entry);
}

/**
 * Hook: called when a stage completes (for intermediate logging)
 */
export function onStageComplete(
  runId: string,
  stage: PipelineStage,
  payload: Record<string, unknown>,
  durationMs?: number
): void {
  logPipelineStage(runId, stage, {
    event: 'stage_complete',
    payload,
    durationMs,
  });
}
