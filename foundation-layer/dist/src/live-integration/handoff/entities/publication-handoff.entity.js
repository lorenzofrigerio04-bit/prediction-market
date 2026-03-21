import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { HandoffStatus } from "../../enums/handoff-status.enum.js";
import { createAuditReference, } from "../../value-objects/audit-reference.vo.js";
import { createContractVersion } from "../../value-objects/contract-version.vo.js";
import { createDeliveryNote } from "../../value-objects/delivery-note.vo.js";
import { createPublicationHandoffId, } from "../../value-objects/publication-handoff-id.vo.js";
import { createPublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
export const createPublicationHandoff = (input) => {
    const initiatedBy = input.initiated_by.trim();
    if (initiatedBy.length === 0) {
        throw new ValidationError("INVALID_PUBLICATION_HANDOFF", "initiated_by is required");
    }
    if (!Object.values(HandoffStatus).includes(input.handoff_status)) {
        throw new ValidationError("INVALID_PUBLICATION_HANDOFF", "handoff_status is invalid");
    }
    return deepFreeze({
        id: createPublicationHandoffId(input.id),
        version: createContractVersion(input.version),
        publication_package_id: createPublicationPackageId(input.publication_package_id),
        handoff_status: input.handoff_status,
        initiated_by: initiatedBy,
        initiated_at: createTimestamp(input.initiated_at),
        delivery_notes: deepFreeze(input.delivery_notes.map(createDeliveryNote)),
        audit_ref: createAuditReference(input.audit_ref),
    });
};
//# sourceMappingURL=publication-handoff.entity.js.map