import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CapabilityFlagKey } from "../../value-objects/capability-flag-key.vo.js";

export type AdminCapabilityFlag = Readonly<{
  flag_key: CapabilityFlagKey;
  description: string;
  sensitive: boolean;
  default_enabled: boolean;
}>;

export const createAdminCapabilityFlag = (input: AdminCapabilityFlag): AdminCapabilityFlag =>
  deepFreeze({ ...input });
