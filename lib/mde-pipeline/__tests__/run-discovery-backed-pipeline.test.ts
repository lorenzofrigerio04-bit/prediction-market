/**
 * Tests for discovery-backed pipeline orchestration: EventLead → SourceObservation → canonical MDE pipeline.
 * No live network; fixtures and mocks only.
 * Also guards module resolution: imports from @market-design-engine/foundation-layer (adapter, EventLead types).
 */

import { describe, expect, it } from "vitest";
import {
  createEventLead,
  createEventLeadId,
  createDiscoveryStoryClusterId,
  createEventLeadEvidenceSet,
  createEventLeadReason,
  eventLeadToSourceObservationAdapter,
  EventLeadStatus,
  EventLeadReadiness,
  EventLeadConfidence,
} from "@market-design-engine/foundation-layer";
import {
  runDiscoveryBackedPipeline,
  runDiscoveryBackedPipelineFromLeads,
  type PipelineRunner,
} from "../run-discovery-backed-pipeline";

const clusterId = createDiscoveryStoryClusterId("dsc_test001");

function makeLead(overrides: {
  id?: ReturnType<typeof createEventLeadId>;
  readiness?: EventLeadReadiness;
  confidence?: EventLeadConfidence;
  hypothesisSummary?: string;
  memberItemIds?: readonly string[];
} = {}) {
  const id = overrides.id ?? createEventLeadId("del_fixture1");
  const evidenceSet = createEventLeadEvidenceSet({
    clusterId,
    memberItemIds: overrides.memberItemIds ?? ["item1", "item2"],
    representativeHeadlineNullable: "Test headline",
  });
  return createEventLead({
    id,
    sourceClusterId: clusterId,
    status: EventLeadStatus.EXTRACTED,
    readiness: overrides.readiness ?? EventLeadReadiness.READY,
    confidence: overrides.confidence ?? EventLeadConfidence.HIGH,
    hypothesisSummary:
      overrides.hypothesisSummary ?? "Event hypothesis summary for testing.",
    evidenceSet,
    reasons: [
      createEventLeadReason({
        code: "test",
        label: "Test",
        impact: "positive",
      }),
    ],
  });
}

describe("foundation-layer module resolution", () => {
  it("eventLeadToSourceObservationAdapter is importable and has convert method", () => {
    expect(eventLeadToSourceObservationAdapter).toBeDefined();
    expect(typeof eventLeadToSourceObservationAdapter.convert).toBe("function");
  });
});

describe("runDiscoveryBackedPipeline", () => {
  it("success: READY + HIGH lead → converted → pipeline runs → publishableReadiness true, observationId and leadId set, no rejectionPoint", () => {
    const lead = makeLead({
      readiness: EventLeadReadiness.READY,
      confidence: EventLeadConfidence.HIGH,
      id: createEventLeadId("del_success1"),
    });
    const result = runDiscoveryBackedPipeline(lead);

    expect(result.leadId).toBe(lead.id);
    expect(result.conversionOutcome).toBe("converted");
    expect(result.publishableReadiness).toBe(true);
    expect(result.pipelineResult).toBeDefined();
    expect(result.pipelineResult?.publishableCandidate).toBeDefined();
    expect(result.observationId).toBe("obs_lead_success1");
    expect(result.rejectionPoint).toBeUndefined();
    expect(result.clusterId).toBeDefined();
  });

  it("not ready / skipped: NOT_READY or LOW confidence → no pipeline run → publishableReadiness false, rejectionPoint set", () => {
    const notReady = makeLead({
      readiness: EventLeadReadiness.NOT_READY,
      confidence: EventLeadConfidence.HIGH,
      id: createEventLeadId("del_skip01"),
    });
    const resultNotReady = runDiscoveryBackedPipeline(notReady);
    expect(resultNotReady.conversionOutcome).toBe("skipped");
    expect(resultNotReady.conversionReasonCode).toBe("not_ready");
    expect(resultNotReady.pipelineResult).toBeUndefined();
    expect(resultNotReady.publishableReadiness).toBe(false);
    expect(resultNotReady.rejectionPoint).toBe("conversion_skipped");

    const lowConf = makeLead({
      readiness: EventLeadReadiness.READY,
      confidence: EventLeadConfidence.LOW,
      id: createEventLeadId("del_skip02"),
    });
    const resultLow = runDiscoveryBackedPipeline(lowConf);
    expect(resultLow.conversionOutcome).toBe("skipped");
    expect(resultLow.conversionReasonCode).toBe("low_confidence");
    expect(resultLow.pipelineResult).toBeUndefined();
    expect(resultLow.publishableReadiness).toBe(false);
    expect(resultLow.rejectionPoint).toBe("conversion_skipped");
  });

  it("downstream failure: pipeline runner throws → rejectionPoint pipeline_failed, no pipelineResult, publishableReadiness false", () => {
    const lead = makeLead({
      readiness: EventLeadReadiness.READY,
      confidence: EventLeadConfidence.HIGH,
      id: createEventLeadId("del_fail01"),
    });
    const throwingRunner: PipelineRunner = () => {
      throw new Error("Simulated pipeline failure");
    };
    const result = runDiscoveryBackedPipeline(lead, undefined, throwingRunner);

    expect(result.leadId).toBe(lead.id);
    expect(result.conversionOutcome).toBe("converted");
    expect(result.observationId).toBe("obs_lead_fail01");
    expect(result.pipelineResult).toBeUndefined();
    expect(result.publishableReadiness).toBe(false);
    expect(result.rejectionPoint).toContain("pipeline_failed");
    expect(result.rejectionPoint).toContain("Simulated pipeline failure");
  });

  it("traceability: success result has leadId and observationId consistent with adapter (observation id from lead id)", () => {
    const leadId = createEventLeadId("del_trace99");
    const lead = makeLead({ id: leadId });
    const result = runDiscoveryBackedPipeline(lead);

    expect(result.leadId).toBe(leadId);
    expect(result.observationId).toBe("obs_lead_trace99");
    expect(String(result.leadId)).toBe("del_trace99");
  });
});

describe("runDiscoveryBackedPipelineFromLeads", () => {
  it("returns one result per lead in order; mixed converted and skipped", () => {
    const ready = makeLead({
      id: createEventLeadId("del_batch1"),
      readiness: EventLeadReadiness.READY,
      confidence: EventLeadConfidence.HIGH,
    });
    const skipped = makeLead({
      id: createEventLeadId("del_batch2"),
      readiness: EventLeadReadiness.NOT_READY,
      confidence: EventLeadConfidence.HIGH,
    });
    const { results } = runDiscoveryBackedPipelineFromLeads([ready, skipped]);

    expect(results).toHaveLength(2);
    expect(results[0].conversionOutcome).toBe("converted");
    expect(results[0].publishableReadiness).toBe(true);
    expect(results[1].conversionOutcome).toBe("skipped");
    expect(results[1].publishableReadiness).toBe(false);
  });
});
