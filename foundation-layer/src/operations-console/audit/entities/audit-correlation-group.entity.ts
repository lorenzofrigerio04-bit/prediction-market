import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CorrelationGroupRef } from "../../value-objects/correlation-group-ref.vo.js";

export type AuditCorrelationGroup = Readonly<{
  group_ref: CorrelationGroupRef;
  item_refs: readonly string[];
}>;

export const createAuditCorrelationGroup = (input: AuditCorrelationGroup): AuditCorrelationGroup =>
  deepFreeze({ ...input });
