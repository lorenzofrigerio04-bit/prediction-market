import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";

export type PermissionBasis = Readonly<{
  roles: readonly string[];
  explicit_allow_actions: readonly ActionKey[];
  explicit_deny_actions: readonly ActionKey[];
  deny_first: boolean;
}>;

export const createPermissionBasis = (input: PermissionBasis): PermissionBasis => deepFreeze({ ...input });
