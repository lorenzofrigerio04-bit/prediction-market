import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type ObservationInterpretationId = Branded<string, "ObservationInterpretationId">;
export type EventCandidateId = Branded<string, "EventCandidateId">;
export type CanonicalEventIntelligenceId = Branded<string, "CanonicalEventIntelligenceId">;
export type EventGraphNodeId = Branded<string, "EventGraphNodeId">;
export type EventRelationId = Branded<string, "EventRelationId">;
export type EventClusterId = Branded<string, "EventClusterId">;
export type EventConflictId = Branded<string, "EventConflictId">;

export const createObservationInterpretationId = (
  value: string,
): ObservationInterpretationId =>
  createPrefixedId(value, "oint_", "ObservationInterpretationId") as ObservationInterpretationId;

export const createEventCandidateId = (value: string): EventCandidateId =>
  createPrefixedId(value, "ecnd_", "EventCandidateId") as EventCandidateId;

export const createCanonicalEventIntelligenceId = (
  value: string,
): CanonicalEventIntelligenceId =>
  createPrefixedId(value, "cevt_", "CanonicalEventIntelligenceId") as CanonicalEventIntelligenceId;

export const createEventGraphNodeId = (value: string): EventGraphNodeId =>
  createPrefixedId(value, "egnd_", "EventGraphNodeId") as EventGraphNodeId;

export const createEventRelationId = (value: string): EventRelationId =>
  createPrefixedId(value, "erel_", "EventRelationId") as EventRelationId;

export const createEventClusterId = (value: string): EventClusterId =>
  createPrefixedId(value, "eclu_", "EventClusterId") as EventClusterId;

export const createEventConflictId = (value: string): EventConflictId =>
  createPrefixedId(value, "ecfl_", "EventConflictId") as EventConflictId;
