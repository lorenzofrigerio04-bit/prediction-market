import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { createPublicationReadyArtifactId, } from "../../../editorial/value-objects/editorial-ids.vo.js";
import { PackageStatus } from "../../enums/package-status.enum.js";
import { createPublicationMetadata } from "../../metadata/entities/publication-metadata.entity.js";
import { createPackageVersion, } from "../../value-objects/package-version.vo.js";
import { createPublicationPackageId, } from "../../value-objects/publication-package-id.vo.js";
import { createPublicationArtifact } from "./publication-artifact.entity.js";
export const createPublicationPackage = (input) => {
    if (input.packaged_artifacts.length === 0) {
        throw new ValidationError("INVALID_PUBLICATION_PACKAGE", "packaged_artifacts must not be empty");
    }
    if (!Object.values(PackageStatus).includes(input.package_status)) {
        throw new ValidationError("INVALID_PUBLICATION_PACKAGE", "package_status is invalid");
    }
    const artifacts = input.packaged_artifacts.map(createPublicationArtifact);
    return deepFreeze({
        id: createPublicationPackageId(input.id),
        version: createPackageVersion(input.version),
        publication_ready_artifact_id: createPublicationReadyArtifactId(input.publication_ready_artifact_id),
        packaged_artifacts: deepFreeze([...artifacts]),
        package_metadata: createPublicationMetadata(input.package_metadata),
        package_status: input.package_status,
        created_at: createTimestamp(input.created_at),
    });
};
//# sourceMappingURL=publication-package.entity.js.map