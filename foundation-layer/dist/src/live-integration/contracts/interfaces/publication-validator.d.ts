import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { PublicationPackage } from "../../packaging/entities/publication-package.entity.js";
import type { PublicationHandoff } from "../../handoff/entities/publication-handoff.entity.js";
import type { SchedulingCandidate } from "../../scheduling/entities/scheduling-candidate.entity.js";
import type { LivePublicationContract } from "../entities/live-publication-contract.entity.js";
import type { DeliveryReadinessReport } from "../../readiness/entities/delivery-readiness-report.entity.js";
export type LiveIntegrationPipelineInput = Readonly<{
    publication_package: PublicationPackage;
    publication_handoff: PublicationHandoff;
    scheduling_candidate: SchedulingCandidate;
    live_publication_contract: LivePublicationContract;
    delivery_readiness_report: DeliveryReadinessReport;
}>;
export interface PublicationValidator {
    validatePackage(input: PublicationPackage): ValidationReport;
    validateHandoff(input: PublicationHandoff): ValidationReport;
    validateSchedulingCandidate(input: SchedulingCandidate): ValidationReport;
    validateLiveContract(input: LivePublicationContract): ValidationReport;
    validatePipeline(input: LiveIntegrationPipelineInput): ValidationReport;
}
//# sourceMappingURL=publication-validator.d.ts.map