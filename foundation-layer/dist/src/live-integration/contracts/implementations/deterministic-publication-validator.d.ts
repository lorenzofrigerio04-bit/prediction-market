import { type ValidationIssue } from "../../../entities/validation-report.entity.js";
import type { LiveIntegrationPipelineInput, PublicationValidator } from "../interfaces/publication-validator.js";
export declare class DeterministicPublicationValidator implements PublicationValidator {
    validatePackage(input: LiveIntegrationPipelineInput["publication_package"]): Readonly<{
        targetType: string;
        targetId: string;
        isValid: boolean;
        issues: readonly ValidationIssue[];
        generatedAt: import("../../../index.js").Timestamp;
    }>;
    validateHandoff(input: LiveIntegrationPipelineInput["publication_handoff"]): Readonly<{
        targetType: string;
        targetId: string;
        isValid: boolean;
        issues: readonly ValidationIssue[];
        generatedAt: import("../../../index.js").Timestamp;
    }>;
    validateSchedulingCandidate(input: LiveIntegrationPipelineInput["scheduling_candidate"]): Readonly<{
        targetType: string;
        targetId: string;
        isValid: boolean;
        issues: readonly ValidationIssue[];
        generatedAt: import("../../../index.js").Timestamp;
    }>;
    validateLiveContract(input: LiveIntegrationPipelineInput["live_publication_contract"]): Readonly<{
        targetType: string;
        targetId: string;
        isValid: boolean;
        issues: readonly ValidationIssue[];
        generatedAt: import("../../../index.js").Timestamp;
    }>;
    validatePipeline(input: LiveIntegrationPipelineInput): Readonly<{
        targetType: string;
        targetId: string;
        isValid: boolean;
        issues: readonly ValidationIssue[];
        generatedAt: import("../../../index.js").Timestamp;
    }>;
}
//# sourceMappingURL=deterministic-publication-validator.d.ts.map