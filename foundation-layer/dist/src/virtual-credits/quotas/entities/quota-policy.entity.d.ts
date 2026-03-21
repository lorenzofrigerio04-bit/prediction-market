import { AccountOwnerScope } from "../../enums/account-owner-scope.enum.js";
import { EnforcementMode } from "../../enums/enforcement-mode.enum.js";
import { QuotaType } from "../../enums/quota-type.enum.js";
import type { PolicyKey, QuotaPolicyId, Version, WindowDefinitionVo } from "../../value-objects/index.js";
export type QuotaPolicy = Readonly<{
    id: QuotaPolicyId;
    version: Version;
    policy_key: PolicyKey;
    target_scope: AccountOwnerScope;
    quota_type: QuotaType;
    max_amount: number;
    window_definition: WindowDefinitionVo;
    enforcement_mode: EnforcementMode;
    active: boolean;
}>;
export declare const createQuotaPolicy: (input: QuotaPolicy) => QuotaPolicy;
//# sourceMappingURL=quota-policy.entity.d.ts.map