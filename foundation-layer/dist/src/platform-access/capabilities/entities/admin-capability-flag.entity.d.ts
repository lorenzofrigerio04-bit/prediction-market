import type { CapabilityFlagKey } from "../../value-objects/capability-flag-key.vo.js";
export type AdminCapabilityFlag = Readonly<{
    flag_key: CapabilityFlagKey;
    description: string;
    sensitive: boolean;
    default_enabled: boolean;
}>;
export declare const createAdminCapabilityFlag: (input: AdminCapabilityFlag) => AdminCapabilityFlag;
//# sourceMappingURL=admin-capability-flag.entity.d.ts.map