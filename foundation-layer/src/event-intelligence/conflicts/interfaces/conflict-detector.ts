import type { EventCandidate } from "../../candidates/entities/event-candidate.entity.js";
import type { CanonicalEventIntelligence } from "../../canonicalization/entities/canonical-event.entity.js";
import type { EventConflict } from "../entities/event-conflict.entity.js";

export interface ConflictDetector {
  detect(input: readonly EventCandidate[] | readonly CanonicalEventIntelligence[]): readonly EventConflict[];
}
