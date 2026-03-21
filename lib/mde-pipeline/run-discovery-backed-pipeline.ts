/**
 * Discovery-backed pipeline orchestration: EventLead → SourceObservation → canonical MDE pipeline.
 *
 * This is the discovery entry into the canonical pipeline. It does NOT bypass or duplicate
 * pipeline semantics; it converts READY EventLeads to SourceObservation via the foundation
 * adapter, then calls runMdePipelineFromObservation. The ingestion path remains
 * articleToSourceObservation + runMdePipelineFromObservation.
 *
 * Not wired in this step: API route, scheduler/cron, persistence.
 */

import type { EventLeadId } from "@market-design-engine/foundation-layer";
import {
  eventLeadToSourceObservationAdapter,
  type EventLead,
} from "@market-design-engine/foundation-layer";
import {
  runMdePipelineFromObservation,
  type RunMdePipelineParams,
  type RunMdePipelineResult,
} from "./run-mde-pipeline";

/** Per-lead result: traceability, conversion outcome, optional pipeline result, rejection point. */
export type DiscoveryBackedPipelineLeadResult = Readonly<{
  leadId: EventLeadId;
  conversionOutcome: "converted" | "skipped" | "rejected";
  conversionReasonCode?: string;
  observationId?: string;
  pipelineResult?: RunMdePipelineResult;
  publishableReadiness: boolean;
  rejectionPoint?: string;
  clusterId?: string;
}>;

/** Batch result: one entry per input lead. */
export type DiscoveryBackedPipelineResult = Readonly<{
  results: readonly DiscoveryBackedPipelineLeadResult[];
}>;

/** Optional pipeline params passed through when running from observation (e.g. deadlines). */
export type DiscoveryBackedPipelineParams = Omit<
  RunMdePipelineParams,
  "observation"
>;

/** Optional pipeline runner (for tests: inject mock that throws to assert rejectionPoint). */
export type PipelineRunner = (
  params: RunMdePipelineParams
) => RunMdePipelineResult;

function buildLeadResult(
  leadId: EventLeadId,
  conversionOutcome: "converted" | "skipped" | "rejected",
  options: {
    conversionReasonCode?: string;
    observationId?: string;
    pipelineResult?: RunMdePipelineResult;
    clusterId?: string;
    rejectionPoint?: string;
  }
): DiscoveryBackedPipelineLeadResult {
  const {
    conversionReasonCode,
    observationId,
    pipelineResult,
    clusterId,
    rejectionPoint: rejectionPointOpt,
  } = options;
  const publishableReadiness = Boolean(
    pipelineResult?.publishableCandidate
  );
  let rejectionPoint: string | undefined = rejectionPointOpt;
  if (rejectionPoint === undefined && conversionOutcome === "skipped") {
    rejectionPoint = "conversion_skipped";
  } else if (rejectionPoint === undefined && conversionOutcome === "rejected") {
    rejectionPoint = "conversion_rejected";
  }
  return {
    leadId,
    conversionOutcome,
    conversionReasonCode,
    observationId,
    pipelineResult,
    publishableReadiness,
    rejectionPoint,
    clusterId,
  };
}

/**
 * Run the discovery-backed pipeline for a single EventLead: convert to SourceObservation
 * (when READY and not LOW confidence), then run the canonical MDE pipeline. Returns a
 * structured result with traceability and optional pipeline output.
 *
 * @param pipelineRunner - Optional; defaults to runMdePipelineFromObservation. Inject in tests to simulate pipeline failure.
 */
export function runDiscoveryBackedPipeline(
  lead: EventLead,
  params?: DiscoveryBackedPipelineParams,
  pipelineRunner?: PipelineRunner
): DiscoveryBackedPipelineLeadResult {
  const runPipeline = pipelineRunner ?? runMdePipelineFromObservation;
  const conversion = eventLeadToSourceObservationAdapter.convert(lead);

  if (conversion.outcome !== "converted" || !conversion.observation) {
    return buildLeadResult(conversion.leadId, conversion.outcome, {
      conversionReasonCode: conversion.reasonCode,
      clusterId: conversion.clusterId ? String(conversion.clusterId) : undefined,
    });
  }

  const observation = conversion.observation;
  const observationId = observation.id ? String(observation.id) : undefined;

  try {
    const pipelineResult = runPipeline({
      ...params,
      observation,
    });
    return buildLeadResult(conversion.leadId, "converted", {
      observationId,
      pipelineResult,
      clusterId: conversion.clusterId ? String(conversion.clusterId) : undefined,
    });
  } catch (err) {
    const reason =
      err instanceof Error ? err.message : String(err);
    return buildLeadResult(conversion.leadId, "converted", {
      observationId,
      conversionReasonCode: reason,
      clusterId: conversion.clusterId ? String(conversion.clusterId) : undefined,
      rejectionPoint: `pipeline_failed: ${reason}`,
    });
  }
}

/**
 * Run the discovery-backed pipeline for multiple EventLeads. Returns one result per lead
 * in the same order.
 */
export function runDiscoveryBackedPipelineFromLeads(
  leads: readonly EventLead[],
  params?: DiscoveryBackedPipelineParams,
  pipelineRunner?: PipelineRunner
): DiscoveryBackedPipelineResult {
  const results = leads.map((lead, index) => {
    const result = runDiscoveryBackedPipeline(lead, params, pipelineRunner);
    // Diagnostic: log first 2-3 conversion outcomes at conversion site (PIPELINE_DEBUG)
    if (index < 3 && process.env.PIPELINE_DEBUG === "true") {
      const conversionOutcome = result.conversionOutcome;
      const conversionReasonCode = result.conversionReasonCode;
      console.log("[run-discovery-backed-pipeline] lead", index + 1, {
        conversionOutcome,
        conversionReasonCode,
      });
    }
    return result;
  });
  return { results };
}
