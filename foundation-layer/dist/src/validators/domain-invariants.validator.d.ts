import { type ValidationIssue } from "../entities/validation-report.entity.js";
import type { MarketOutcome } from "../entities/market-outcome.entity.js";
import type { CanonicalEvent } from "../entities/canonical-event.entity.js";
import type { CandidateMarket } from "../entities/candidate-market.entity.js";
import type { EventSignal } from "../entities/event-signal.entity.js";
import type { SourceRecord } from "../entities/source-record.entity.js";
import type { StructuredClaim } from "../entities/structured-claim.entity.js";
import type { WorkflowInstance } from "../entities/workflow-instance.entity.js";
export declare const validateSourceRecordInvariants: (sourceRecord: SourceRecord) => readonly ValidationIssue[];
export declare const validateEventSignalInvariants: (eventSignal: EventSignal) => readonly ValidationIssue[];
export declare const validateCanonicalEventInvariants: (canonicalEvent: CanonicalEvent) => readonly ValidationIssue[];
export declare const validateStructuredClaimInvariants: (structuredClaim: StructuredClaim) => readonly ValidationIssue[];
export declare const validateCandidateMarketInvariants: (candidateMarket: CandidateMarket) => readonly ValidationIssue[];
export declare const validateMarketOutcomeInvariants: (marketOutcome: MarketOutcome) => readonly ValidationIssue[];
export declare const validateWorkflowInstanceInvariants: (workflowInstance: WorkflowInstance) => readonly ValidationIssue[];
//# sourceMappingURL=domain-invariants.validator.d.ts.map