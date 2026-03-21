import { describe, expect, it } from "vitest";
import {
  eventLeadToSourceObservationAdapter,
  createEventLead,
  createEventLeadId,
  createDiscoveryStoryClusterId,
  createEventLeadEvidenceSet,
  createEventLeadReason,
  EventLeadStatus,
  EventLeadReadiness,
  EventLeadConfidence,
} from "../../src/discovery-news-engine/index.js";
import type { DiscoverySignalId } from "../../src/discovery-news-engine/value-objects/discovery-signal-id.vo.js";
import { validateSourceObservation } from "@/observations/validators/validate-source-observation.js";

const clusterId = createDiscoveryStoryClusterId("dsc_test001");

function makeLead(overrides: {
  id?: ReturnType<typeof createEventLeadId>;
  readiness?: EventLeadReadiness;
  confidence?: EventLeadConfidence;
  hypothesisSummary?: string;
  memberItemIds?: readonly string[];
  memberSignalIds?: readonly string[];
  representativeHeadlineNullable?: string | null;
} = {}) {
  const id = overrides.id ?? createEventLeadId("del_fixture1");
  const evidenceSet = createEventLeadEvidenceSet({
    clusterId,
    memberItemIds: overrides.memberItemIds ?? ["item1", "item2"],
    representativeHeadlineNullable: overrides.representativeHeadlineNullable ?? "Test headline",
    ...(overrides.memberSignalIds != null && overrides.memberSignalIds.length > 0
      ? { memberSignalIds: overrides.memberSignalIds as readonly DiscoverySignalId[] }
      : {}),
  });
  return createEventLead({
    id,
    sourceClusterId: clusterId,
    status: EventLeadStatus.EXTRACTED,
    readiness: overrides.readiness ?? EventLeadReadiness.READY,
    confidence: overrides.confidence ?? EventLeadConfidence.HIGH,
    hypothesisSummary: overrides.hypothesisSummary ?? "Event hypothesis summary for testing.",
    evidenceSet,
    reasons: [createEventLeadReason({ code: "test", label: "Test", impact: "positive" })],
  });
}

describe("eventLeadToSourceObservationAdapter", () => {
  it("READY + HIGH confidence produces converted observation and validateSourceObservation passes", () => {
    const lead = makeLead({ readiness: EventLeadReadiness.READY, confidence: EventLeadConfidence.HIGH });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.outcome).toBe("converted");
    expect(result.leadId).toBe(lead.id);
    expect(result.observation).toBeDefined();
    expect(result.clusterId).toBe(clusterId);

    const observation = result.observation!;
    const report = validateSourceObservation(observation);
    expect(report.isValid).toBe(true);

    expect(String(observation.id)).toBe("obs_lead_fixture1");
    expect(observation.normalizedSummaryNullable).toBe("Event hypothesis summary for testing.");
    expect(observation.evidenceSpans.length).toBeGreaterThanOrEqual(1);
    expect(observation.sourceConfidence).toBe(0.9);
  });

  it("READY + MEDIUM confidence produces converted observation with confidence 0.6", () => {
    const lead = makeLead({ readiness: EventLeadReadiness.READY, confidence: EventLeadConfidence.MEDIUM });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.outcome).toBe("converted");
    expect(result.observation).toBeDefined();
    expect(result.observation!.sourceConfidence).toBe(0.6);
  });

  it("LOW confidence leads to skipped with reasonCode low_confidence", () => {
    const lead = makeLead({ readiness: EventLeadReadiness.READY, confidence: EventLeadConfidence.LOW });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.outcome).toBe("skipped");
    expect(result.reasonCode).toBe("low_confidence");
    expect(result.observation).toBeUndefined();
    expect(result.leadId).toBe(lead.id);
  });

  it("NOT_READY leads to skipped with reasonCode not_ready", () => {
    const lead = makeLead({ readiness: EventLeadReadiness.NOT_READY, confidence: EventLeadConfidence.HIGH });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.outcome).toBe("skipped");
    expect(result.reasonCode).toBe("not_ready");
    expect(result.observation).toBeUndefined();
    expect(result.leadId).toBe(lead.id);
  });

  it("empty memberItemIds and no memberSignalIds leads to rejected with reasonCode incomplete_evidence", () => {
    const lead = makeLead({ memberItemIds: [] });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.outcome).toBe("rejected");
    expect(result.reasonCode).toBe("incomplete_evidence");
    expect(result.observation).toBeUndefined();
    expect(result.leadId).toBe(lead.id);
  });

  it("memberSignalIds only (empty memberItemIds) produces converted observation with signal evidence span", () => {
    const lead = makeLead({
      memberItemIds: [],
      memberSignalIds: ["sig1"],
      hypothesisSummary: "Signal-only hypothesis for testing",
    });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.outcome).toBe("converted");
    expect(result.leadId).toBe(lead.id);
    expect(result.observation).toBeDefined();
    expect(result.clusterId).toBe(clusterId);

    const observation = result.observation!;
    const report = validateSourceObservation(observation);
    expect(report.isValid).toBe(true);

    expect(observation.evidenceSpans.length).toBeGreaterThanOrEqual(2);
    const hypothesisSpan = observation.evidenceSpans.find((s) => s.locator === "discovery://hypothesis");
    expect(hypothesisSpan).toBeDefined();
    const signalSpan = observation.evidenceSpans.find((s) => s.locator === "discovery://signal/sig1");
    expect(signalSpan).toBeDefined();
  });

  it("empty hypothesisSummary leads to rejected with reasonCode missing_hypothesis", () => {
    const lead = makeLead({ hypothesisSummary: "   " });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.outcome).toBe("rejected");
    expect(result.reasonCode).toBe("missing_hypothesis");
    expect(result.observation).toBeUndefined();
  });

  it("converted observation has provenance and evidence mapping referencing EventLead", () => {
    const lead = makeLead({
      id: createEventLeadId("del_prov123"),
      hypothesisSummary: "Provenance test hypothesis",
    });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.outcome).toBe("converted");
    const obs = result.observation!;
    expect(obs.traceabilityMetadata.provenanceChain).toContain("discovery");
    expect(obs.traceabilityMetadata.provenanceChain).toContain("event-lead-to-source-observation");
    expect(obs.traceabilityMetadata.provenanceChain).toContain("del_prov123");
    expect(obs.traceabilityMetadata.provenanceChain).toContain(String(clusterId));
    expect(obs.traceabilityMetadata.mappingStrategyIds).toContain("event-lead-to-source-observation");
    expect(obs.sourceReference.reference).toBe("discovery://event-lead/del_prov123");
  });

  it("explainability: result always has leadId; converted observation provenance references same lead", () => {
    const lead = makeLead({ id: createEventLeadId("del_explain1") });
    const result = eventLeadToSourceObservationAdapter.convert(lead);

    expect(result.leadId).toBe(lead.id);
    if (result.outcome === "converted") {
      expect(result.observation!.traceabilityMetadata.provenanceChain).toContain("del_explain1");
    }
  });
});
