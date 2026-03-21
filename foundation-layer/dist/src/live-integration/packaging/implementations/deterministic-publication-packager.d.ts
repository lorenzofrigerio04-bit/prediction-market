import type { PublicationPackager, CreatePackageInput } from "../interfaces/publication-packager.js";
import { type PublicationPackage } from "../entities/publication-package.entity.js";
export declare class DeterministicPublicationPackager implements PublicationPackager {
    createPackage(input: CreatePackageInput): PublicationPackage;
    validatePackage(input: PublicationPackage): Readonly<{
        targetType: string;
        targetId: string;
        isValid: boolean;
        issues: readonly import("../../../index.js").ValidationIssue[];
        generatedAt: import("../../../index.js").Timestamp;
    }>;
}
//# sourceMappingURL=deterministic-publication-packager.d.ts.map