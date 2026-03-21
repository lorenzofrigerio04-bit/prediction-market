import { ConsistencyStatus } from "../../enums/consistency-status.enum.js";
import { createNote } from "../../value-objects/index.js";
import { createCreditsCompatibilityView } from "../entities/credits-compatibility-view.entity.js";
import { validateCreditsCompatibility } from "../validators/validate-credits-compatibility.js";
export class OperationsConsoleCreditsCompatibilityAdapter {
    buildOperationsConsoleUsageView(context) {
        const hasScope = context.access_scope_ref.length > 0;
        return createCreditsCompatibilityView({
            id: context.access_scope_ref,
            owner_ref: context.owner_ref,
            access_scope_ref: context.access_scope_ref,
            account_ref_nullable: hasScope ? context.account_ref_nullable : null,
            visible_balance_nullable: hasScope ? context.visible_balance_nullable : null,
            active_quota_refs: context.active_quota_refs,
            active_risk_flags: context.active_risk_flags,
            allowed_actions: hasScope ? context.allowed_actions : [],
            warnings: hasScope ? context.warnings : [createNote("missing scope, deny-first view applied")],
            compatibility_status: hasScope ? ConsistencyStatus.CONSISTENT : ConsistencyStatus.FAILED,
        });
    }
    buildAccessScopedCreditView(context) {
        return this.buildOperationsConsoleUsageView(context);
    }
    buildEditorialUsageGuardView(context) {
        return createCreditsCompatibilityView({
            ...this.buildOperationsConsoleUsageView(context),
            allowed_actions: context.allowed_actions.filter((action) => action.startsWith("editorial.")),
            compatibility_status: ConsistencyStatus.PARTIAL,
        });
    }
    validateCompatibility(view, context) {
        return validateCreditsCompatibility(view, undefined, context).isValid;
    }
}
//# sourceMappingURL=operations-console-credits-compatibility.adapter.js.map