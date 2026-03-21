import { deepFreeze } from "../../../common/utils/deep-freeze.js";

export type AuditFilterState = Readonly<{
  actor_refs: readonly string[];
  action_types: readonly string[];
  severity_levels: readonly string[];
}>;

export const createAuditFilterState = (input: AuditFilterState): AuditFilterState => deepFreeze({ ...input });
