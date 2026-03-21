import type { PublicationReadyArtifact } from "../../../editorial/readiness/entities/publication-ready-artifact.entity.js";
import type { ValidationReport } from "../../../entities/validation-report.entity.js";
import type { PublicationMetadata } from "../../metadata/entities/publication-metadata.entity.js";
import type { PublicationArtifact } from "../entities/publication-artifact.entity.js";
import type { PublicationPackage } from "../entities/publication-package.entity.js";
export type CreatePackageInput = Readonly<{
    publication_ready_artifact: PublicationReadyArtifact;
    packaged_artifacts: readonly PublicationArtifact[];
    package_metadata: PublicationMetadata;
    created_at: string;
    version: string;
}>;
export interface PublicationPackager {
    createPackage(input: CreatePackageInput): PublicationPackage;
    validatePackage(input: PublicationPackage): ValidationReport;
}
//# sourceMappingURL=publication-packager.d.ts.map