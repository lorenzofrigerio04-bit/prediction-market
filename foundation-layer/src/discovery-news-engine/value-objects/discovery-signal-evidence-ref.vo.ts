import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { DiscoveryEvidenceRole } from "../enums/discovery-evidence-role.enum.js";

export type NormalizedExternalItemId = string;

export type DiscoverySignalEvidenceRef = Readonly<{
  itemId: NormalizedExternalItemId;
  role: DiscoveryEvidenceRole;
}>;

export const createDiscoverySignalEvidenceRef = (
  input: DiscoverySignalEvidenceRef,
): DiscoverySignalEvidenceRef =>
  deepFreeze({
    itemId: input.itemId,
    role: input.role,
  });
