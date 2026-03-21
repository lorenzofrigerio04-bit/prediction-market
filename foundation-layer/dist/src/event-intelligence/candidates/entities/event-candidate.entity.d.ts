import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { SourceObservationId } from "../../../observations/value-objects/source-observation-id.vo.js";
import type { EventCandidateId } from "../../value-objects/event-intelligence-ids.vo.js";
import type { ActionReference, EvidenceSpan, JurisdictionReference, ObjectReference, SubjectReference, TemporalWindow } from "../../value-objects/shared-domain.vo.js";
import { CandidateStatus } from "../enums/candidate-status.enum.js";
export type EventCandidate = Readonly<{
    id: EventCandidateId;
    version: EntityVersion;
    observation_ids: readonly SourceObservationId[];
    subject_candidate: SubjectReference;
    action_candidate: ActionReference;
    object_candidate_nullable: ObjectReference | null;
    temporal_window_candidate: TemporalWindow;
    jurisdiction_candidate_nullable: JurisdictionReference | null;
    category_candidate: string;
    extraction_confidence: number;
    evidence_spans: readonly EvidenceSpan[];
    candidate_status: CandidateStatus;
}>;
export declare const createEventCandidate: (input: EventCandidate) => EventCandidate;
//# sourceMappingURL=event-candidate.entity.d.ts.map