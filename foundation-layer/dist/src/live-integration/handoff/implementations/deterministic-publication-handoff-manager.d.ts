import { type PublicationHandoff } from "../entities/publication-handoff.entity.js";
import type { PublicationHandoffManager, CreateHandoffInput } from "../interfaces/publication-handoff-manager.js";
export declare class DeterministicPublicationHandoffManager implements PublicationHandoffManager {
    createHandoff(input: CreateHandoffInput): PublicationHandoff;
    validateAuditLinkage(input: PublicationHandoff): Readonly<{
        targetType: string;
        targetId: string;
        isValid: boolean;
        issues: readonly import("../../../index.js").ValidationIssue[];
        generatedAt: import("../../../index.js").Timestamp;
    }>;
}
//# sourceMappingURL=deterministic-publication-handoff-manager.d.ts.map