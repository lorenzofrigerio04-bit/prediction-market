import type { CreditsCompatibilityView } from "../entities/credits-compatibility-view.entity.js";
import type { ActionKey, Note, OwnerRef, RelatedRef, VirtualCreditAccountId } from "../../value-objects/index.js";
export type CreditsCompatibilityContext = Readonly<{
    owner_ref: OwnerRef;
    access_scope_ref: RelatedRef;
    account_ref_nullable: VirtualCreditAccountId | null;
    visible_balance_nullable: number | null;
    active_quota_refs: readonly RelatedRef[];
    active_risk_flags: readonly RelatedRef[];
    allowed_actions: readonly ActionKey[];
    warnings: readonly Note[];
}>;
export interface CreditsCompatibilityAdapter {
    buildOperationsConsoleUsageView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    buildAccessScopedCreditView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    buildEditorialUsageGuardView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    validateCompatibility(view: CreditsCompatibilityView, context?: CreditsCompatibilityContext): boolean;
}
//# sourceMappingURL=credits-compatibility-adapter.d.ts.map