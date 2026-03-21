/**
 * Tests for pipelineArtifactsToAppCandidate adapter.
 * Ensures MDE pipeline artifacts (including generic BINARY semantic_definition)
 * produce a Candidate that passes rulebook validation (title vs criteria).
 */

import { describe, it, expect } from "vitest";
import { pipelineArtifactsToAppCandidate } from "../publishable-to-app-candidate";
import { validateCandidates } from "@/lib/event-gen-v2/rulebook-validator";

const futureClose = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

function makeArtifacts(overrides: {
  title?: string;
  semanticYes?: string;
  semanticNo?: string;
} = {}) {
  const title = overrides.title ?? "Reported event: Bitcoin supererà 100k entro 2025?";
  const semanticYes =
    overrides.semanticYes ?? "Resolves true when the statement is satisfied.";
  const semanticNo =
    overrides.semanticNo ?? "Resolves false when the statement is not satisfied.";
  return {
    titleSet: {
      display_title: title,
      canonical_title: title.endsWith("?") ? title : `${title}?`,
    },
    resolutionSummary: { one_line_resolution_summary: "Binary outcome." },
    pipeline: {
      canonical_event: { category: "general" },
      deadline_resolution: { market_close_time: futureClose },
      outcome_generation_result: {
        outcomes: [
          { display_label: "Yes", semantic_definition: semanticYes },
          { display_label: "No", semantic_definition: semanticNo },
        ],
      },
    },
  };
}

describe("pipelineArtifactsToAppCandidate", () => {
  it("builds candidate with generic MDE BINARY semantic that passes rulebook title-vs-criteria", () => {
    const artifacts = makeArtifacts();
    const candidate = pipelineArtifactsToAppCandidate(artifacts);
    // Titolo sanitizzato: rimosso prefisso "Reported event:"
    expect(candidate.title).toBe("Bitcoin supererà 100k entro 2025?");
    expect(candidate.resolutionCriteriaYes).toContain("Riferimento:");
    expect(candidate.resolutionCriteriaYes).toContain(candidate.title);
    expect(candidate.resolutionCriteriaNo).toContain("Riferimento:");
    expect(candidate.resolutionCriteriaNo).toContain(candidate.title);

    const result = validateCandidates([candidate]);
    expect(result.rejected).toHaveLength(0);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0]?.rulebookValid).toBe(true);
  });

  it("includes title reference in criteria when semantic is empty (fallback)", () => {
    const artifacts = makeArtifacts({
      semanticYes: "",
      semanticNo: "",
    });
    const candidate = pipelineArtifactsToAppCandidate(artifacts);
    expect(candidate.resolutionCriteriaYes).toContain("Riferimento:");
    expect(candidate.resolutionCriteriaYes).toContain(candidate.title);
    expect(candidate.resolutionCriteriaNo).toContain("Riferimento:");
    expect(candidate.resolutionCriteriaNo).toContain(candidate.title);

    const result = validateCandidates([candidate]);
    expect(result.rejected).toHaveLength(0);
    expect(result.valid).toHaveLength(1);
  });

  it("strips Reported event: prefix and deduplicates repeated phrase in title", () => {
    const repeated =
      "Otello apre la stagione della Scala, poi nel 2027 Verdi con regia di Guadagnino Otello apre la stagione della Scala, poi nel 2027 Verdi con regia di Guadagnino";
    const artifacts = makeArtifacts({
      title: `Reported event: ${repeated}`,
    });
    const candidate = pipelineArtifactsToAppCandidate(artifacts);
    expect(candidate.title).toBe(
      "Otello apre la stagione della Scala, poi nel 2027 Verdi con regia di Guadagnino?"
    );
  });
});
