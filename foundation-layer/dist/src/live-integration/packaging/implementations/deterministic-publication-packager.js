import { createPublicationReadyArtifactId } from "../../../editorial/value-objects/editorial-ids.vo.js";
import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { FinalReadinessStatus } from "../../../editorial/enums/final-readiness-status.enum.js";
import { PackageStatus } from "../../enums/package-status.enum.js";
import { createPublicationPackage } from "../entities/publication-package.entity.js";
import { createPublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { validatePublicationPackage } from "../validators/validate-publication-package.js";
const toPackageStatus = (status) => status === FinalReadinessStatus.APPROVED ? PackageStatus.VALIDATED : PackageStatus.INVALID;
export class DeterministicPublicationPackager {
    createPackage(input) {
        const token = createDeterministicToken(`${input.publication_ready_artifact.id}|${input.version}|${input.created_at}`);
        const packageStatus = toPackageStatus(input.publication_ready_artifact.final_readiness_status);
        return createPublicationPackage({
            id: createPublicationPackageId(`ppkg_${token}pkg`),
            version: input.version,
            publication_ready_artifact_id: createPublicationReadyArtifactId(input.publication_ready_artifact.id),
            packaged_artifacts: input.packaged_artifacts,
            package_metadata: input.package_metadata,
            package_status: packageStatus,
            created_at: input.created_at,
        });
    }
    validatePackage(input) {
        return validatePublicationPackage(input);
    }
}
//# sourceMappingURL=deterministic-publication-packager.js.map