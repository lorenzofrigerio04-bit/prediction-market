import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { HandoffStatus } from "../../enums/handoff-status.enum.js";
import {
  createAuditReference,
  type AuditReference,
} from "../../value-objects/audit-reference.vo.js";
import { createContractVersion, type ContractVersion } from "../../value-objects/contract-version.vo.js";
import { createDeliveryNote, type DeliveryNote } from "../../value-objects/delivery-note.vo.js";
import {
  createPublicationHandoffId,
  type PublicationHandoffId,
} from "../../value-objects/publication-handoff-id.vo.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createPublicationPackageId } from "../../value-objects/publication-package-id.vo.js";

export type PublicationHandoff = Readonly<{
  id: PublicationHandoffId;
  version: ContractVersion;
  publication_package_id: PublicationPackageId;
  handoff_status: HandoffStatus;
  initiated_by: string;
  initiated_at: Timestamp;
  delivery_notes: readonly DeliveryNote[];
  audit_ref: AuditReference;
}>;

export type PublicationHandoffInput = Readonly<{
  id: string;
  version: string;
  publication_package_id: string;
  handoff_status: HandoffStatus;
  initiated_by: string;
  initiated_at: string;
  delivery_notes: readonly string[];
  audit_ref: string;
}>;

export const createPublicationHandoff = (input: PublicationHandoffInput): PublicationHandoff => {
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
