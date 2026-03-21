/**
 * Adapter: CandidateDraftContract (manual submission) → event-gen-v2 Candidate.
 * Used only for the MDE-authoritative manual submit path (admin operations).
 *
 * This path is binary-only: it always produces resolutionCriteriaYes/No and does not
 * go through SourceObservation, contract type selection, or rulebook/title generation.
 * For the full MDE pipeline from SourceObservation, see lib/mde-pipeline/README.md.
 */

import type { Candidate } from "../../event-gen-v2/types";
import type { CandidateDraftContract } from "./candidate-submission-adapter";

const MANUAL_SOURCE = "manual";
const MANUAL_TEMPLATE = "manual";
const DEFAULT_HOST = "manual.submission";
const DEFAULT_CRITERIA_YES = "Sì, come da fonte di risoluzione.";
const DEFAULT_CRITERIA_NO = "No, come da fonte di risoluzione.";

function hostFromUrl(url: string | null): string {
  if (!url?.trim()) return DEFAULT_HOST;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname || DEFAULT_HOST;
  } catch {
    return DEFAULT_HOST;
  }
}

/**
 * Converts a manual submission draft (+ normalized category) into a single
 * event-gen-v2 Candidate for rulebook → score → publishSelectedV2.
 */
export function manualDraftToCandidate(
  draft: CandidateDraftContract,
  normalizedCategory: string
): Candidate {
  const resolutionAuthorityHost = hostFromUrl(draft.resolutionSourceUrl);
  const desc = draft.description?.trim() || "";
  const resolutionCriteriaYes =
    desc.length > 0 ? desc.slice(0, 200) : DEFAULT_CRITERIA_YES;
  const resolutionCriteriaNo = DEFAULT_CRITERIA_NO;
  const resolutionCriteriaFull = `${resolutionCriteriaYes} | ${resolutionCriteriaNo}`;

  return {
    title: draft.title,
    description: desc || draft.title,
    category: normalizedCategory,
    closesAt: draft.closesAt,
    resolutionAuthorityHost,
    resolutionAuthorityType: "REPUTABLE",
    resolutionCriteriaYes,
    resolutionCriteriaNo,
    sourceStorylineId: MANUAL_SOURCE,
    templateId: MANUAL_TEMPLATE,
    resolutionSourceUrl: draft.resolutionSourceUrl,
    timezone: "Europe/Rome",
    resolutionCriteriaFull,
  };
}
