import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { GuardrailSeverity } from "../../enums/guardrail-severity.enum.js";
import type {
  GuardrailPolicyId,
  Metadata,
  ModuleKey,
  OperationKey,
  VersionTag,
} from "../../value-objects/index.js";

export type GuardrailPolicy = Readonly<{
  id: GuardrailPolicyId;
  version: VersionTag;
  module_key: ModuleKey;
  operation_key: OperationKey;
  severity: GuardrailSeverity;
  deny_by_default: boolean;
  active: boolean;
  metadata: Metadata;
}>;

export const createGuardrailPolicy = (input: GuardrailPolicy): GuardrailPolicy => deepFreeze({ ...input });
