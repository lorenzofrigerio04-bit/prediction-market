import { ConsistencyStatus } from "../../enums/consistency-status.enum.js";
import { createCreditsCompatibilityView } from "../entities/credits-compatibility-view.entity.js";
import { validateCreditsCompatibility } from "../validators/validate-credits-compatibility.js";
export class PlatformAccessCreditsCompatibilityAdapter {
    buildOperationsConsoleUsageView(context) {
        return createCreditsCompatibilityView({
            id: context.access_scope_ref,
            owner_ref: context.owner_ref,
            access_scope_ref: context.access_scope_ref,
            account_ref_nullable: context.account_ref_nullable,
            visible_balance_nullable: null,
            active_quota_refs: context.active_quota_refs,
            active_risk_flags: context.active_risk_flags,
            allowed_actions: context.allowed_actions,
            warnings: context.warnings,
            compatibility_status: ConsistencyStatus.PARTIAL,
        });
    }
    buildAccessScopedCreditView(context) {
        return createCreditsCompatibilityView({
            id: context.access_scope_ref,
            owner_ref: context.owner_ref,
            access_scope_ref: context.access_scope_ref,
            account_ref_nullable: context.account_ref_nullable,
            visible_balance_nullable: context.visible_balance_nullable,
            active_quota_refs: context.active_quota_refs,
            active_risk_flags: context.active_risk_flags,
            allowed_actions: context.allowed_actions,
            warnings: context.warnings,
            compatibility_status: ConsistencyStatus.CONSISTENT,
        });
    }
    buildEditorialUsageGuardView(context) {
        return createCreditsCompatibilityView({
            id: context.access_scope_ref,
            owner_ref: context.owner_ref,
            access_scope_ref: context.access_scope_ref,
            account_ref_nullable: context.account_ref_nullable,
            visible_balance_nullable: null,
            active_quota_refs: context.active_quota_refs,
            active_risk_flags: context.active_risk_flags,
            allowed_actions: context.allowed_actions.filter((action) => action.startsWith("editorial.")),
            warnings: context.warnings,
            compatibility_status: ConsistencyStatus.PARTIAL,
        });
    }
    validateCompatibility(view, context) {
        return validateCreditsCompatibility(view, undefined, context).isValid;
    }
}
//# sourceMappingURL=platform-access-credits-compatibility.adapter.js.map