import { CompatibilityStatus } from "../../enums/compatibility-status.enum.js";
import { createGovernanceCompatibilityViewId, createVersionTag } from "../../value-objects/index.js";
import { createAdminGovernanceCompatibilityView, } from "../entities/admin-governance-compatibility-view.entity.js";
import { validateAdminGovernanceCompatibilityView } from "../validators/validate-admin-governance-compatibility-view.js";
const unique = (values) => [...new Set(values)];
const denyFirstAllowed = (requested, denied) => {
    const deniedSet = new Set(denied);
    return unique(requested).filter((entry) => !deniedSet.has(entry));
};
export class PlatformAccessAdminGovernanceCompatibilityAdapter {
    buildPlatformAccessView(context) {
        const denied = unique(context.denied_operations);
        const requested = unique(context.requested_operations);
        const allowed = denyFirstAllowed(requested, denied);
        return createAdminGovernanceCompatibilityView({
            id: createGovernanceCompatibilityViewId("agc_platform_access_compat_01"),
            version: createVersionTag("v1.0.0"),
            module_key: context.module_key,
            requested_operations: requested,
            allowed_operations: allowed,
            denied_operations: denied,
            lossy_fields: context.lossy_fields,
            status: denied.length > 0 ? CompatibilityStatus.PARTIAL : CompatibilityStatus.CONSISTENT,
            metadata: context.metadata,
        });
    }
    buildOperationsConsoleView(context) {
        return this.buildPlatformAccessView(context);
    }
    buildVirtualCreditsView(context) {
        return this.buildPlatformAccessView(context);
    }
    validateCompatibility(view, context) {
        return validateAdminGovernanceCompatibilityView(view, undefined, context).isValid;
    }
}
//# sourceMappingURL=platform-access-admin-governance-compatibility.adapter.js.map