import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EventCandidateId, EventClusterId } from "../../value-objects/event-intelligence-ids.vo.js";
import type { SimilarityScore } from "../../value-objects/shared-domain.vo.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
import { ClusterStatus } from "../enums/cluster-status.enum.js";

export type EventCluster = Readonly<{
  cluster_id: EventClusterId;
  candidate_ids: readonly EventCandidateId[];
  similarity_scores: readonly SimilarityScore[];
  cluster_confidence: number;
  cluster_status: ClusterStatus;
}>;

export const createEventCluster = (input: EventCluster): EventCluster => {
  if (input.candidate_ids.length === 0) {
    throw new ValidationError("INVALID_EVENT_CLUSTER", "candidate_ids must contain at least one id");
  }
  if (new Set(input.candidate_ids).size !== input.candidate_ids.length) {
    throw new ValidationError("INVALID_EVENT_CLUSTER", "candidate_ids must be unique");
  }
  assertConfidence01(input.cluster_confidence, "cluster_confidence");
  return deepFreeze({
    ...input,
    candidate_ids: [...input.candidate_ids],
    similarity_scores: [...input.similarity_scores],
  });
};
