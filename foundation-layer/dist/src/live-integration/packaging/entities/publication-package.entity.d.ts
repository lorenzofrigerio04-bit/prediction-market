import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { type PublicationReadyArtifactId } from "../../../editorial/value-objects/editorial-ids.vo.js";
import { PackageStatus } from "../../enums/package-status.enum.js";
import type { PublicationMetadata } from "../../metadata/entities/publication-metadata.entity.js";
import { type PackageVersion } from "../../value-objects/package-version.vo.js";
import { type PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { type PublicationArtifact } from "./publication-artifact.entity.js";
export type PublicationPackage = Readonly<{
    id: PublicationPackageId;
    version: PackageVersion;
    publication_ready_artifact_id: PublicationReadyArtifactId;
    packaged_artifacts: readonly PublicationArtifact[];
    package_metadata: PublicationMetadata;
    package_status: PackageStatus;
    created_at: Timestamp;
}>;
export type PublicationPackageInput = Readonly<{
    id: string;
    version: string;
    publication_ready_artifact_id: string;
    packaged_artifacts: readonly PublicationArtifact[];
    package_metadata: PublicationMetadata;
    package_status: PackageStatus;
    created_at: string;
}>;
export declare const createPublicationPackage: (input: PublicationPackageInput) => PublicationPackage;
//# sourceMappingURL=publication-package.entity.d.ts.map