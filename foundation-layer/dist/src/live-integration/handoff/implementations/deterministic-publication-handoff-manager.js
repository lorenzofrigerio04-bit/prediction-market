import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { HandoffStatus } from "../../enums/handoff-status.enum.js";
import { createPublicationHandoff } from "../entities/publication-handoff.entity.js";
import { createPublicationHandoffId } from "../../value-objects/publication-handoff-id.vo.js";
import { validatePublicationHandoff } from "../validators/validate-publication-handoff.js";
export class DeterministicPublicationHandoffManager {
    createHandoff(input) {
        const token = createDeterministicToken(`${input.publication_package_id}|${input.initiated_by}|${input.initiated_at}|${input.audit_ref}`);
        return createPublicationHandoff({
            id: createPublicationHandoffId(`phnd_${token}hnd`),
            version: input.version,
            publication_package_id: input.publication_package_id,
            handoff_status: HandoffStatus.PENDING,
            initiated_by: input.initiated_by,
            initiated_at: input.initiated_at,
            delivery_notes: input.delivery_notes,
            audit_ref: input.audit_ref,
        });
    }
    validateAuditLinkage(input) {
        return validatePublicationHandoff(input);
    }
}
//# sourceMappingURL=deterministic-publication-handoff-manager.js.map